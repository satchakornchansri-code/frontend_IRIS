"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PiWarningFill } from "react-icons/pi";
import { Clock, X, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function JobForm({ onSubmit, initialData, onCancel }) {
  const defaultJobInfo = {
    positionName: "",
    department: "",
    positionType: "staff",
    numberOfPositions: 1,
    employmentType: "fulltime",
    folderName: "",
    oneDriveLink: "",
  };

  const defaultRequirements = {
    education: { description: '' },
    experience: { description: '' },
    years_experience: { value: 0 },
    skills: { description: '' },
    language: { description: '' },
    certificate: { description: '' },
    other: { description: '' }
  };

  const defaultScoringCriteria = {
    education: { score: 0, description: '' },
    experience: { score: 0, description: '' },
    skills: { score: 0, description: '' },
    language: { score: 0, description: '' },
    certificate: { score: 0, description: '' }
  };

  const [jobInfo, setJobInfo] = useState(initialData?.jobInfo || defaultJobInfo);
  const [requirements, setRequirements] = useState(initialData?.requirements || defaultRequirements);
  const [scoringCriteria, setScoringCriteria] = useState(initialData?.scoringCriteria || defaultScoringCriteria);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null, 
    type: 'info' 
  });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmDialog({
        show: true,
        title,
        message,
        type,
        onConfirm: () => {
          setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'info' });
          onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'info' });
          resolve(false);
        }
      });
    });
  }, []);

  const fetchHistoryFromBackend = useCallback(async (page = 0, append = false) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:8080/api/job-history?page=${page}&size=5`
      );
      
      if (response.ok) {
        const result = await response.json();
        
        if (append) {
          setHistory(prev => [...prev, ...result.data]);
        } else {
          setHistory(result.data);
        }
        
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
          hasMore: result.hasMore
        });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Single useEffect for initial load and events
  useEffect(() => {
    fetchHistoryFromBackend();
    
    const handleHistoryUpdate = () => fetchHistoryFromBackend();
    const handleReset = () => {
      setJobInfo(defaultJobInfo);
      setRequirements(defaultRequirements);
      setScoringCriteria(defaultScoringCriteria);
    };
    
    window.addEventListener('historyUpdated', handleHistoryUpdate);
    window.addEventListener('resetForm', handleReset);
    
    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
      window.removeEventListener('resetForm', handleReset);
    };
  }, [fetchHistoryFromBackend]);

  // Fetch when history panel opens
  useEffect(() => {
    if (showHistory) {
      fetchHistoryFromBackend();
    }
  }, [showHistory, fetchHistoryFromBackend]);

  const requirementTypes = useMemo(() => [
    { value: 'education', label: 'การศึกษา', placeholder: 'เช่น ปริญญาตรี สาขาบริหารธุรกิจ', type: 'textarea', bgColor: 'from-blue-50 to-white', borderColor: 'border-blue-200' },
    { value: 'experience', label: 'ประสบการณ์', placeholder: 'เช่น ประสบการณ์ด้านการบริหารทรัพยากรบุคคล', type: 'textarea', bgColor: 'from-gray-50 to-white', borderColor: 'border-gray-200' },
    { value: 'years_experience', label: 'จำนวนปีประสบการณ์', placeholder: '0', type: 'number', bgColor: 'from-blue-50 to-white', borderColor: 'border-blue-200' },
    { value: 'skills', label: 'ทักษะ', placeholder: 'เช่น Microsoft Office, การสื่อสาร', type: 'textarea', bgColor: 'from-gray-50 to-white', borderColor: 'border-gray-200' },
    { value: 'language', label: 'ภาษา', placeholder: 'เช่น ภาษาไทย, ภาษาอังกฤษ', type: 'textarea', bgColor: 'from-blue-50 to-white', borderColor: 'border-blue-200' },
    { value: 'certificate', label: 'ใบรับรอง', placeholder: 'เช่น ใบอนุญาตประกอบวิชาชีพ', type: 'textarea', bgColor: 'from-gray-50 to-white', borderColor: 'border-gray-200' },
    { value: 'other', label: 'อื่นๆ', placeholder: 'คุณสมบัติเพิ่มเติม', type: 'textarea', bgColor: 'from-blue-50 to-white', borderColor: 'border-blue-200' }
  ], []);

  const scoringSections = useMemo(() => [
    { value: 'education', label: 'การศึกษา', color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-300' },
    { value: 'experience', label: 'ประสบการณ์', color: 'from-gray-50 to-gray-100', borderColor: 'border-gray-300' },
    { value: 'skills', label: 'ทักษะ', color: 'from-gray-50 to-gray-100', borderColor: 'border-gray-300' },
    { value: 'language', label: 'ภาษา', color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-300' },
    { value: 'certificate', label: 'ใบรับรอง', color: 'from-gray-50 to-gray-100', borderColor: 'border-gray-300' }
  ], []);

  const employmentTypes = useMemo(() => [
    { value: 'fulltime', label: 'เต็มเวลา (Full-time)' },
    { value: 'parttime', label: 'พาร์ทไทม์ (Part-time)' },
    { value: 'contract', label: 'สัญญาจ้าง (Contract)' },
    { value: 'internship', label: 'ฝึกงาน (Internship)' }
  ], []);

  const positionTypes = useMemo(() => [
    { value: 'staff', label: 'เจ้าหน้าที่' },
    { value: 'lecturer', label: 'อาจารย์' }
  ], []);

  const updateRequirement = useCallback((type, value) => {
    if (type === 'years_experience') {
      setRequirements(prev => ({
        ...prev,
        [type]: { value: parseInt(value) || 0 }
      }));
    } else {
      setRequirements(prev => ({
        ...prev,
        [type]: { description: value }
      }));
    }
  }, []);

  const updateScore = useCallback((key, field, value) => {
    setScoringCriteria(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'score' ? Math.max(0, Math.min(100, parseInt(value) || 0)) : value
      }
    }));
  }, []);

  const getTotalScore = useCallback(() => {
    return Object.values(scoringCriteria).reduce((sum, item) => sum + (item.score || 0), 0);
  }, [scoringCriteria]);

  const getRelativeTime = useCallback((timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
    return past.toLocaleDateString('th-TH');
  }, []);

  const handleRestore = useCallback((entry) => {
    showConfirm(
      'กู้คืนข้อมูล',
      'คุณต้องการกู้คืนข้อมูลนี้หรือไม่?',
      () => {
        setJobInfo(entry.jobInfo);
        setRequirements(entry.requirements);
        setScoringCriteria(entry.scoringCriteria);
        setShowHistory(false);
        showToast('success', 'กู้คืนข้อมูลสำเร็จ!');
      },
      'info'
    );
  }, [showConfirm, showToast]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchHistoryFromBackend(pagination.currentPage + 1, true);
    }
  }, [pagination.hasMore, pagination.currentPage, loading, fetchHistoryFromBackend]);

  const handleDeleteHistory = useCallback(async (id) => {
    showConfirm(
      'ลบประวัติ',
      'คุณต้องการลบประวัตินี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
      async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/job-history/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete from database');
          }
          await fetchHistoryFromBackend(0, false);
          showToast('success', 'ลบประวัติสำเร็จ!');
        } catch (error) {
          console.error('Error deleting history:', error);
          showToast('error', 'เกิดข้อผิดพลาดในการลบประวัติ: ' + error.message);
        }
      },
      'danger'
    );
  }, [showConfirm, showToast, fetchHistoryFromBackend]);

  const handleClearAllHistory = useCallback(async () => {
    showConfirm(
      'ล้างประวัติทั้งหมด',
      'คุณต้องการลบประวัติทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
      async () => {
        try {
          const response = await fetch('http://localhost:8080/api/job-history', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to clear database history');
          }

          setHistory([]);
          setPagination({
            currentPage: 0,
            totalPages: 0,
            totalItems: 0,
            hasMore: false
          });
          showToast('success', 'ล้างประวัติทั้งหมดสำเร็จ!');
        } catch (error) {
          console.error('Error clearing history:', error);
          showToast('error', 'เกิดข้อผิดพลาดในการล้างประวัติ: ' + error.message);
        }
      },
      'danger'
    );
  }, [showConfirm, showToast]);

  const handleFormSubmit = useCallback(async () => {
    if (!jobInfo.positionName?.trim()) {
      showToast('error', 'กรุณากรอกชื่อตำแหน่ง');
      return;
    }
    if (!jobInfo.department?.trim()) {
      showToast('error', 'กรุณากรอกแผนก/หน่วยงาน');
      return;
    }

  // Validate OneDrive Link if provided
    if (jobInfo.oneDriveLink?.trim()) {
      const oneDrivePattern = /^https:\/\/(1drv\.ms|onedrive\.live\.com|[a-zA-Z0-9-]+\.sharepoint\.com)/i;
      if (!oneDrivePattern.test(jobInfo.oneDriveLink.trim())) {
        showToast('error', 'ลิงค์ OneDrive ไม่ถูกต้อง (ต้องเป็น 1drv.ms, onedrive.live.com หรือ sharepoint.com)');
        return;
      }
    }
    
    const totalScore = getTotalScore();
    if (totalScore !== 100) {
      showToast('error', `คะแนนรวมต้องเท่ากับ 100% (ปัจจุบัน: ${totalScore}%)`);
      return;
    }

    if (onSubmit) {
      await onSubmit({ 
        jobInfo, 
        requirements,
        scoringCriteria
      });
    }
  }, [jobInfo, requirements, scoringCriteria, getTotalScore, showToast, onSubmit]);

  const totalScore = getTotalScore();

  return (
    <div className="max-w-7xl mx-auto">
      {confirmDialog.show && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity animate-fade-in"
            onClick={confirmDialog.onCancel}
          />
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className={`px-6 py-4 ${
                confirmDialog.type === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                confirmDialog.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                <div className="flex items-center gap-3">
                  {confirmDialog.type === 'danger' && (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="text-white" size={24} />
                    </div>
                  )}
                  {confirmDialog.type === 'warning' && (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="text-white" size={24} />
                    </div>
                  )}
                  {confirmDialog.type === 'info' && (
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Info className="text-white" size={24} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white">{confirmDialog.title}</h3>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={confirmDialog.onCancel}
                  className="px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow"
                  type="button"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                    confirmDialog.type === 'danger' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : confirmDialog.type === 'warning'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                  type="button"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast.show && (
        <div className="fixed inset-x-0 top-20 z-[100] flex justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto animate-scale-in">
            <div className={`
              flex items-center gap-3 px-8 py-5 rounded-2xl shadow-2xl border-2 min-w-[350px]
              ${toast.type === 'success' ? 'bg-green-50 border-green-500' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-blue-500' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle className="text-green-600 flex-shrink-0" size={28} />}
              {toast.type === 'error' && <AlertCircle className="text-red-600 flex-shrink-0" size={28} />}
              {toast.type === 'info' && <Info className="text-blue-600 flex-shrink-0" size={28} />}
              
              <p className={`
                font-semibold flex-1 text-base
                ${toast.type === 'success' ? 'text-green-800' : ''}
                ${toast.type === 'error' ? 'text-red-800' : ''}
                ${toast.type === 'info' ? 'text-blue-800' : ''}
              `}>
                {toast.message}
              </p>
              
              <button 
                onClick={() => setToast({ show: false, type: '', message: '' })}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                aria-label="ปิดการแจ้งเตือน"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 relative">
          <h1 className="text-2xl font-bold text-white">
            ฟอร์มกำหนดคุณสมบัติพนักงาน
          </h1>
          <p className="text-blue-50 text-sm mt-1">กรอกข้อมูลตำแหน่งงานและเกณฑ์การประเมินผู้สมัคร</p>
          
          <button
            onClick={() => {
              setShowHistory(true);
              fetchHistoryFromBackend();
            }}
            className="absolute top-6 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
            type="button"
          >
            <Clock size={20} />
            <span>ประวัติ</span>
            {pagination.totalItems > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pagination.totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-700">ข้อมูลตำแหน่งงาน</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="positionName" className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อตำแหน่ง <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    id="positionName"
                    name="positionName"
                    value={jobInfo.positionName} 
                    onChange={e => setJobInfo({...jobInfo, positionName: e.target.value})} 
                    placeholder="เช่น นักทรัพยากรบุคคล"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                    แผนก/หน่วยงาน <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    id="department"
                    name="department"
                    value={jobInfo.department} 
                    onChange={e => setJobInfo({...jobInfo, department: e.target.value})} 
                    placeholder="เช่น ฝ่ายทรัพยากรบุคคล"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="positionType" className="block text-sm font-semibold text-gray-700 mb-2">ประเภทตำแหน่ง</label>
                  <select 
                    id="positionType"
                    name="positionType"
                    value={jobInfo.positionType} 
                    onChange={e => setJobInfo({...jobInfo, positionType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white"
                  >
                    {positionTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="employmentType" className="block text-sm font-semibold text-gray-700 mb-2">ประเภทการจ้างงาน</label>
                  <select 
                    id="employmentType"
                    name="employmentType"
                    value={jobInfo.employmentType} 
                    onChange={e => setJobInfo({...jobInfo, employmentType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white"
                  >
                    {employmentTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfPositions" className="block text-sm font-semibold text-gray-700 mb-2">จำนวนที่เปิดรับ</label>
                  <input 
                    type="number"
                    id="numberOfPositions"
                    name="numberOfPositions"
                    min="1" 
                    value={jobInfo.numberOfPositions} 
                    onChange={e => setJobInfo({...jobInfo, numberOfPositions: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              <div>
                  <label htmlFor="folderName" className="block text-sm font-semibold text-gray-700 mb-2">ชื่อโฟลเดอร์</label>
                  <input 
                    type="text"
                    id="folderName"
                    name="folderName"
                    value={jobInfo.folderName || ''}  
                    onChange={e => setJobInfo({...jobInfo, folderName: e.target.value})} 
                    placeholder="เช่น HR_Recruitment_2024"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="oneDriveLink" className="block text-sm font-semibold text-gray-700 mb-2">OneDrive link </label>
                  <input 
                    type="url"
                    id="oneDriveLink"
                    name="oneDriveLink"
                    value={jobInfo.oneDriveLink || ''}  
                    onChange={e => setJobInfo({...jobInfo, oneDriveLink: e.target.value})} 
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-700">คุณสมบัติที่ต้องการ</h2>
              </div>
              
              <div className="space-y-4">
                {requirementTypes.map((type) => {
                  const req = requirements[type.value] || (type.type === 'number' ? { value: 0 } : { description: '' });
                  
                  return (
                    <div key={type.value} className={`bg-gradient-to-br ${type.bgColor} p-4 rounded-xl border ${type.borderColor}`}>
                      <label htmlFor={`req-${type.value}`} className="block text-sm font-semibold text-gray-700 mb-2">
                        {type.label}
                      </label>
                      {type.type === 'number' ? (
                        <input
                          type="number"
                          id={`req-${type.value}`}
                          name={`req-${type.value}`}
                          min="0"
                          max="50"
                          value={req.value || 0}
                          onChange={e => updateRequirement(type.value, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
                          placeholder={type.placeholder}
                        />
                      ) : (
                        <textarea 
                          id={`req-${type.value}`}
                          name={`req-${type.value}`}
                          value={req.description || ''} 
                          onChange={e => updateRequirement(type.value, e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none bg-white"
                          placeholder={type.placeholder} 
                          rows="2"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-gray-700">เกณฑ์การให้คะแนน</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium opacity-90">คะแนนรวมทั้งหมด</span>
                    <span className={`text-4xl font-bold ${totalScore === 100 ? 'text-white' : 'text-red-300'}`}>
                      {totalScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${totalScore === 100 ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(totalScore, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">/100</span>
                  </div>
                  {totalScore !== 100 && (
                    <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <PiWarningFill size={18} />
                      <span className="text-xs font-medium">
                        {totalScore < 100 
                          ? `ยังขาดอีก ${100 - totalScore} คะแนน` 
                          : `เกินมา ${totalScore - 100} คะแนน`}
                      </span>
                    </div>
                  )}
                </div>

                {scoringSections.map((section) => {
                  const criteria = scoringCriteria[section.value] || { score: 0, description: '' };
                  
                  return (
                    <div key={section.value} className={`bg-gradient-to-br ${section.color} p-4 rounded-xl border ${section.borderColor}`}>
                      <label htmlFor={`score-${section.value}`} className="block text-sm font-semibold text-gray-700 mb-3">
                        {section.label}
                      </label>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input 
                            type="number"
                            id={`score-${section.value}`}
                            name={`score-${section.value}`}
                            min="0" 
                            max="100" 
                            value={criteria.score}
                            onChange={e => updateScore(section.value, 'score', e.target.value)}
                            className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-center font-bold bg-white"
                          />
                          <span className="text-sm font-semibold text-gray-600">คะแนน</span>
                          <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${criteria.score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <textarea 
                          id={`score-desc-${section.value}`}
                          name={`score-desc-${section.value}`}
                          value={criteria.description}
                          onChange={e => updateScore(section.value, 'description', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm bg-white"
                          placeholder="รายละเอียดเกณฑ์การให้คะแนน..."
                          rows="2"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex justify-end gap-4">
              {onCancel && (
                <button 
                  onClick={onCancel} 
                  className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow"
                  type="button"
                >
                  ยกเลิก
                </button>
              )}

              <div className="relative group">
                <button 
                  onClick={handleFormSubmit}
                  disabled={totalScore !== 100}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  type="button"
                >
                  บันทึกข้อมูล
                </button>

                {totalScore !== 100 && (
                  <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-red-50 border-2 border-red-200 px-4 py-2 rounded-lg shadow-xl whitespace-nowrap z-50">
                    <p className="text-sm font-semibold flex items-center gap-2 text-red-500">
                      <PiWarningFill size={20} className="text-yellow-400" />
                      กรุณาระบุคะแนนให้ครบ 100 คะแนน
                    </p>
                    <p className="text-xs mt-1 text-red-500">คะแนนปัจจุบัน: {totalScore}</p>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-50"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">ประวัติการบันทึก</h2>
                  <p className="text-blue-100 text-sm">
                    {pagination.totalItems > 0 && `${history.length} จาก ${pagination.totalItems} รายการ`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pagination.totalItems > 0 && (
                  <button 
                    onClick={handleClearAllHistory}
                    className="text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    type="button"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  type="button"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 && !loading ? (
                <div className="text-center py-20">
                  <Clock size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">ยังไม่มีประวัติการบันทึก</p>
                  <p className="text-gray-400 text-sm mt-2">ข้อมูลที่บันทึกจะแสดงที่นี่</p>
                </div>
              ) : (
                <>
                  {history.map((entry) => (
                    <div 
                      key={entry.id}
                      className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">
                          {getRelativeTime(entry.timestamp)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestore(entry)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                            type="button"
                          >
                            <RotateCcw size={16} />
                            กู้คืน
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(entry.id)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold text-sm transition-colors"
                            type="button"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <strong className="text-gray-700">ตำแหน่ง:</strong>{' '}
                          <span className="text-gray-600">{entry.jobInfo?.positionName || 'N/A'}</span>
                        </p>
                        <p>
                          <strong className="text-gray-700">หน่วยงาน:</strong>{' '}
                          <span className="text-gray-600">{entry.jobInfo?.department || 'N/A'}</span>
                        </p>
                        <p>
                          <strong className="text-gray-700">คะแนนรวม:</strong>{' '}
                          <span className={entry.totalScore === 100 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {entry.totalScore || 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}

                  {pagination.hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        {loading ? (
                          <span>กำลังโหลด...</span>
                        ) : (
                          <>
                            <span>โหลดเพิ่มเติม</span>
                            <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">
                              เหลืออีก {pagination.totalItems - history.length}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!pagination.hasMore && history.length > 0 && (
                    <div className="text-center pt-4">
                      <p className="text-gray-500 text-sm">แสดงครบทั้งหมดแล้ว</p>
                    </div>
                  )}
                </>
              )}
            </div>       
          </div>
        </>
      )}
    </div>
  );
}