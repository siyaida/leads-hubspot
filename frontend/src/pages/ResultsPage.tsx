import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Mail,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  Hash,
} from 'lucide-react';
import { usePipeline } from '../hooks/usePipeline';
import {
  toggleLead as apiToggleLead,
  updateLeadEmail,
  generateEmails,
  getSessions,
} from '../services/api';
import type { Lead, SearchSession } from '../types';
import PipelineStepper from '../components/PipelineStepper';
import LeadList from '../components/LeadList';
import EmailPreview from '../components/EmailPreview';
import ExportSummary from '../components/ExportSummary';

type Tab = 'leads' | 'outreach' | 'export';

export default function ResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const {
    status: pipelineStatus,
    currentStep,
    isRunning,
    error: pipelineError,
    leads: pipelineLeads,
    refetchLeads,
  } = usePipeline(sessionId || null);

  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [session, setSession] = useState<SearchSession | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [generatingEmails, setGeneratingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync pipeline leads to local state
  useEffect(() => {
    if (pipelineLeads.length > 0) {
      setLeads(pipelineLeads);
    }
  }, [pipelineLeads]);

  // Load session info
  useEffect(() => {
    if (!sessionId) return;
    getSessions()
      .then((sessions) => {
        const found = sessions.find((s) => s.id === sessionId);
        if (found) setSession(found);
      })
      .catch(() => {});
  }, [sessionId]);

  const handleToggleLead = useCallback(
    async (leadId: string, selected: boolean) => {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, is_selected: selected } : l
        )
      );
      try {
        await apiToggleLead(leadId, selected);
      } catch {
        // Revert on failure
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, is_selected: !selected } : l
          )
        );
      }
    },
    []
  );

  const handleSaveEmail = async (
    leadId: string,
    subject: string,
    body: string
  ) => {
    setSavingEmail(true);
    try {
      await updateLeadEmail(leadId, subject, body);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, email_subject: subject, personalized_email: body }
            : l
        )
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const handleRegenerateEmail = async (_leadId: string) => {
    if (!sessionId) return;
    setGeneratingEmails(true);
    setError(null);
    try {
      await generateEmails(sessionId, '');
      await refetchLeads();
    } catch {
      setError('Failed to regenerate email.');
    } finally {
      setGeneratingEmails(false);
    }
  };

  const handleGenerateAllEmails = async () => {
    if (!sessionId) return;
    setGeneratingEmails(true);
    setError(null);
    try {
      await generateEmails(sessionId, '');
      await refetchLeads();
    } catch {
      setError('Failed to generate emails.');
    } finally {
      setGeneratingEmails(false);
    }
  };

  const selectedLeads = leads.filter((l) => l.is_selected);

  const tabs: { key: Tab; label: string; icon: typeof Users; count?: number }[] =
    [
      { key: 'leads', label: 'Leads', icon: Users, count: leads.length },
      {
        key: 'outreach',
        label: 'Outreach',
        icon: Mail,
        count: selectedLeads.length,
      },
      { key: 'export', label: 'Export', icon: Download },
    ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'running':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-[#94a3b8] bg-[#1e1e2e] border-[#1e1e2e]';
    }
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#94a3b8]">Invalid session.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Header */}
      {session && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#e2e8f0] truncate">
                {session.raw_query}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                    pipelineStatus?.status || session.status
                  )}`}
                >
                  {pipelineStatus?.status || session.status}
                </span>
                <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <Hash className="w-3 h-3" />
                  {leads.length} leads
                </div>
                <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Stepper */}
      {pipelineStatus && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-4">
          <PipelineStepper
            currentStep={currentStep}
            status={pipelineStatus.status}
          />
          {isRunning && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <p className="text-sm text-[#94a3b8]">
                {currentStep}...{' '}
                <span className="text-blue-400 font-medium">
                  {Math.round(pipelineStatus.progress_pct)}%
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {(pipelineError || error) && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{pipelineError || error}</p>
        </div>
      )}

      {/* Content */}
      {!isRunning && leads.length > 0 && (
        <>
          {/* Tab Bar */}
          <div className="flex border-b border-[#1e1e2e]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-[#1e1e2e] text-[#94a3b8]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'leads' && (
              <LeadList leads={leads} onToggle={handleToggleLead} />
            )}

            {activeTab === 'outreach' && (
              <div className="space-y-4">
                {selectedLeads.length === 0 ? (
                  <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-8 text-center">
                    <Mail className="w-8 h-8 text-[#94a3b8] mx-auto mb-3" />
                    <p className="text-sm text-[#94a3b8]">
                      Select leads from the Leads tab to generate personalized
                      outreach emails.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Generate all emails button */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#94a3b8]">
                        <span className="text-[#e2e8f0] font-semibold">
                          {selectedLeads.length}
                        </span>{' '}
                        selected leads
                      </p>
                      <button
                        onClick={handleGenerateAllEmails}
                        disabled={generatingEmails}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
                      >
                        {generatingEmails ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {generatingEmails
                          ? 'Generating...'
                          : 'Generate All Emails'}
                      </button>
                    </div>

                    {selectedLeads.map((lead) => (
                      <EmailPreview
                        key={lead.id}
                        lead={lead}
                        onSave={handleSaveEmail}
                        onRegenerate={handleRegenerateEmail}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'export' && (
              <ExportSummary leads={leads} sessionId={sessionId} />
            )}
          </div>
        </>
      )}

      {/* Loading state when pipeline just completed but leads haven't loaded */}
      {!isRunning && leads.length === 0 && !pipelineError && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-3" />
          <p className="text-sm text-[#94a3b8]">Loading results...</p>
        </div>
      )}
    </div>
  );
}
