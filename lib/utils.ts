import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or Date object to a Gregorian calendar date string
 * Always uses Gregorian calendar, regardless of locale
 * @param date Date string or Date object
 * @param locale Locale to use for formatting (default: 'ar-SA' for Arabic labels)
 * @returns Formatted date string
 */
export function formatGregorianDate(
  date: string | Date,
  locale: string = 'ar-SA'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Explicitly use Gregorian calendar
  return dateObj.toLocaleDateString(locale, {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
