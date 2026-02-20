import { useState } from 'react';
import { Download, Users, MailCheck, FileText, ArrowRight, Loader2 } from 'lucide-react';
import type { Lead } from '../types';
import { downloadExportCsv } from '../services/api';

interface ExportSummaryProps {
  leads: Lead[];
  sessionId: string;
}

export default function ExportSummary({ leads, sessionId }: ExportSummaryProps) {
  const totalLeads = leads.length;
  const verifiedEmails = leads.filter(
    (l) => l.email_status === 'verified'
  ).length;
  const emailsGenerated = leads.filter(
    (l) => l.personalized_email
  ).length;

  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadExportCsv(sessionId);
    } catch {
      setError('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Verified Emails',
      value: verifiedEmails,
      icon: MailCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Emails Generated',
      value: emailsGenerated,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[#12121a] border ${stat.borderColor} rounded-lg p-5`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e2e8f0]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#94a3b8]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-6 text-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-base"
        >
          {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {downloading ? 'Downloading...' : 'Download CSV'}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#94a3b8]">
          <ArrowRight className="w-4 h-4" />
          <p>
            Import this CSV into{' '}
            <span className="text-[#e2e8f0] font-medium">HubSpot</span>{' '}
            <span className="text-[#94a3b8]">
              Contacts &rarr; Import
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
