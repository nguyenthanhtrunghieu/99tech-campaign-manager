'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/core';
import { Mail, LogOut, Plus, Home } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return (
      <nav className="border-b bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Mail className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MarTech</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Mail className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MarTech</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/campaigns/new" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-sm text-slate-500 font-medium">{user.email}</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={async () => { await logout(); router.push('/login'); }}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </nav>
  );
}
