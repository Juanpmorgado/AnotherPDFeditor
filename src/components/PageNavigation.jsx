import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePDFState } from '../hooks/usePDFState';

export default function PageNavigation() {
  const { currentPage, totalPages, setCurrentPage, previousPage, nextPage } = usePDFState();

  if (totalPages === 0) return null;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-center gap-4 shadow-sm">
      <button
        onClick={previousPage}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              setCurrentPage(page);
            }
          }}
          className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="text-sm text-gray-600">of {totalPages}</span>
      </div>

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
