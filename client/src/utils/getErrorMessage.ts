import axios from 'axios'

type ApiErrorBody = {
  message?: string
  errors?: Record<string, string[] | string>
}

function flattenErrors(errors: Record<string, string[] | string>): string[] {
  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((msg): msg is string => Boolean(msg))
}

function friendlyDuplicateMessage(message: string): string | null {
  const lower = message.toLowerCase()
  if (
    !lower.includes('duplicate') &&
    !lower.includes('1062') &&
    !lower.includes('already been taken')
  ) {
    return null
  }
  if (lower.includes('email')) return 'This email is already in use.'
  if (lower.includes('username')) return 'This username is already taken.'
  if (lower.includes('gender') || lower.includes('genders.name')) {
    return 'This name already exists.'
  }
  return 'This value is already in use.'
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === 'string' && data.trim()) {
      return friendlyDuplicateMessage(data) ?? data
    }

    if (data && typeof data === 'object') {
      const body = data as ApiErrorBody

      if (body.errors) {
        const messages = flattenErrors(body.errors)
        if (messages.length > 0) return messages.join(' ')
      }

      if (body.message) {
        const friendly = friendlyDuplicateMessage(body.message)
        if (friendly) return friendly
        if (!body.message.startsWith('SQLSTATE')) return body.message
      }
    }

    if (error.response?.status === 401) return 'Session expired. Please login again.'
    if (error.response?.status === 422) return 'Please check your input and try again.'
  }

  if (error instanceof Error && error.message) {
    return friendlyDuplicateMessage(error.message) ?? error.message
  }

  return fallback
}
