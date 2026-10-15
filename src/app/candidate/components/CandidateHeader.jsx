"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from 'next/image';
import { signOut } from "next-auth/react";

import {  
  FileText, 
  Target, 
  AlertCircle,  
  Search,
  Trash2, 
  Menu,
  Filter,
  LayoutDashboard
} from 'lucide-react';

const MENU_ITEMS = [
  { href: "/job", icon: FileText, label: "ตำแหน่งงาน" },
  { href: "/candidate", icon: Target, label: "ผู้สมัคร" },
  { href: "/trash", icon: Trash2, label: "ถังขยะ" },
  { href: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
];

const EDUCATION_LEVELS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "highschool", label: "ปวช." },
  { value: "diploma", label: "ปวส./อนุปริญญา" },
  { value: "bachelor", label: "ปริญญาตรี" },
  { value: "master", label: "ปริญญาโท" },
  { value: "phd", label: "ปริญญาเอก" },
];

export default function CandidateHeader({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onResetFilters,
  candidates,
  uniquePositions = [],
  itemsPerPage,
  setItemsPerPage,
  totalCount,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    setShowMobileMenu(false);
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setShowMobileMenu(false);
      }
    }

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showMobileMenu]);

  const hasActiveFilters = 
    searchTerm || 
    filters.education !== "all" || 
    filters.experienceYears || 
    filters.skills || 
    filters.analyzingPosition !== "all";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Menu Section */}
          <div className="flex items-center gap-4 relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-18 h-18 md:w-20 md:h-20">
              <Image 
                src="/logo1.png"
                alt="Logo"
                fill
                sizes="(max-width: 768px) 72px, 80px"
                className="object-contain drop-shadow-xl" 
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-600">Resume AI</h1>
              <p className="text-xs text-gray-500">Recruitment System</p>
            </div>

            {showMobileMenu && (
              <div className="absolute top-14 left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center px-4 py-3 hover:bg-blue-50 rounded-lg space-x-3 transition text-gray-700 font-medium"
                    >
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 hover:bg-red-50 rounded-lg space-x-3 transition text-red-600 font-medium"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาผู้สมัคร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition p-1 rounded hover:bg-gray-200 ${
                  showFilters ? "text-blue-600 bg-gray-100" : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label="Toggle filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
              แสดงต่อหน้า:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                ตัวกรองขั้นสูง
              </h3>
              <button
                onClick={onResetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
              >
                รีเซ็ตตัวกรอง
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Position Filter */}
              <div>
                <label htmlFor="position-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                  ตำแหน่งที่วิเคราะห์
                </label>
                <select
                  id="position-filter"
                  value={filters.analyzingPosition || "all"}
                  onChange={(e) =>
                    setFilters({ ...filters, analyzingPosition: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="all">ทั้งหมด</option>
                  {uniquePositions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>

              {/* Education Filter */}
              <div>
                <label htmlFor="education-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                  วุฒิการศึกษา
                </label>
                <select
                  id="education-filter"
                  value={filters.education || "all"}
                  onChange={(e) =>
                    setFilters({ ...filters, education: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {EDUCATION_LEVELS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                
                {filters.education !== "all" && (
                  <>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.exactMatch || false}
                        onChange={(e) =>
                          setFilters({ ...filters, exactMatch: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        เฉพาะระดับที่เลือกเท่านั้น
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2 ml-6">
                      {filters.exactMatch ? (
                        <>
                          <span className="font-medium text-red-700">เฉพาะ:</span>{" "}
                          แสดงเฉพาะ {EDUCATION_LEVELS.find(e => e.value === filters.education)?.label} เท่านั้น
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-blue-700">ขั้นต่ำ:</span>{" "}
                          แสดง {EDUCATION_LEVELS.find(e => e.value === filters.education)?.label} ขึ้นไป
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Experience Filter */}
              <div>
                <label htmlFor="experience-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                  จำนวนปีประสบการณ์
                </label>
                <input
                  id="experience-filter"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="ระบุจำนวนปี"
                  value={filters.experienceYears || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, experienceYears: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                            placeholder:text-gray-400"
                />
                
                {filters.experienceYears && (
                  <>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.exactExperience || false}
                        onChange={(e) =>
                          setFilters({ ...filters, exactExperience: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        เฉพาะจำนวนปีที่เลือกเท่านั้น
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2 ml-6">
                      {filters.exactExperience ? (
                        <>
                          <span className="font-medium text-red-700">เฉพาะ:</span>{" "}
                          แสดงเฉพาะผู้มีประสบการณ์ {filters.experienceYears} ปี เท่านั้น
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-blue-700">ขั้นต่ำ:</span>{" "}
                          แสดงผู้มีประสบการณ์ {filters.experienceYears} ปี ขึ้นไป
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Skills Filter */}
              <div>
                <label htmlFor="skills-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                  ทักษะ
                </label>
                <input
                  id="skills-filter"
                  type="text"
                  value={filters.skills || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, skills: e.target.value })
                  }
                  placeholder="Python, React..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="max-w-7xl mx-auto px-6 py-5 border-t border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Candidate</h2>
          <p className="text-sm text-gray-600">
            แสดง <span className="font-semibold text-blue-600">{candidates?.length || 0}</span> จาก{" "}
            <span className="font-semibold text-blue-600">{totalCount || 0}</span> คน
            {hasActiveFilters && ` (กรองแล้ว)`}
          </p>
        </div>
      </div>
    </header>
  );
}