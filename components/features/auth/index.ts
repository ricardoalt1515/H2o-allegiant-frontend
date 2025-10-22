/**
 * Auth Components Export
 *
 * Centralized exports for all authentication-related components.
 */

// Layout components
export { AuthLayout, CompactAuthLayout } from './auth-layout'
export type { AuthLayoutProps } from './auth-layout'

// Form field components
export { AuthFormField, SimpleFormField } from './auth-form-field'
export type { AuthFormFieldProps } from './auth-form-field'

// Password input components
export {
  PasswordInput,
  SimplePasswordInput,
  PasswordInputWithIcon
} from './password-input'
export type { PasswordInputProps } from './password-input'

// Password strength components
export {
  PasswordStrengthMeter,
  PasswordStrengthMeterCompact
} from './password-strength-meter'

// Premium design components
export {
  FloatingOrbs,
  GridPattern,
  NoiseTexture,
  MeshGradient,
  PremiumBackground
} from './background-effects'

export { FeatureCard, FeatureList } from './feature-card'
export type { FeatureCardProps, FeatureListProps } from './feature-card'

export { StatsCard, StatsGrid } from './stats-card'
export type { StatsCardProps, StatsGridProps, StatItem } from './stats-card'

export { PremiumTestimonial } from './premium-testimonial'
export type { TestimonialProps } from './premium-testimonial'
