import { useCallback, useEffect, useRef, useState } from 'react'

export type PaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type PageResult<T> = {
  data: T[]
  meta: PaginationMeta
}

export function usePaginatedList<T>(
  fetchPage: (page: number) => Promise<PageResult<T>>,
  resetKey: string | number = '',
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const fetchPageRef = useRef(fetchPage)
  fetchPageRef.current = fetchPage

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setPage(1)
    try {
      const res = await fetchPageRef.current(1)
      setItems(res.data)
      setLastPage(res.meta.last_page)
      setTotal(res.meta.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial, resetKey])

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page >= lastPage) return

    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await fetchPageRef.current(nextPage)
      setItems((prev) => [...prev, ...res.data])
      setPage(nextPage)
      setLastPage(res.meta.last_page)
      setTotal(res.meta.total)
    } finally {
      setLoadingMore(false)
    }
  }, [loading, loadingMore, page, lastPage])

  const refresh = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  return {
    items,
    loading,
    loadingMore,
    hasMore: page < lastPage,
    total,
    loadMore,
    refresh,
  }
}
