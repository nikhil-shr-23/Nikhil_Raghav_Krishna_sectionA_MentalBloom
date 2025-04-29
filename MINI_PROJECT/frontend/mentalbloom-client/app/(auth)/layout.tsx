import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding and information */}
      <div className="bg-primary w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">MentalBloom</h1>
          <p className="text-xl mb-8">
            Your AI-powered mental health companion. Get personalized support, resources, and guidance.
          </p>
          <div className="relative w-64 h-64 mx-auto">
            {/* Replace with your logo or illustration */}
            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-6xl">🌱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="bg-background w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
