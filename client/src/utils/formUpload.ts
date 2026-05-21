import api from '../api/client'

/** Laravel cannot read multipart files on PUT — use POST + _method=PUT */
export function submitMultipart(
  method: 'post' | 'put',
  url: string,
  formData: FormData,
) {
  if (method === 'put') {
    formData.append('_method', 'PUT')
    return api.post(url, formData)
  }
  return api.post(url, formData)
}
