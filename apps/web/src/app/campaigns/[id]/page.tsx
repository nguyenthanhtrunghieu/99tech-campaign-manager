'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api-client';
import { Button, Card, Badge, Progress } from '@/components/ui/core';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Campaign, CampaignStats, CampaignStatus } from '@99tech/shared';
import DOMPurify from 'dompurify';

export default function CampaignDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [stats, setStats] = React.useState<CampaignStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);

  const fetchDetails = React.useCallback(async () => {
    try {
      const [campRes, statsRes] = await Promise.all([
        api.get(`/campaigns/${params.id}`),
        api.get(`/campaigns/${params.id}/stats`),
      ]);
      setCampaign(campRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      // Fix #4: Show error toast instead of console.error
      toast(err.displayMessage || 'Failed to load campaign details', 'error');
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  React.useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Fix #5: Polling stops based on campaign STATUS (COMPLETED or FAILED), not count comparison
  React.useEffect(() => {
    if (campaign?.status !== 'SENDING') return;

    const interval = setInterval(async () => {
      try {
        const [campRes, statsRes] = await Promise.all([
          api.get(`/campaigns/${params.id}`),
          api.get(`/campaigns/${params.id}/stats`),
        ]);
        setCampaign(campRes.data);
        setStats(statsRes.data);

        const currentStatus = campRes.data?.status;
        if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED' || currentStatus === 'PARTIALLY_FAILED') {
          clearInterval(interval);
          toast(
            currentStatus === 'COMPLETED' ? 'Campaign delivered successfully!' : currentStatus === 'PARTIALLY_FAILED' ? 'Campaign delivered with some failures' : 'Campaign encountered errors',
            currentStatus === 'COMPLETED' ? 'success' : currentStatus === 'PARTIALLY_FAILED' ? 'warning' : 'error'
          );
        }
      } catch (err: any) {
        toast(err.displayMessage || 'Failed to refresh stats', 'error');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [campaign?.status, params.id, toast]);

  const handleSend = React.useCallback(async () => {
    try {
      setSending(true);
      await api.post(`/campaigns/${params.id}/send`);
      setCampaign((prev) => prev ? ({ ...prev, status: CampaignStatus.SENDING }) : null);
      toast('Campaign send initiated!', 'success');
    } catch (err: any) {
      // Fix #4: Replace alert() with toast
      toast(err.displayMessage || 'Failed to initiate send', 'error');
    } finally {
      setSending(false);
    }
  }, [params.id, toast]);

  const sanitizedHtml = React.useMemo(() => {
    if (!campaign?.htmlContent) return '';
    return typeof window !== 'undefined'
      ? DOMPurify.sanitize(campaign.htmlContent)
      : campaign.htmlContent;
  }, [campaign?.htmlContent]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (!campaign) return <div className="p-8 text-center text-red-500">Campaign not found</div>;

  const progress = stats?.progress ?? 0;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="grid gap-6">
          <Card className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
                <p className="text-slate-500 mt-1">Subject: {campaign.subject}</p>
              </div>
              <Badge
                variant={campaign.status === 'SENDING' ? 'info' : campaign.status === 'COMPLETED' ? 'success' : campaign.status === 'PARTIALLY_FAILED' ? 'warning' : campaign.status === 'FAILED' ? 'error' : 'default'}
                className="px-4 py-1 text-sm uppercase"
              >
                {campaign.status}
              </Badge>
            </div>

            {campaign.status === 'DRAFT' && (
              <Button onClick={handleSend} disabled={sending} className="w-full flex items-center justify-center gap-2 py-6 text-lg">
                <Send className="w-5 h-5" /> {sending ? 'Initiating...' : 'Send Campaign Now'}
              </Button>
            )}

            {campaign.status !== 'DRAFT' && (
              <div className="space-y-6 mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Delivery Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-indigo-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats?.total ?? '-'}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats?.sent ?? '-'}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Sent</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
                      <XCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{stats?.failed ?? '-'}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Email Preview</h2>
            <div
              className="p-6 bg-white border rounded-lg prose max-w-none min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
