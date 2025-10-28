"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectStatus } from "@/lib/project-types";
import { useProjectActions } from "@/lib/stores";

// Validation schema - fail fast with clear error messages
const editProjectSchema = z.object({
	name: z
		.string()
		.min(3, "Project name must be at least 3 characters")
		.max(100, "Project name must be less than 100 characters"),
	client: z
		.string()
		.min(2, "Client name must be at least 2 characters")
		.max(100, "Client name must be less than 100 characters"),
	location: z
		.string()
		.min(2, "Location must be at least 2 characters")
		.max(200, "Location must be less than 200 characters"),
	status: z.enum([
		"In Preparation",
		"Generating Proposal",
		"Proposal Ready",
		"In Development",
		"Completed",
		"On Hold",
	]),
	description: z
		.string()
		.max(1000, "Description must be less than 1000 characters")
		.optional(),
	budget: z.coerce
		.number()
		.min(0, "Budget must be a positive number")
		.optional()
		.or(z.literal("")),
	scheduleSummary: z
		.string()
		.max(200, "Schedule summary must be less than 200 characters")
		.optional(),
});

type EditProjectFormValues = z.infer<typeof editProjectSchema>;

// Available project statuses - avoid magic strings
const PROJECT_STATUSES: ProjectStatus[] = [
	"In Preparation",
	"Generating Proposal",
	"Proposal Ready",
	"In Development",
	"Completed",
	"On Hold",
];

interface EditProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: {
		id: string;
		name: string;
		client: string;
		location: string;
		status: string;
		description?: string;
		budget?: number;
		scheduleSummary?: string;
	};
}

/**
 * EditProjectDialog - Allows users to edit project information
 *
 * Clean code principles:
 * - Single responsibility: Only handles project editing
 * - DRY: Reuses form components and validation
 * - Good names: Clear variable and function names
 * - Fail fast: Validates input before submission
 * - No magic numbers/strings: Uses constants
 */
export function EditProjectDialog({
	open,
	onOpenChange,
	project,
}: EditProjectDialogProps) {
	const { updateProject } = useProjectActions();

	// Initialize form with current project values
	const form = useForm<EditProjectFormValues>({
		resolver: zodResolver(editProjectSchema),
		defaultValues: {
			name: project.name,
			client: project.client,
			location: project.location,
			status: project.status as ProjectStatus,
			description: project.description || "",
			budget: project.budget ?? ("" as ""),
			scheduleSummary: project.scheduleSummary || "",
		},
	});

	// Reset form when dialog opens/closes or project changes
	// This prevents state issues and UI blocking
	useEffect(() => {
		if (!open) return;

		// Reset form with current project values when opening
		// Use setTimeout to ensure Dialog animation completes first
		const timer = setTimeout(() => {
			form.reset({
				name: project.name,
				client: project.client,
				location: project.location,
				status: project.status as ProjectStatus,
				description: project.description || "",
				budget: project.budget ?? ("" as ""),
				scheduleSummary: project.scheduleSummary || "",
			});
		}, 0);

		return () => clearTimeout(timer);
	}, [
		open,
		project.name,
		project.client,
		project.location,
		project.status,
		project.description,
		project.budget,
		project.scheduleSummary,
		form,
	]);

	// Handle form submission - returns result, doesn't print
	const handleSubmit = async (values: EditProjectFormValues) => {
		try {
			// Prepare update payload - only include changed values
			const updates: Record<string, unknown> = {};

			if (values.name !== project.name) updates.name = values.name;
			if (values.client !== project.client) updates.client = values.client;
			if (values.location !== project.location)
				updates.location = values.location;
			if (values.status !== project.status) updates.status = values.status;
			if (values.description !== project.description)
				updates.description = values.description;
			if (values.budget !== project.budget)
				updates.budget = values.budget === "" ? undefined : values.budget;
			if (values.scheduleSummary !== project.scheduleSummary)
				updates.scheduleSummary = values.scheduleSummary;

			// Fail fast: Don't make API call if nothing changed
			if (Object.keys(updates).length === 0) {
				toast.info("No changes detected");
				onOpenChange(false);
				return;
			}

			await updateProject(project.id, updates);

			toast.success("Project updated", {
				description: `"${values.name}" has been updated successfully`,
			});

			onOpenChange(false);
		} catch (error) {
			// Proper error handling with user-friendly message
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update project";

			toast.error("Update failed", {
				description: errorMessage,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={true}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Project</DialogTitle>
					<DialogDescription>
						Update project information. Changes will be saved immediately.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						{/* Project Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Project Name *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Municipal Water Treatment Plant"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Client */}
						<FormField
							control={form.control}
							name="client"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Client *</FormLabel>
									<FormControl>
										<Input placeholder="e.g., City of Los Angeles" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Location */}
						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location *</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Los Angeles, CA" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Status */}
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{PROJECT_STATUSES.map((status) => (
												<SelectItem key={status} value={status}>
													{status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief description of the project..."
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Budget and Schedule - Side by side */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="budget"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Budget (USD)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="e.g., 500000"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="scheduleSummary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Schedule Summary</FormLabel>
										<FormControl>
											<Input placeholder="e.g., 6 months" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
