import axios from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> }
    if (data?.message) return data.message
    if (data?.errors) {
      const first = Object.values(data.errors)[0]?.[0]
      if (first) return first
    }
    if (error.response?.status === 401) return 'Session expired. Please login again.'
    if (error.response?.status === 422) return 'Please check your input and try again.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
