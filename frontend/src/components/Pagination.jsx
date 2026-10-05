export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total === 0) return null

  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-700">
      <span className="text-gray-500 dark:text-gray-400">
        {pagination.total} records · Page {pagination.page} of {pagination.total_pages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg border px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= pagination.total_pages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  )
}
