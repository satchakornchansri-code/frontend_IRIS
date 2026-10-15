"use client";
import { useState, useEffect } from "react";
import { User, Mail, Star, Trash2, AlertTriangle, X, CheckCircle, Clock, UserCheck, UserX, Calendar } from "lucide-react";

export default function CandidateTableWithStatus({ 
  candidates, 
  setSelectedCandidate, 
  onBatchDelete,
  onRefresh,
  onRefreshWithLoading,
  onStatusChange,
  onStatusFilterChange, //  รับ callback จาก parent
  statusFilter = "all", //  รับ statusFilter จาก parent
  searchTerm = "",
  filters = {}
}) {
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [totalFilteredCount, setTotalFilteredCount] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // กำหนด status options
  const statusOptions = [
    { value: 'all', label: 'ทั้งหมด', icon: null, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
    { value: 'pending', label: 'รอตรวจสอบ', icon: Clock, color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    { value: 'reviewing', label: 'กำลังพิจารณา', icon: UserCheck, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    { value: 'passed', label: 'ผ่านการคัดกรอง', icon: CheckCircle, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    { value: 'interview', label: 'นัดสัมภาษณ์', icon: Calendar, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    { value: 'rejected', label: 'ไม่ผ่าน', icon: UserX, color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  ];

  //  นับจำนวนแต่ละ status จาก Backend response
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    fetchStatusCounts();
  }, [searchTerm, filters]);

  const fetchStatusCounts = async () => {
    try {
      const counts = {};
      
      // นับทั้งหมด
      const allParams = new URLSearchParams();
      if (searchTerm?.trim()) allParams.append('search', searchTerm.trim());
      if (filters.analyzingPosition && filters.analyzingPosition !== "all") allParams.append('position', filters.analyzingPosition);
      if (filters.education && filters.education !== "all") {
        allParams.append('education', filters.education);
        allParams.append('exactEducation', filters.exactMatch?.toString() || 'false');
      }
      if (filters.experienceYears) {
        allParams.append('experience', filters.experienceYears);
        allParams.append('exactExperience', filters.exactExperience?.toString() || 'false');
      }
      if (filters.skills?.trim()) allParams.append('skills', filters.skills.trim());

      const allResponse = await fetch(`http://localhost:8080/api/candidates/count-by-filter?${allParams.toString()}`);
      const allData = await allResponse.json();
      counts['all'] = allData.count || 0;

      // นับแต่ละ status
      for (const status of statusOptions.filter(s => s.value !== 'all')) {
        const params = new URLSearchParams(allParams);
        params.append('status', status.value);
        
        const response = await fetch(`http://localhost:8080/api/candidates/count-by-filter?${params.toString()}`);
        const data = await response.json();
        counts[status.value] = data.count || 0;
      }

      setStatusCounts(counts);
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleDeleteHeaderClick = (e) => {
    e.stopPropagation();
    setShowDeleteMode(!showDeleteMode);
    setSelectedIds([]);
    setShowConfirm(false);
    setTotalFilteredCount(null);
  };

  const handleSelectAllOnPage = (e) => {
    e.stopPropagation();
    const currentPageIds = candidates.map(c => c.id).filter(Boolean);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds([...new Set([...selectedIds, ...currentPageIds])]);
    }
  };

  const handleCheckboxChange = (e, candidate) => {
    e.stopPropagation();
    if (!candidate.id) return alert('ไม่พบ ID ของผู้สมัคร');
    
    setSelectedIds(prev => 
      prev.includes(candidate.id) 
        ? prev.filter(id => id !== candidate.id)
        : [...prev, candidate.id]
    );
  };

  const handleStatusChange = async (candidateId, newStatus, e) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`http://localhost:8080/api/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะได้");
      
      if (onStatusChange) {
        onStatusChange(candidateId, newStatus);
      }
      if (onRefresh) {
        await onRefresh();
      }

      setToastMessage(`เปลี่ยนสถานะเป็น "${statusOptions.find(s => s.value === newStatus)?.label}" สำเร็จ`);
      setShowToast(true);
      
      // อัปเดตจำนวน status
      fetchStatusCounts();
      
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    if (selectedIds.length === 0) return;
    
    const idsToDelete = [...selectedIds];
    
    if (onBatchDelete) onBatchDelete(idsToDelete);
    
    setToastMessage(`ลบสำเร็จ ${idsToDelete.length} รายการ`);
    setShowToast(true);
    setSelectedIds([]);
    setShowConfirm(false);
    setTotalFilteredCount(null);
    setShowDeleteMode(false);
    
    try {
      const response = await fetch('http://localhost:8080/api/candidates/batch/soft-delete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idsToDelete),
      });

      if (!response.ok) throw new Error("ไม่สามารถย้ายไปถังขยะได้");
      if (onRefresh) await onRefresh();
      
      // อัปเดตจำนวน status
      fetchStatusCounts();
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
      if (onRefreshWithLoading) await onRefreshWithLoading();
    }
  };

  const handleDeleteAllFiltered = async (e) => {
    e.stopPropagation();
    
    try {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.append('search', searchTerm.trim());
      if (filters.analyzingPosition && filters.analyzingPosition !== "all") params.append('position', filters.analyzingPosition);
      
      //  เพิ่ม status filter
      if (statusFilter && statusFilter !== "all") params.append('status', statusFilter);
      
      if (filters.education && filters.education !== "all") {
        params.append('education', filters.education);
        params.append('exactEducation', filters.exactMatch?.toString() || 'false');
      }
      if (filters.experienceYears) {
        params.append('experience', filters.experienceYears);
        params.append('exactExperience', filters.exactExperience?.toString() || 'false');
      }
      if (filters.skills?.trim()) params.append('skills', filters.skills.trim());

      const response = await fetch(`http://localhost:8080/api/candidates/count-by-filter?${params.toString()}`);
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      
      const { count } = await response.json();
      if (count === 0) return alert('ไม่พบข้อมูลที่ตรงเงื่อนไข');
      
      setTotalFilteredCount(count);
      setShowDeleteMode(true);
      setShowConfirm(true);
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const showGlobalToast = (message) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in';
    toastEl.innerHTML = `
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
        <div class="bg-green-100 p-1.5 rounded-full">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <span class="font-semibold text-green-800">${message}</span>
      </div>
    `;
    document.body.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.remove();
    }, 3000);
  };

  const handleConfirmDeleteAllFiltered = async (e) => {
    e.stopPropagation();
    const count = totalFilteredCount;
    setIsDeleting(true);
    
    try {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.append('search', searchTerm.trim());
      if (filters.analyzingPosition && filters.analyzingPosition !== "all") params.append('position', filters.analyzingPosition);
      
      // เพิ่ม status filter
      if (statusFilter && statusFilter !== "all") params.append('status', statusFilter);
      
      if (filters.education && filters.education !== "all") {
        params.append('education', filters.education);
        params.append('exactEducation', filters.exactMatch?.toString() || 'false');
      }
      if (filters.experienceYears) {
        params.append('experience', filters.experienceYears);
        params.append('exactExperience', filters.exactExperience?.toString() || 'false');
      }
      if (filters.skills?.trim()) params.append('skills', filters.skills.trim());

      const response = await fetch(
        `http://localhost:8080/api/candidates/batch/soft-delete-by-filter?${params.toString()}`,
        { method: 'PUT' }
      );

      if (!response.ok) throw new Error("ไม่สามารถลบได้");
      
      setIsDeleting(false);
      setShowDeleteMode(false);
      setShowConfirm(false);
      setTotalFilteredCount(null);
      
      showGlobalToast(`ลบสำเร็จ ${count} รายการ`);
      
      if (onRefresh) await onRefresh();
      
      // อัปเดตจำนวน statusแบบเรียลไทม์
      fetchStatusCounts();
      
    } catch (err) {
      setIsDeleting(false);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
      if (onRefresh) await onRefresh();
    }
  };

  const currentPageIds = candidates.map(c => c.id).filter(Boolean);
  const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));

  return (
    <div className="relative">
      {/* แถบ Tabs สำหรับ Filter Status */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => {
            const Icon = status.icon;
            const count = statusCounts[status.value] || 0;
            const isActive = statusFilter === status.value;
            
            return (
              <button
                key={status.value}
                onClick={() => onStatusFilterChange && onStatusFilterChange(status.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? `${status.bgColor} ${status.textColor} shadow-md scale-105` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{status.label}</span>
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/50' : 'bg-gray-200'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {isDeleting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-700 font-semibold">กำลังประมวลผล...</p>
            </div>
          </div>
        )}
        
        <table className="w-full min-w-[400px] divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Experience</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Score</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider w-40">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleDeleteHeaderClick}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 
                              rounded-md border border-red-200 hover:border-red-300 
                              transition-all duration-200 font-medium shadow-sm hover:shadow"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleDeleteAllFiltered}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 
                              rounded-md border border-rose-200 hover:border-rose-300 
                              transition-all duration-200 font-medium shadow-sm hover:shadow flex items-center gap-1"
                    title="ลบทั้งหมดที่ตรงเงื่อนไข"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    All
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {candidates?.length > 0 ? (
              candidates.map((candidate, idx) => {
                const currentStatus = statusOptions.find(s => s.value === (candidate.status || 'pending'));
              
                
                return (
                  <tr
                    key={candidate.id || idx}
                    onClick={() => !showDeleteMode && setSelectedCandidate(candidate)}
                    className={`${!showDeleteMode ? 'hover:bg-blue-50 cursor-pointer' : ''} transition-colors duration-200`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-gray-800 font-medium text-sm sm:text-base">
                          {candidate.first_name || "-"} {candidate.last_name || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-sm sm:text-base">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{candidate.email || "-"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-700 text-sm sm:text-base hidden sm:table-cell">
                      {candidate.sum_of_experiences?.[0] ? `${candidate.sum_of_experiences[0]} ปี` : "-"}
                    </td>

                    <td className="px-4 py-3">
                      {candidate.matching_score !== undefined ? (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold space-x-1 ${
                          candidate.matching_score >= 70 
                            ? 'bg-green-100 text-green-800' 
                            : candidate.matching_score >= 50 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <Star className="w-4 h-4" />
                          <span>{candidate.matching_score}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={candidate.status || 'pending'}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value, e)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium border-2 cursor-pointer
                          transition-all duration-200 focus:outline-none focus:ring-2
                          ${currentStatus?.bgColor} ${currentStatus?.textColor}
                        `}
                      >
                        {statusOptions.filter(s => s.value !== 'all').map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {showDeleteMode && (
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(candidate.id)}
                            onChange={(e) => handleCheckboxChange(e, candidate)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                          />
                          <Trash2 className={`w-5 h-5 ${selectedIds.includes(candidate.id) ? 'text-red-600' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  {statusFilter === 'all' 
                    ? 'ไม่พบข้อมูลผู้สมัคร' 
                    : `ไม่พบผู้สมัครที่มีสถานะ "${statusOptions.find(s => s.value === statusFilter)?.label}"`
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {showDeleteMode && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 border-t border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {totalFilteredCount === null ? (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={handleSelectAllOnPage}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700">เลือกหน้านี้ทั้งหมด</span>
                    </label>
                    <div className="text-sm text-gray-600">
                      เลือกแล้ว <span className="font-semibold text-gray-800">{selectedIds.length}</span> รายการ
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-semibold text-red-700">
                    กำลังจะลบ {totalFilteredCount} รายการ (ทุกหน้า)
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {showConfirm ? (
                  <>
                    <button
                      onClick={totalFilteredCount !== null ? handleConfirmDeleteAllFiltered : handleConfirmDelete}
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      ยืนยันการลบ ({totalFilteredCount || selectedIds.length})
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirm(false);
                        setTotalFilteredCount(null);
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4 mr-1" />
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedIds.length > 0) setShowConfirm(true);
                    }}
                    disabled={selectedIds.length === 0}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shadow-md ${
                      selectedIds.length > 0
                        ? 'text-white bg-red-600 hover:bg-red-700 hover:shadow-lg'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบที่เลือก
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="bg-green-100 p-1.5 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-green-800">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}