import { useEffect, useRef } from 'react'

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"
      aria-hidden="true"
    />
  )
}

export function ListLoadMore({
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  total,
  shown,
}: {
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  onLoadMore: () => void
  total?: number
  shown?: number
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: '120px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, onLoadMore])

  if (loading && !loadingMore) {
    return (
      <div className="flex items-center justify-center gap-2 border-t py-6 text-sm text-gray-500">
        <Spinner />
        Loading records...
      </div>
    )
  }

  if (!hasMore && !loadingMore) {
    if (total !== undefined && total > 0 && shown !== undefined) {
      return (
        <p className="border-t py-3 text-center text-xs text-gray-400">
          Showing {shown} of {total} records
        </p>
      )
    }
    return null
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 border-t py-5 text-sm text-gray-500">
          <Spinner />
          Loading more...
        </div>
      )}
    </>
  )
}
