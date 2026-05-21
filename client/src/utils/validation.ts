export const REQUIRED_MSG = 'Required to fill this'

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

export function fieldClass(hasError: boolean, base = 'mt-1 w-full rounded-lg border px-3 py-2') {
  return hasError
    ? `${base} border-red-500 bg-red-50 ring-1 ring-red-300 outline-none focus:border-red-500 focus:ring-red-300`
    : `${base} border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-300`
}

