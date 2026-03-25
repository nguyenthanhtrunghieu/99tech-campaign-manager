'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/core';
import { Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="bg-indigo-100 p-4 rounded-3xl mb-8">
        <Mail className="text-indigo-600 w-12 h-12" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
        Email Marketing <span className="text-indigo-600">Simplified</span>
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
        Create, send, and track beautiful email campaigns with our modern management platform. 
        Real-time statistics and automated workflows included.
      </p>
      
      {user ? (
        <Link href="/dashboard">
          <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg hover:shadow-indigo-200 transition-all">
            Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg hover:shadow-indigo-200 transition-all">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-full">
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
