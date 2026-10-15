"use client";

import React from 'react';
import { ChevronRight, Sparkles, Zap, Target, Brain } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 opacity-50"></div>
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(46,46,146,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(46,46,146,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="text-center max-w-4xl relative z-10 -mt-8">
        {/* Logo Image */}
        <div className="flex justify-center">
          <div className="relative w-44 h-44 md:w-60 md:h-60">     
            <Image 
              src="/logo2.png"
              alt="Logo"
              fill
              sizes="(max-width: 768px) 176px, 240px"
              className="object-contain drop-shadow-xl" 
              priority
            />
          </div>
        </div>
        
        {/* Official Badge */}
        <div className="flex justify-center -mt-6">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-md border border-[#2e2e92]/20 rounded-full mb-5 shadow-lg">
            <Sparkles size={14} className="text-[#2e2e92]" />
            <span className="text-sm font-semibold text-[#2e2e92]">
              AI-Powered Recruitment System
            </span>
          </div>
        </div>

        {/* Website Name with Gradient */}
        <h1 className="text-5xl md:text-[5rem] font-bold mb-4">
          <span className="font-light bg-gradient-to-r from-[#2e2e92] to-[#4a4ab8] bg-clip-text text-transparent">
            UTCC
          </span>
          <span className="bg-gradient-to-r from-[#4a4ab8] to-[#6b6bd9] bg-clip-text text-transparent">
           -IRIS
          </span>
        </h1>

        {/* Full Name */}
        <p className="text-sm md:text-base text-[#4a4ab8]/70 mb-5 font-light tracking-wide">
        Intelligent Resume Inspection and Scoring
        </p>
        
        {/* Elegant Divider */}
        <div className="flex items-center justify-center mb-5">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#2e2e92]/50 to-transparent"></div>
        <Image
          src="/web_logo2.png" 
          alt="Logo" 
          width={100}
          height={100}
          className="w-10 h-10 mx-4 object-contain"
          priority
        />
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#2e2e92]/50 to-transparent"></div>
      </div>
        
        {/* Short Description */}
        <p className="text-xl md:text-2xl text-[#2e2e92] mb-2 font-light leading-relaxed">
          ระบบคัดกรองบุคลากรด้วยปัญญาประดิษฐ์
        </p>
        <p className="text-lg md:text-xl text-[#4a4ab8] mb-8 font-light">
          สำหรับมหาวิทยาลัยยุคใหม่
        </p>
        
        {/* Login Button with Enhanced Effects */}
        <button
          onClick={handleGetStarted}
          className="group relative px-10 py-4 bg-gradient-to-r from-[#2e2e92] to-[#4a4ab8] text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#2e2e92]/40 hover:scale-105 border border-[#2e2e92]/30 overflow-hidden"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          <span className="relative flex items-center gap-2.5">
            เข้าสู่ระบบ
            <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-2" />
          </span>
        </button>

        {/* Feature Tags with Icons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#2e2e92]/20 rounded-full text-sm text-[#2e2e92] flex items-center gap-2">
            <Brain size={16} />
            <span>Smart AI Analysis</span>
          </div>
          <div className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#2e2e92]/20 rounded-full text-sm text-[#2e2e92] flex items-center gap-2">
            <Zap size={16} />
            <span>Fast Processing</span>
          </div>
          <div className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#2e2e92]/20 rounded-full text-sm text-[#2e2e92] flex items-center gap-2">
            <Target size={16} />
            <span>Accurate Results</span>
          </div>
        </div>
      </div>
      
      {/* Elegant Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#2e2e92]/20 opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#2e2e92]/20 opacity-30"></div>
    </div>
  );
}