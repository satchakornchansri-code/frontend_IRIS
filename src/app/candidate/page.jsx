"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import CandidateHeader from "./components/CandidateHeader";
import CandidateTable from "./components/CandidateTable";
import CandidatePagination from "./CandidatePagination";
import CandidateModal from "./components/CandidateModal";

export default function CandidateDisplay() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [uniquePositions, setUniquePositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [filters, setFilters] = useState({
    education: "all",
    experienceYears: "",
    exactExperience: false,
    skills: "",
    exactMatch: false,
    analyzingPosition: "all",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const fetchUniquePositions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/candidates/positions');
      if (response.ok) {
        const positions = await response.json();
        setUniquePositions(positions);
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
      setUniquePositions([]);
    }
  }, []);

  const fetchCandidates = useCallback(async (showLoading = true) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (filters.analyzingPosition && filters.analyzingPosition !== "all") {
        params.append('position', filters.analyzingPosition);
      }
      
      // เพิ่ม status filter
      if (statusFilter && statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      
      if (filters.education !== "all") {
        params.append('education', filters.education);
        params.append('exactEducation', filters.exactMatch.toString());
      }
      if (filters.experienceYears) {
        params.append('experience', filters.experienceYears);
        params.append('exactExperience', filters.exactExperience.toString());
      }
      if (filters.skills?.trim()) params.append('skills', filters.skills.trim());

      const response = await fetch(
        `http://localhost:8080/api/candidates?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error(`ไม่สามารถดึงข้อมูลได้ (${response.status})`);

      const data = await response.json();
      setCandidates(data.candidates || []);
      setTotalCount(data.total || 0);

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
        setCandidates([]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (showLoading) setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters, statusFilter]);

  // Load ครั้งแรก
  useEffect(() => {
    if (status === "authenticated") {
      fetchUniquePositions();
      fetchCandidates(true);
    }
  }, [status, fetchUniquePositions]);

  // เปลี่ยนหน้า/filter (ไม่แสดง loading)
  useEffect(() => {
    if (status === "authenticated") {
      fetchCandidates(false);
    }
  }, [status, currentPage, itemsPerPage, searchTerm, filters, statusFilter]);

  // Reset หน้าเมื่อเปลี่ยน filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, filters.education, filters.exactMatch, 
      filters.experienceYears, filters.exactExperience, filters.skills, 
      filters.analyzingPosition, statusFilter]);

  const totalPages = useMemo(() => Math.ceil(totalCount / itemsPerPage), [totalCount, itemsPerPage]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
    setStatusFilter("all");
    setFilters({ 
      education: "all", 
      experienceYears: "",
      exactExperience: false,
      skills: "",
      exactMatch: false,
      analyzingPosition: "all",
    });
  }, []);

  const handleSetFilters = useCallback((newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setCurrentPage(1);
    setSearchTerm(value);
  }, []);

  const handleItemsPerPageChange = useCallback((newValue) => {
    setCurrentPage(1);
    setItemsPerPage(newValue);
  }, []);

  const handleBatchDelete = useCallback((deletedIds) => {
    setCandidates(prev => prev.filter(c => !deletedIds.includes(c.id)));
    setTotalCount(prev => Math.max(0, prev - deletedIds.length));
  }, []);

  const handleRefreshWithLoading = useCallback(() => fetchCandidates(true), [fetchCandidates]);
  const handleSilentRefresh = useCallback(() => fetchCandidates(false), [fetchCandidates]);
  
  const handleStatusChange = useCallback((candidateId, newStatus) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === candidateId 
          ? { ...c, status: newStatus } 
          : c
      )
    );
  }, []);

  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-center text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => fetchCandidates(true)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateHeader
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        filters={filters}
        setFilters={handleSetFilters}
        onResetFilters={handleResetFilters}
        onStatusChange={handleStatusChange} 
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
        candidates={candidates}
        uniquePositions={uniquePositions}
        totalCount={totalCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <CandidateTable
              candidates={candidates}
              setSelectedCandidate={setSelectedCandidate}
              onBatchDelete={handleBatchDelete}
              onRefresh={handleSilentRefresh}
              onRefreshWithLoading={handleRefreshWithLoading}
              onStatusChange={handleStatusChange}
              onStatusFilterChange={handleStatusFilterChange}
              statusFilter={statusFilter}
              searchTerm={searchTerm}
              filters={filters}
            />

            {totalCount > 0 && (
              <CandidatePagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}