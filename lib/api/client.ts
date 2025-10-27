// Base API client configuration for FastAPI backend integration

import { API_TIMEOUT, RETRY } from "@/lib/constants/timings";
import { logger } from "@/lib/utils/logger";

// Read API_DISABLED from environment variable
export const API_DISABLED =
	process.env.NEXT_PUBLIC_DISABLE_API === "1" ||
	process.env.NEXT_PUBLIC_DISABLE_API === "true";

// Validate API_BASE_URL is set when API is enabled
const API_BASE_URL = (() => {
	const url = process.env.NEXT_PUBLIC_API_BASE_URL;

	if (!(API_DISABLED || url)) {
		const errorMsg =
			"NEXT_PUBLIC_API_BASE_URL is not defined in environment variables";
		logger.error(errorMsg, new Error(errorMsg), "APIClient");
		throw new Error(
			"API configuration error: NEXT_PUBLIC_API_BASE_URL is required when API is enabled",
		);
	}

	return url || "http://localhost:8000/api/v1";
})();

type JsonLike = Record<string, unknown>;

interface APIError {
	message: string;
	code?: string;
	details?: JsonLike;
}

class APIClientError extends Error {
	code?: string | undefined;
	details?: Record<string, any> | undefined;

	constructor(error: APIError) {
		super(error.message);
		this.name = "APIClientError";
		this.code = error.code;
		this.details = error.details;
	}
}

interface RequestConfig {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	headers?: Record<string, string>;
	body?: BodyInit | JsonLike;
	timeout?: number;
}

class APIClient {
	private baseURL: string;
	private defaultHeaders: Record<string, string>;
	private onUnauthorized?: () => void;

	constructor(baseURL: string = API_BASE_URL) {
		this.baseURL = baseURL;
		this.defaultHeaders = {
			"Content-Type": "application/json",
		};
	}

	// Set callback for 401 errors
	setUnauthorizedHandler(handler: () => void) {
		this.onUnauthorized = handler;
	}

	// Set authentication token
	setAuthToken(token: string) {
		this.defaultHeaders.Authorization = `Bearer ${token}`;
	}

	// Remove authentication token
	clearAuthToken() {
		delete this.defaultHeaders.Authorization;
	}

	// Generic request method with retry logic
	async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
		if (API_DISABLED) {
			throw new APIClientError({
				message: "API disabled in FE-only mode",
				code: "API_DISABLED",
			});
		}

		const {
			method = "GET",
			headers = {},
			body,
			timeout = API_TIMEOUT.DEFAULT,
		} = config;

		// Simple retry logic with exponential backoff
		let lastError: Error | undefined;
		let delay: number = RETRY.INITIAL_DELAY;

		for (let attempt = 0; attempt <= RETRY.MAX_ATTEMPTS; attempt++) {
			try {
				const url = `${this.baseURL}${endpoint}`;

				const requestConfig: RequestInit = {
					method,
					headers: {
						...this.defaultHeaders,
						...headers,
					},
					signal: AbortSignal.timeout(timeout),
				};

				const shouldAttachBody = body !== undefined && method !== "GET";

				if (shouldAttachBody) {
					if (
						body instanceof FormData ||
						body instanceof URLSearchParams ||
						typeof body === "string" ||
						body instanceof Blob
					) {
						requestConfig.body = body;
					} else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
						requestConfig.body = body;
					} else if (typeof body === "object" && body !== null) {
						requestConfig.body = JSON.stringify(body);
					}
				}

				const response = await fetch(url, requestConfig);

				// Handle non-200 responses
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({
						message: `HTTP ${response.status}: ${response.statusText}`,
					}));

					// Handle 401 Unauthorized globally
					if (response.status === 401 && this.onUnauthorized) {
						logger.warn("401 Unauthorized - Clearing session", "APIClient");
						this.onUnauthorized();
					}

