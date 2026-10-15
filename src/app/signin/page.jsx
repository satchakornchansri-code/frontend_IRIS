"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from 'next/image';

export default function SignInPage() {
  const [providers, setProviders] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await getProviders();
        setProviders(res);
      } catch (err) {
        setError("ไม่สามารถโหลดผู้ให้บริการได้");
      }
    }
    loadProviders();
  }, []);

  const handleSignIn = async (providerId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(providerId, {
        callbackUrl: '/job',
        redirect: true
      });
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setIsLoading(false);
    }
  };

  
  if (!providers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-gray-100">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <Image 
                src="/logo1.png"
                alt="Logo"
                fill
                sizes="(max-width: 768px) 112px, 128px"
                className="object-contain drop-shadow-2xl" 
                priority
              />
            </div>
          </div>

          <div className="text-center space-y-7">
            {/* Microsoft Logo */}
            <div className="flex justify-center -mt-6">
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded"></div>
                <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded"></div>
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded"></div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">ยินดีต้อนรับเข้าสู่ </h1>
              <h2 className="text-3xl font-bold text-gray-900">UTCC - IRIS Web App</h2>
              <p className="text-gray-600 text-sm">เข้าสู่ระบบด้วยบัญชี Microsoft หรือ Outlook</p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">เข้าสู่ระบบเพื่อดำเนินการต่อ</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg text-sm shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            {providers && Object.values(providers).map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-base">กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                      </svg>
                      <span className="text-base">เข้าสู่ระบบด้วย Microsoft</span>
                    </>
                  )}
                </div>
              </button>
            ))}

            {/* Footer */}
            <div className="pt-4">
              <p className="text-xs text-gray-500">
                การเข้าสู่ระบบแสดงว่าคุณยอมรับ
                <br />
                <span className="text-blue-600 hover:underline cursor-pointer">ข้อกำหนดการใช้งาน</span> และ <span className="text-blue-600 hover:underline cursor-pointer">นโยบายความเป็นส่วนตัว</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  