/**
 * PasswordStrengthMeter Component
 *
 * Visual indicator for password strength with:
 * - Animated progress bar
 * - Color-coded strength levels
 * - Real-time feedback messages
 * - Accessible ARIA labels
 *
 * @example
 * <PasswordStrengthMeter password={password} />
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePasswordStrength } from '@/lib/hooks/use-password-strength'
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  /** The password to analyze */
  password: string
  /** Additional CSS classes */
  className?: string
  /** Whether to show detailed feedback */
  showFeedback?: boolean
}

export function PasswordStrengthMeter({
  password,
  className,
  showFeedback = true
}: PasswordStrengthMeterProps) {
  const strength = usePasswordStrength(password)

  // Don't show anything if password is empty
  if (!password) {
    return null
  }

  // Color mapping for Tailwind classes
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500'
  }

  const textColorClasses = {
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    lime: 'text-lime-600 dark:text-lime-400',
    green: 'text-green-600 dark:text-green-400'
  }

  const bgColorClasses = {
    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    lime: 'bg-lime-50 dark:bg-lime-950/20 border-lime-200 dark:border-lime-800',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
  }

  return (
    <div
      className={cn('space-y-2', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-1.5',
              textColorClasses[strength.color]
            )}
          >
            <Shield className="h-3 w-3" />
            Password strength: {strength.label}
          </span>
          <span className={cn('text-xs font-medium', textColorClasses[strength.color])}>
            {strength.percentage}%
          </span>
        </div>

        {/* Progress bar background */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className={cn('h-full rounded-full', colorClasses[strength.color])}
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
            transition={{
              duration: 0.3,
              ease: 'easeOut'
            }}
            aria-valuenow={strength.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Feedback Messages */}
      {showFeedback && strength.feedback.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={strength.feedback.join(',')}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-md border px-3 py-2 space-y-1',
              bgColorClasses[strength.color]
            )}
          >
            {strength.feedback.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-2 text-xs',
                  textColorClasses[strength.color]
                )}
              >
                {strength.isValid ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Success indicator when password is strong */}
      {strength.isValid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Great! This password is secure</span>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Compact version of PasswordStrengthMeter
 * Shows only the progress bar without feedback
 */
export function PasswordStrengthMeterCompact({
  password,
  className
}: Omit<PasswordStrengthMeterProps, 'showFeedback'>) {
  return (
    <PasswordStrengthMeter
      password={password}
      className={className}
      showFeedback={false}
    />
  )
}
