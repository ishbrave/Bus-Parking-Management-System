import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ columns, data, pagination, onPageChange, loading, actions }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-100">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-3 py-3 font-semibold text-blue-600 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="text-right px-3 py-3 font-semibold text-blue-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row._id || idx} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {actions?.(row)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No data found</div>
        ) : (
          data.map((row, idx) => (
            <div key={row._id || idx} className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-4 shadow-sm">
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">{col.label}</span>
                    <span className="text-sm text-gray-700 text-right ml-2">
                      {col.render ? col.render(row) : row[col.key] || '—'}
                    </span>
                  </div>
                ))}
              </div>
              {actions && (
                <div className="mt-3 pt-3 border-t border-blue-50 flex justify-end gap-2">
                  {actions(row)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-blue-100 gap-3">
          <span className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                  pagination.page === i + 1
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}