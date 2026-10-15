"use client";
import { useState } from "react";
import Image from "next/image";
import { TbSettingsStar } from "react-icons/tb";
import { TbSettingsSpark } from "react-icons/tb";
import {
  Mail,
  X,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Award,
  Settings,
  Sparkles,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";

export default function CandidateModal({ candidate, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return null;

  // --- Extract Data ---
  const score = Number(candidate.matching_score) || 0;
  const sum_of_experiences = Number(candidate.sum_of_experiences?.[0]) || 0;
 
  // --- Helper for Color ---
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  // --- Helper for barColor ---
  const getScoreBarColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  //  Helper for Status Badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-amber-500',
        text: 'text-white',
        label: 'รอตรวจสอบ', 
        icon: Clock 
      },
      reviewing: { 
        bg: 'bg-sky-500',
        text: 'text-white',
        label: 'กำลังพิจารณา', 
        icon: UserCheck 
      },
      passed: { 
        bg: 'bg-emerald-500',
        text: 'text-white',
        label: 'ผ่านการคัดกรอง', 
        icon: CheckCircle2 
      },
      interview: { 
        bg: 'bg-purple-500',
        text: 'text-white',
        label: 'นัดสัมภาษณ์', 
        icon: Calendar 
      },
      rejected: { 
        bg: 'bg-red-500',
        text: 'text-white',
        label: 'ไม่ผ่าน', 
        icon: UserX 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <div className={`${config.bg} ${config.text} px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg`}>
        <IconComponent className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
    );
  };


  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.3s ease' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 z-10 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start justify-between pt-8">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0">
                {candidate.first_name?.charAt(0) || "?"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {candidate.first_name} {candidate.last_name}
                </h1>
                <p className="text-indigo-100 flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </p>
                {candidate.analyzing_position && (
                  <p className="text-lg text-indigo-100">
                    ตำแหน่งที่สมัคร: {candidate.analyzing_position}
                  </p>
                )}
              </div>
            </div>

            {/*  Status Badge + Fit Score */}
            <div className="flex flex-col gap-3 ml-4">
              {/* Status Badge - ใช้ pending เป็น default */}
              {getStatusBadge(candidate.status || 'pending')}

              {/* Fit Score */}
              <div className={`${getScoreColor(score)} px-6 py-4 rounded-xl text-center`}>
                <div className="text-4xl font-bold">{score}%</div>
                <div className="text-xs font-semibold mt-1">Fit Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - เปลี่ยนตาม Tab */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
          {activeTab === 'overview' ? (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{sum_of_experiences} ปี</div>
                <div className="text-sm text-slate-600 mt-1">ประสบการณ์ทำงาน</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{candidate.hard_skills?.length || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Hard Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{candidate.soft_skills?.length || 0}</div>
                <div className="text-sm text-slate-600 mt-1">Soft Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{candidate.candidate_certifications?.length || 0}</div>
                <div className="text-sm text-slate-600 mt-1">ใบรับรอง</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className={`text-2xl font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </div>
                <div className="text-sm text-slate-600 mt-1">Fit Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{candidate.matching_part?.length || 0}</div>
                <div className="text-sm text-slate-600 mt-1">จุดที่ตรง</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{candidate.unmatching_part?.length || 0}</div>
                <div className="text-sm text-slate-600 mt-1">จุดที่ขาด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {[
                    candidate.rating_for_education,
                    candidate.rating_for_experience,
                    candidate.rating_for_skills,
                    candidate.rating_for_language,
                    candidate.rating_for_certificate
                  ].filter(r => r != null && r !== '' && r !== 0).length || 0}
                </div>
                <div className="text-sm text-slate-600 mt-1">หมวดประเมิน</div>
              </div>
            </>
          )}
        </div>
      
        {/* Tabs */}
        <div className="bg-white border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              การวิเคราะห์
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Education */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-slate-800">ประวัติการศึกษา</h3>
                </div>
                <div className="space-y-3">
                  {candidate.educational?.map((edu, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-slate-700">{edu}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-200 flex items-center gap-2 text-indigo-700 bg-white rounded-lg p-3">
                  <Image 
                    src="/Education.png"
                    alt="Education icon"
                    width={100}
                    height={100}
                    className="w-4 h-4"
                    priority
                  />
                  <span className="text-sm font-medium">
                    ประวัติการศึกษาสูงสุด : {candidate.highest_education}
                  </span>
                </div> 
              </div>

              {/* Experience */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <Briefcase className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-slate-800">ประสบการณ์ทำงาน</h3>
                </div>
                <div className="space-y-3">
                  {candidate.experiences?.map((exp, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-slate-700">{exp}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-purple-200 flex items-center gap-2 text-purple-700 bg-white rounded-lg p-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    ประสบการณ์รวม: {sum_of_experiences} ปี
                  </span>
                </div>
              </div>

              {/* Certifications */}
              {candidate.candidate_certifications?.length > 0 && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-cyan-600 mr-3" />
                    <h3 className="text-xl font-semibold text-slate-800">ใบรับรอง/วุฒิบัตร</h3>
                  </div>
                  <div className="space-y-3">
                    {candidate.candidate_certifications.map((cert, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700">{cert}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-cyan-200 flex items-center gap-2 text-cyan-700 bg-white rounded-lg p-3">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      จำนวนใบรับรอง: {candidate.candidate_certifications.length} ใบ
                    </span>
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Hard Skills */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <TbSettingsStar className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-slate-800">Hard Skills</h3>
                  </div>
                  <div className="space-y-2">
                    {candidate.hard_skills?.map((skill, index) => (
                      <div key={index} className="bg-white rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-slate-700 text-sm">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <TbSettingsSpark className="w-6 h-6 text-amber-600 mr-3" />
                    <h3 className="text-xl font-semibold text-slate-800">Soft Skills</h3>
                  </div>
                  <div className="space-y-2">
                    {candidate.soft_skills?.map((skill, index) => (
                      <div key={index} className="bg-white rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-slate-700 text-sm">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Resume Link */}
              {candidate.resume && (
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 text-slate-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">เรซูเม่</h3>
                        <p className="text-sm text-slate-600">ดาวน์โหลดหรือดูเรซูเม่ฉบับเต็ม</p>
                      </div>
                    </div>
                    <a
                      href={candidate.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ดูเรซูเม่
                    </a>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Matching Score Visual */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">คะแนนความเหมาะสม</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600 font-medium">ระดับความเหมาะสม</span>
                    <span className="text-2xl font-bold text-slate-800">{score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(score)} transition-all duration-1000 rounded-full`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
                {candidate.justification && (
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="text-slate-700 text-sm leading-relaxed">{candidate.justification}</p>
                  </div>
                )}
              </div>

            {/* Detailed Rating Breakdown */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">การประเมินรายละเอียด</h3>
                
                <div className="space-y-6">
                  {/* Education Rating */}
                  {(candidate.rating_for_education !== undefined || candidate.justification_for_education) && (
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-indigo-600" />
                          <span className="font-semibold text-slate-800">การศึกษา (Education)</span>
                        </div>
                        <span className="text-2xl font-bold text-indigo-600">
                          {Math.round(candidate.rating_for_education || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.rating_for_education || 0}%` }}
                        ></div>
                      </div>
                      {candidate.justification_for_education && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {candidate.justification_for_education}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Experience Rating */}
                  {(candidate.rating_for_experience !== undefined || candidate.justification_for_experience) && (
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-slate-800">ประสบการณ์ (Experience)</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          {Math.round(candidate.rating_for_experience || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.rating_for_experience || 0}%` }}
                        ></div>
                      </div>
                      {candidate.justification_for_experience && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {candidate.justification_for_experience}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Skills Rating */}
                  {(candidate.rating_for_skills !== undefined || candidate.justification_for_skills) && (
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-800">ทักษะ (Skills)</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {Math.round(candidate.rating_for_skills || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.rating_for_skills || 0}%` }}
                        ></div>
                      </div>
                      {candidate.justification_for_skills && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {candidate.justification_for_skills}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Language Rating */}
                  {(candidate.rating_for_language !== undefined || candidate.justification_for_language) && (
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-slate-800">ภาษา (Language)</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {Math.round(candidate.rating_for_language || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.rating_for_language || 0}%` }}
                        ></div>
                      </div>
                      {candidate.justification_for_language && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {candidate.justification_for_language}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Certificate Rating */}
                  {(candidate.rating_for_certificate !== undefined || candidate.justification_for_certificate) && (
                    <div className="bg-white rounded-lg p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-slate-800">ใบรับรอง (Certificate)</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600">
                          {Math.round(candidate.rating_for_certificate || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div 
                          className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.rating_for_certificate || 0}%` }}
                        ></div>
                      </div>
                      {candidate.justification_for_certificate && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {candidate.justification_for_certificate}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Matching Parts */}
              {candidate.matching_part?.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-slate-800">จุดที่ตรงกับตำแหน่งงาน</h3>
                  </div>
                  <div className="space-y-2">
                    {candidate.matching_part.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmatching Parts */}
              {candidate.unmatching_part?.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-semibold text-slate-800">จุดที่ไม่ตรงกับตำแหน่งงาน </h3>
                  </div>
                  <div className="space-y-2">
                    {candidate.unmatching_part.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}