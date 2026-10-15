"use client";
export default function CandidatePagination({ currentPage, setCurrentPage, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        ก่อนหน้า
      </button>
      <span className="px-4 py-2 bg-gray-100 rounded-lg">
        หน้า {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
        className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? "bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
      >
        ถัดไป
      </button>
    </div>
  );
}
