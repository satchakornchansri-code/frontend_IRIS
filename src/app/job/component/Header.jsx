"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from 'next/image';
import { signOut } from "next-auth/react";
import {
  Menu,
  AlertCircle,
  FileText,
  Target,
  ChevronDown,
  ChevronUp,
  LayoutDashboard
} from "lucide-react";

const MENU_ITEMS = [
  { href: "/job", icon: FileText, label: "ตำแหน่งงาน" },
  { href: "/candidate", icon: Target, label: "ผู้สมัคร" },
  { href: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
];

export const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const menuRef = useRef(null);

  const handleLogout = useCallback(async () => {
    setShowMenu(false);
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }, []);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const toggleTitle = useCallback(() => {
    setShowTitle(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const menuContent = useMemo(() => (
    <div className="absolute top-14 left-0 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
      <nav className="p-2 space-y-1" role="navigation" aria-label="เมนูหลัก">
        {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={closeMenu}
            className="flex items-center px-3 py-2.5 hover:bg-blue-50 rounded-md space-x-3 transition-colors text-slate-700 text-sm"
          >
            <Icon className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
        <div className="border-t border-slate-200 my-1" role="separator"></div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 hover:bg-red-50 rounded-md space-x-3 transition-colors text-red-600 text-sm"
          type="button"
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium">ออกจากระบบ</span>
        </button>
      </nav>
    </div>
  ), [closeMenu, handleLogout]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4 border-b border-slate-100">
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="เมนู"
              aria-expanded={showMenu}
              aria-controls="main-menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-18 h-18 md:w-20 md:h-20">
                <Image 
                  src="/logo1.png"
                  alt="Resume AI Logo"
                  fill
                  sizes="(max-width: 768px) 72px, 80px"
                  className="object-contain drop-shadow-xl" 
                  priority
                  blurDataURL="data:image/svg+xml;base64,..." // เพิ่ม blur placeholder
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-600">Resume AI</h1>
                <p className="text-xs text-slate-500">Recruitment System</p>
              </div>
            </div>

            {showMenu && menuContent}
          </div>

          <button
            onClick={toggleTitle}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors"
            aria-label={showTitle ? "เก็บหัวข้อ" : "แสดงหัวข้อ"}
            aria-expanded={showTitle}
            title={showTitle ? "เก็บหัวข้อ" : "แสดงหัวข้อ"}
            type="button"
          >
            {showTitle ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showTitle 
              ? 'opacity-100 max-h-20 py-4' 
              : 'opacity-0 max-h-0 py-0'
          }`}
          aria-hidden={!showTitle}
        >
          <h2 className="text-2xl font-semibold text-slate-800">Job Description</h2>
          <p className="text-sm text-slate-500 mt-1">จัดการรายละเอียดตำแหน่งงาน</p>
        </div>
      </div>
    </header>
  );
};