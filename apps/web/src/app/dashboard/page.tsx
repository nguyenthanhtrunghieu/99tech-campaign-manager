'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { Button, Card, Badge } from '@/components/ui/core';
import { useToast } from '@/components/ui/toast';
import { Plus, Mail, BarChart2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Campaign } from '@99tech/shared';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Middleware handles the redirect, but this is a secondary safety check
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/campaigns')
      .then((res) => setCampaigns(res.data))
      .catch((err) => toast(err.displayMessage || 'Failed to load campaigns', 'error'))
      .finally(() => setLoading(false));
  }, [user, toast]);

  const handleDelete = React.useCallback(async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast('Campaign deleted', 'success');
    } catch (err: any) {
      toast(err.displayMessage || 'Delete failed', 'error');
    }
  }, [toast]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading campaigns...</div>;
  if (!user) return null;

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Campaigns</h1>
          <p className="text-slate-500 mt-1">Ready to send more? Choose a campaign or create one.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="flex items-center gap-2 px-6 h-12 rounded-xl shadow-md hover:shadow-indigo-100 transition-all">
            <Plus className="w-5 h-5" /> New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-slate-300 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Build your first campaign</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            You haven't created any campaigns yet. Start by setting up your first message to your audience.
          </p>
          <Link href="/campaigns/new">
            <Button variant="outline" size="lg" className="rounded-xl px-8">Create Campaign</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group rounded-2xl">
              <div className="flex items-center gap-5 flex-1">
                <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                  <Mail className="text-indigo-600 w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">{campaign.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{campaign.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5 px-0.5">Delivery Status</p>
                  <Badge 
                    variant={campaign.status === 'DRAFT' ? 'default' : campaign.status === 'SENDING' ? 'info' : campaign.status === 'COMPLETED' ? 'success' : 'error'} 
                    className={`px-4 py-1.5 rounded-lg font-bold text-[11px] ${campaign.status === 'SENDING' ? 'animate-pulse ring-4 ring-blue-50' : ''}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>

                <div className="flex gap-2 border-l pl-8 border-slate-100 h-10 items-center">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-50 group/icon" title="View Details">
                      <BarChart2 className="w-5 h-5 text-slate-400 group-hover/icon:text-indigo-600 transition-colors" />
                    </Button>
                  </Link>
                  {campaign.status === 'DRAFT' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 group/trash"
                      onClick={() => handleDelete(campaign.id)}
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-5 h-5 transition-transform group-hover/trash:scale-110" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
