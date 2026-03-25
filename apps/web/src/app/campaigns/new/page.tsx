'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CampaignCreateSchema } from '@99tech/shared';
import { Button, Input, Card } from '@/components/ui/core';
import api from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

// Frontend-specific schema to handle textarea string -> email array conversion
const CampaignFormSchema = CampaignCreateSchema.extend({
  recipientEmails: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    return val.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
  }, z.array(z.string().email('One or more email addresses are invalid')))
});

type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      htmlContent: '',
      recipientEmails: [],
    }
  });

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      setIsPending(true);
      setError(null);
      await api.post('/campaigns', data);
      console.log("Redirecting to...", '/dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.displayMessage || 'Failed to create campaign');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 text-center">Create New Campaign</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Campaign Name</label>
                <Input
                  placeholder="Spring Sale 2026"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email Subject</label>
                <Input
                  placeholder="Extra 20% off all items!"
                  {...register('subject')}
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message as string}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">HTML Content</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                placeholder="<h1>Hello!</h1><p>Check out our latest products...</p>"
                {...register('htmlContent')}
              />
              {errors.htmlContent && <p className="text-xs text-red-500">{errors.htmlContent.message as string}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Recipients (one per line or comma separated)</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                placeholder="customer1@gmail.com, customer2@gmail.com"
                {...register('recipientEmails' as any)}
              />
              {errors.recipientEmails && <p className="text-xs text-red-500">{errors.recipientEmails.message as string}</p>}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full flex items-center gap-2 py-6 text-lg" disabled={isSubmitting || isPending}>
              <Save className="w-5 h-5" /> {isPending ? 'Saving...' : 'Save as Draft'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
