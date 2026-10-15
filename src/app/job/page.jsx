"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "./component/Header";
import JobForm from "./component/Modal";
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api";

const INITIAL_JOB_STATE = {
  jobInfo: {
    positionName: "",
    department: "",
    positionType: "staff",
    numberOfPositions: 1,
    employmentType: "fulltime",
    folderName: "",
    oneDriveLink: "",
  },
  requirements: {
    education: { description: '' },
    experience: { description: '' },
    years_experience: { value: 0 },
    skills: { description: '' },
    language: { description: '' },
    certificate: { description: '' },
    other: { description: '' }
  },
  scoringCriteria: {
    education: { score: 0, description: '' },
    experience: { score: 0, description: '' },
    skills: { score: 0, description: '' },
    language: { score: 0, description: '' },
    certificate: { score: 0, description: '' }
  }
};

export default function ResumeAIAgent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ALL STATE HOOKS FIRST
  const [jobData, setJobData] = useState(INITIAL_JOB_STATE);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // ALL CALLBACK HOOKS
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  }, []);

  const handleCancelForm = useCallback(() => {
    setJobData(INITIAL_JOB_STATE);
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resetForm'));
    });
  }, []);

  // ALL MEMO HOOKS
  const userDisplay = useMemo(() => {
    if (!session?.user) return null;
    return (
      <p className="text-sm text-gray-600">
        กำลังใช้งานโดย: <span className="font-semibold text-gray-900">{session.user.name}</span>
        {session.user.email && (
          <span className="ml-2 text-gray-500">({session.user.email})</span>
        )}
      </p>
    );
  }, [session?.user]);

  // ALL EFFECT HOOKS
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // NOW SAFE TO RETURN CONDITIONALLY - ALL HOOKS CALLED ABOVE
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

  // Regular functions can be defined after conditional returns
  const handleAddOrUpdateJob = async (data) => {
    const totalScore = Object.values(data.scoringCriteria).reduce(
      (sum, item) => sum + (item.score || 0),
      0
    );

    if (totalScore !== 100) {
      showToast('error', `คะแนนรวมต้องเท่ากับ 100 (ปัจจุบัน: ${totalScore})`);
      return;
    }

    const requirementsArray = [];
    let yearsExperience = 0;
    Object.entries(data.requirements).forEach(([key, value]) => {
      if (key === "years_experience") {
        yearsExperience = value?.value || 0;
      } else if (value?.description?.trim()) {
        requirementsArray.push(value.description.trim());
      }
    });

    showToast('info', 'กำลังบันทึกข้อมูล...');
    setLoading(true);
    
    try {
      const historyPayload = {
        jobInfo: data.jobInfo,
        requirements: data.requirements,
        scoringCriteria: data.scoringCriteria,
        totalScore,
        timestamp: new Date().toISOString()
      };

      const jobPayload = {
        jobTitle: data.jobInfo.positionName,
        department: data.jobInfo.department,
        positionType: data.jobInfo.positionType,
        numberOfPositions: data.jobInfo.numberOfPositions,
        employmentType: data.jobInfo.employmentType,
        folderName: data.jobInfo.folderName,
        oneDriveLink: data.jobInfo.oneDriveLink,
        requirements: requirementsArray,
        yearsExperience
      };

      const scoringPayload = {
        name: `${data.jobInfo.positionName}_evaluation`,
        description: `Evaluation for ${data.jobInfo.positionName}`,
        education: [
          data.scoringCriteria.education.score || 0,
          data.scoringCriteria.education.description || ""
        ],
        experience: [
          data.scoringCriteria.experience.score || 0,
          data.scoringCriteria.experience.description || ""
        ],
        skills: [
          data.scoringCriteria.skills.score || 0,
          data.scoringCriteria.skills.description || ""
        ],
        language: [
          data.scoringCriteria.language.score || 0,
          data.scoringCriteria.language.description || ""
        ],
        certificate: [
          data.scoringCriteria.certificate.score || 0,
          data.scoringCriteria.certificate.description || ""
        ]
      };

      const historyResponse = await fetch(`${API_BASE_URL}/job-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historyPayload)
      });

      if (!historyResponse.ok) {
        throw new Error("Failed to save history");
      }

      const historyData = await historyResponse.json();
      const historyId = historyData.id;

      jobPayload.historyId = historyId;
      scoringPayload.historyId = historyId;

      const [jobResponse, scoringResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobPayload)
        }),
        fetch(`${API_BASE_URL}/scoring`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scoringPayload)
        })
      ]);

      if (!jobResponse.ok) {
        const err = await jobResponse.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save job");
      }

      if (!scoringResponse.ok) {
        const err = await scoringResponse.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save scoring");
      }

      showToast('success', 'บันทึกข้อมูลสำเร็จ!');
      setJobData(INITIAL_JOB_STATE);
      
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('historyUpdated'));
        window.dispatchEvent(new Event('resetForm'));
      });
    } catch (err) {
      console.error(err);
      showToast('error', 'เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
          {userDisplay}
        </div>

        <JobForm
          onSubmit={handleAddOrUpdateJob}
          initialData={jobData}
          onCancel={handleCancelForm}
          loading={loading}
        />
      </main>
    </div>
  );
}