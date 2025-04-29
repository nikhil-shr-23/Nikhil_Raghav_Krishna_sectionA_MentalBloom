'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F9F4] flex items-center justify-center">
        <div className="animate-pulse text-2xl text-[#6BCB77]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#F4F9F4] flex">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-4 md:px-6 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center hidden md:block">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MentalBloom. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Mobile navigation */}
      {isMobile && <Sidebar isMobile />}
    </div>
  );
}
