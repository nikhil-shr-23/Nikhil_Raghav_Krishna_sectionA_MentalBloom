'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues
const EmotionTracker = dynamic(
  () => import('@/components/Emotions').then((mod) => mod.EmotionTracker),
  { ssr: false }
);

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F9F4] flex items-center justify-center">
        <div className="animate-pulse text-2xl text-[#6BCB77]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F9F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-[#6BCB77]">MentalBloom</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Your AI-powered mental health companion. Get personalized support, resources, and guidance.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#6BCB77] hover:bg-opacity-90 md:py-4 md:text-lg md:px-10"
                  >
                    Log In
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#6BCB77] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="py-12 bg-white rounded-lg shadow-sm">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
              <h2 className="text-center text-3xl font-extrabold text-slate-800 sm:text-4xl">
                How MentalBloom Helps You
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-slate-500">
                Our AI-powered platform provides personalized mental health support.
              </p>
              <div className="mt-10">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Feature 1 */}
                  <div className="pt-6">
                    <div className="flow-root bg-[#F4F9F4] rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-[#6BCB77] rounded-md shadow-lg">
                            <span className="text-2xl">💬</span>
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-slate-800 tracking-tight">
                          AI Chat Support
                        </h3>
                        <p className="mt-5 text-base text-slate-500">
                          Chat with our AI assistant that understands your emotions and provides personalized guidance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="pt-6">
                    <div className="flow-root bg-[#F4F9F4] rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-[#4D96FF] rounded-md shadow-lg">
                            <span className="text-2xl">📚</span>
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-slate-800 tracking-tight">
                          Curated Resources
                        </h3>
                        <p className="mt-5 text-base text-slate-500">
                          Access a library of mental health resources tailored to your specific needs and concerns.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="pt-6">
                    <div className="flow-root bg-[#F4F9F4] rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-[#A0E7E5] rounded-md shadow-lg">
                            <span className="text-2xl">🧠</span>
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-slate-800 tracking-tight">
                          Emotion Analysis
                        </h3>
                        <p className="mt-5 text-base text-slate-500">
                          Our AI analyzes your emotions to provide more relevant and helpful responses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome to MentalBloom</h1>
        <p className="mt-2 text-slate-500">Your mental health companion</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick Chat Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#6BCB77] rounded-md p-3">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-slate-800">Chat Support</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Talk to our AI assistant about how you&apos;re feeling
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href="/chat"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#6BCB77] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6BCB77]"
                >
                  Start Chatting
                </Link>
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#4D96FF] rounded-md p-3">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-slate-800">Resources</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Explore our curated mental health resources
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href="/resources"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4D96FF] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D96FF]"
                >
                  Browse Resources
                </Link>
              </div>
            </div>
          </div>

          {/* Mood Tracker Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-[#A0E7E5] rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-slate-800">Daily Check-in</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    How are you feeling today?
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href="/chat"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#A0E7E5] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A0E7E5]"
                >
                  Check In
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Emotion Tracking</h2>
          <div className="grid grid-cols-1 gap-6">
            <EmotionTracker />
          </div>
        </div>
      </div>
    </div>
  );
}