					throw new APIClientError({
						message:
							errorData.message ||
							`Request failed with status ${response.status}`,
						code: errorData.code || `HTTP_${response.status}`,
						details: errorData.details,
					});
				}

				// Handle empty responses
				const contentType = response.headers.get("content-type");
				if (!contentType?.includes("application/json")) {
					return null as T;
				}

				const data = await response.json();
				return data;
			} catch (error: unknown) {
				lastError = error instanceof Error ? error : new Error(String(error));

				// Don't retry if this is the last attempt
				if (attempt === RETRY.MAX_ATTEMPTS) {
					break;
				}

				// Check if we should retry this error
				const shouldRetry = this.isRetryableError(error);
				if (!shouldRetry) {
					throw lastError;
				}

				// Log retry attempt
				logger.warn(
					`Retrying request (attempt ${attempt + 1}): ${endpoint}`,
					"APIClient",
				);

				// Wait before retrying with exponential backoff
				await new Promise((resolve) => setTimeout(resolve, delay));
				delay = Math.min(delay * RETRY.BACKOFF_FACTOR, RETRY.MAX_DELAY);
			}
		}

		// All retries failed
		throw lastError || new Error("Request failed");
	}

	// Helper to determine if an error is retryable
	private isRetryableError(error: unknown): boolean {
		if (error instanceof APIClientError && error.code) {
			// Retry on network errors or specific HTTP status codes
			const retryableStatuses = [408, 429, 500, 502, 503, 504];
			const statusCode = Number.parseInt(
				error.code.replace("HTTP_", "") || "0",
				10,
			);
			return retryableStatuses.includes(statusCode);
		}

		// Retry on network errors
		if (error instanceof Error) {
			const networkErrors = [
				"network error",
				"fetch failed",
				"failed to fetch",
				"ECONNREFUSED",
				"ETIMEDOUT",
			];
			const errorMsg = error.message.toLowerCase();
			return networkErrors.some((msg) => errorMsg.includes(msg));
		}

		return false;
	}

	// Convenience methods
	async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
		return this.request<T>(endpoint, {
			method: "GET",
			...(headers && { headers }),
		});
	}

	async post<T>(
		endpoint: string,
		body?: BodyInit | JsonLike,
		headers?: Record<string, string>,
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: "POST",
			...(body !== undefined && { body }),
			...(headers && { headers }),
		});
	}

	async put<T>(
		endpoint: string,
		body?: BodyInit | JsonLike,
		headers?: Record<string, string>,
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PUT",
			...(body !== undefined && { body }),
			...(headers && { headers }),
		});
	}

	async patch<T>(
		endpoint: string,
		body?: BodyInit | JsonLike,
		headers?: Record<string, string>,
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PATCH",
			...(body !== undefined && { body }),
			...(headers && { headers }),
		});
	}

	async delete<T>(
		endpoint: string,
		headers?: Record<string, string>,
	): Promise<T> {
		return this.request<T>(endpoint, {
			method: "DELETE",
			...(headers && { headers }),
		});
	}

	// File upload helper
	async uploadFile<T>(
		endpoint: string,
		file: File,
		additionalData?: Record<string, string | number | boolean | undefined>,
	): Promise<T> {
		const formData = new FormData();
		formData.append("file", file);

		if (additionalData) {
			Object.entries(additionalData).forEach(([key, value]) => {
				if (value === undefined) return;
				formData.append(
					key,
					typeof value === "string" ? value : JSON.stringify(value),
				);
			});
		}

		const headers = { ...this.defaultHeaders };
		delete headers["Content-Type"]; // Let browser set it for FormData with boundary

		return this.request<T>(endpoint, {
			method: "POST",
			body: formData,
			headers,
		});
	}

	// Health check
	async healthCheck(): Promise<{ status: string; timestamp: string }> {
		return this.get("/health");
	}
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export { APIClientError };
export type { APIError, RequestConfig };

// Export class for custom instances
export { APIClient };
