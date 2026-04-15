'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserLoginSchema, UserLogin } from '@99tech/shared';
import { Button, Input, Card } from '@/components/ui/core';
import api from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserLogin>({
    resolver: zodResolver(UserLoginSchema),
  });

  // Rename to onLogin per user request and restore setAuth call
  const onLogin = async (data: UserLogin) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', data);
      
      // Store user in Zustand store (token is strictly managed via HttpOnly cookies natively)
      setAuth(response.data.user);
      
      // Redirect to dashboard as requested
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.displayMessage || 'Invalid email or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 py-20">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2">Log in to manage your campaigns</p>
        </div>

        {/* Use handleSubmit(onLogin) and type="submit" to prevent default GET behavior */}
        <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <Input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 font-medium hover:underline">
            Register now
          </Link>
        </p>
      </Card>
    </div>
  );
}
