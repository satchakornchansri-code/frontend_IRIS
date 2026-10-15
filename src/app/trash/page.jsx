"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw, AlertTriangle, Trash2, User, Mail, Clock, CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deletedCandidates, setDeletedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null, 
    type: 'warning' 
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
          setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
          onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
          resolve(false);
        }
      });
    });
  }, []);

  // Fetch deleted candidates function
  const fetchDeletedCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/candidates/trash');
      const data = await response.json();
      setDeletedCandidates(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDeletedCandidates();
    }
  }, [status, fetchDeletedCandidates]);

  const handleRestore = async (id) => {
    showConfirm(
      'กู้คืนข้อมูล',
      'คุณต้องการกู้คืนผู้สมัครรายนี้หรือไม่?',
      async () => {
        try {
          const response = await fetch('http://localhost:8080/api/candidates/batch/restore', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([id]),
          });

          if (response.ok) {
            showToast('success', 'กู้คืนข้อมูลสำเร็จ!');
            // Auto refresh after 1 second
            setTimeout(() => {
              fetchDeletedCandidates();
            }, 1000);
          } else {
            throw new Error('Failed to restore');
          }
        } catch (error) {
          showToast('error', 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล');
        }
      },
      'info'
    );
  };

  const handleDelete = async (id) => {
    showConfirm(
      'ลบถาวร',
      'คุณต้องการลบผู้สมัครรายนี้ถาวรหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!',
      async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/candidates/${id}`, { 
            method: 'DELETE' 
          });

          if (response.ok) {
            showToast('success', 'ลบข้อมูลถาวรสำเร็จ!');
            // Auto refresh after 1 second
            setTimeout(() => {
              fetchDeletedCandidates();
            }, 1000);
          } else {
            throw new Error('Failed to delete');
          }
        } catch (error) {
          showToast('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
      'danger'
    );
  };

  const handleRestoreAll = async () => {
    showConfirm(
      'กู้คืนทั้งหมด',
      `คุณต้องการกู้คืนผู้สมัครทั้งหมด ${deletedCandidates.length} รายการหรือไม่?`,
      async () => {
        try {
          const ids = deletedCandidates.map(c => c.id);
          const response = await fetch('http://localhost:8080/api/candidates/batch/restore', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ids),
          });

          if (response.ok) {
            showToast('success', 'กู้คืนข้อมูลทั้งหมดสำเร็จ!');
            // Auto refresh after 1 second
            setTimeout(() => {
              fetchDeletedCandidates();
            }, 1000);
          } else {
            throw new Error('Failed to restore all');
          }
        } catch (error) {
          showToast('error', 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล');
        }
      },
      'info'
    );
  };

  const handleDeleteAll = async () => {
    showConfirm(
      'ลบทั้งหมดถาวร',
      `คุณต้องการลบผู้สมัครทั้งหมด ${deletedCandidates.length} รายการถาวรหรือไม่?\n\nคำเตือน: การกระทำนี้ไม่สามารถย้อนกลับได้!`,
      async () => {
        try {
          const ids = deletedCandidates.map(c => c.id);
          const response = await fetch('http://localhost:8080/api/candidates/batch', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ids),
          });

          if (response.ok) {
            showToast('success', 'ลบข้อมูลทั้งหมดถาวรสำเร็จ!');
            // Auto refresh after 1 second
            setTimeout(() => {
              fetchDeletedCandidates();
            }, 1000);
          } else {
            throw new Error('Failed to delete all');
          }
        } catch (error) {
          showToast('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      },
      'danger'
    );
  };

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

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirm Dialog */}
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
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
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

      {/* Toast */}
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/candidate" 
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                title="กลับหน้าผู้สมัคร"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:-translate-x-0.5 transition-all duration-200" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">ถังขยะ</h1>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {deletedCandidates.length > 0 
                      ? `${deletedCandidates.length} รายการ` 
                      : 'ว่างเปล่า'}
                  </p>
                </div>
              </div>
            </div>

            {deletedCandidates.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleRestoreAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-white hover:border-2 hover:border-emerald-500 transition-colors duration-200 shadow-sm font-medium group"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  กู้คืนทั้งหมด
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-white hover:border-2 hover:border-rose-500 transition-colors duration-200 shadow-sm font-medium group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  ลบทั้งหมดถาวร
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {deletedCandidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-20 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              ถังขยะว่างเปล่า
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              ไม่มีผู้สมัครที่ถูกลบ
            </p>
            <Link 
              href="/candidate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              กลับหน้าผู้สมัคร
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {deletedCandidates.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                          {c.first_name} {c.last_name}
                        </h3>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <span className="truncate">{c.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="truncate">
                              ลบเมื่อ {new Date(c.deletedAt).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(c.id)}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-white hover:border-2 hover:border-emerald-500 transition-colors duration-200 shadow-sm font-medium group"
                        title="กู้คืนข้อมูล"
                      >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">กู้คืน</span>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex items-center gap-2 px-5 py-3 bg-rose-100 text-rose-600 rounded-lg hover:bg-white hover:border-2 hover:border-rose-500 transition-colors duration-200 shadow-sm font-medium group"
                        title="ลบถาวร"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span className="hidden sm:inline">ลบถาวร</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 border-t border-amber-200 px-6 py-3">
                  <div className="flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>ข้อมูลจะถูกลบอัตโนมัติหลังจาก 30 วัน</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}