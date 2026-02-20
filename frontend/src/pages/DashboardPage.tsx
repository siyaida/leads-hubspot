import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
  Zap,
  AlertTriangle,
  Check,
  X,
  Info,
  Key,
} from 'lucide-react';
import { runPipeline, getSessions, getPipelineStatus, getKeyStatuses } from '../services/api';
import type { SearchSession, PipelineStatus } from '../types';
import PipelineStepper from '../components/PipelineStepper';

const examplePrompts = [
  'CTOs of Series B SaaS companies in Saudi Arabia',
  'Marketing directors at e-commerce companies in the GCC',
  'Founders of AI startups in Riyadh',
  'VPs of Business Development at FinTech companies in UAE',
];

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const [senderContext, setSenderContext] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [keyStatus, setKeyStatus] = useState<Record<string, { configured: boolean; masked_key: string }> | null>(null);
  const navigate = useNavigate();

  const missingRequired = keyStatus
    ? (['serper', 'openai'] as const).filter((k) => !keyStatus[k]?.configured)
    : [];
  const apolloMissing = keyStatus ? !keyStatus['apollo']?.configured : false;
  const allRequiredMissing = missingRequired.length > 0;

  // Check API key status
  useEffect(() => {
    getKeyStatuses()
      .then((data) => setKeyStatus(data))
      .catch(() => {});
  }, []);

  // Load recent sessions
  useEffect(() => {
    getSessions()
      .then((data) => {
        setSessions(data.slice(0, 5));
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => setLoadingSessions(false));
  }, []);

  // Poll pipeline status when running
  useEffect(() => {
    if (!isRunning || !pipelineStatus?.session_id) return;

    const interval = setInterval(async () => {
      try {
        const status = await getPipelineStatus(pipelineStatus.session_id);
        setPipelineStatus(status);

        if (status.status === 'completed') {
          clearInterval(interval);
          setIsRunning(false);
          navigate(`/session/${status.session_id}`);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setIsRunning(false);
          setError('Pipeline failed. Please try again.');
        }
      } catch {
        clearInterval(interval);
        setIsRunning(false);
        setError('Lost connection to pipeline.');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, pipelineStatus?.session_id, navigate]);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setError(null);
    setIsRunning(true);
    try {
      const { session_id } = await runPipeline(query.trim(), senderContext.trim());
      setPipelineStatus({
        session_id,
        status: 'running',
        result_count: 0,
        current_step: 'query',
        progress_pct: 0,
      });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      let message: string;
      if (detail && typeof detail === 'object' && 'missing_keys' in (detail as Record<string, unknown>)) {
        const d = detail as { message: string; missing_keys: string[] };
        message = d.message;
      } else if (typeof detail === 'string') {
        message = detail;
      } else {
        message = 'Failed to start pipeline. Please try again.';
      }
      setError(message);
      setIsRunning(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0] flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          Generate Leads
        </h1>
        <p className="text-[#94a3b8] mt-1">
          Describe your ideal customer profile and let AI find decision-makers
        </p>
      </div>

      {/* API Key Warning Banner */}
      {keyStatus && allRequiredMissing && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-sm font-semibold text-amber-400">
              API keys required to generate leads
            </h3>
          </div>
          <div className="space-y-1.5 ml-7">
            {(['serper', 'openai', 'apollo'] as const).map((key) => {
              const label =
                key === 'serper'
                  ? 'Serper.dev (web search)'
                  : key === 'openai'
                  ? 'OpenAI (AI processing)'
                  : 'Apollo.io (contact enrichment)';
              const isConfigured = keyStatus[key]?.configured;
              const isRequired = key !== 'apollo';
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  {isConfigured ? (
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={isConfigured ? 'text-green-400' : 'text-red-400'}>
                    {label}
                    {!isRequired && ' (optional)'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="ml-7">
            <Link
              to="/settings"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <Key className="w-3 h-3" />
              Configure in Settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Apollo-only Info Banner */}
      {keyStatus && !allRequiredMissing && apolloMissing && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-400">
              Apollo.io key not configured — leads will be created from search results only (no contact enrichment).{' '}
              <Link
                to="/settings"
                className="underline hover:text-blue-300"
              >
                Configure in Settings
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Pipeline Running State */}
      {isRunning && pipelineStatus && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6">
          <PipelineStepper
            currentStep={pipelineStatus.current_step}
            status={pipelineStatus.status}
          />
          <div className="mt-4 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <p className="text-sm text-[#94a3b8]">
              Processing your query...{' '}
              <span className="text-blue-400 font-medium">
                {Math.round(pipelineStatus.progress_pct)}%
              </span>
            </p>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-[#1e1e2e] rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{
                width: `${pipelineStatus.progress_pct}%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Query Input */}
      {!isRunning && (
        <>
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-6 space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="e.g., CTOs of Series B SaaS companies in Saudi Arabia with 50-200 employees..."
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8] resize-none"
              />
              <span className="absolute bottom-3 right-3 text-xs text-[#94a3b8]">
                {query.length}/500
              </span>
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#94a3b8]">
                Try an example:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="text-left px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:border-blue-500/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Context */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Sender Context{' '}
                <span className="text-[#94a3b8]/60">(optional)</span>
              </label>
              <textarea
                value={senderContext}
                onChange={(e) => setSenderContext(e.target.value)}
                rows={2}
                placeholder="Describe your company for personalized outreach. e.g., We are Siyada Tech, a B2B AI solutions provider based in Riyadh..."
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-xs text-[#e2e8f0] placeholder-[#94a3b8] resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={allRequiredMissing ? undefined : handleGenerate}
              disabled={!query.trim() || isRunning || allRequiredMissing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              {allRequiredMissing ? (
                <>
                  <Key className="w-5 h-5" />
                  Configure API Keys First
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Leads
                </>
              )}
            </button>
          </div>

          {/* Recent Searches */}
          <div>
            <h2 className="text-lg font-semibold text-[#e2e8f0] flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#94a3b8]" />
              Recent Searches
            </h2>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#94a3b8] animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-6 text-center">
                <p className="text-sm text-[#94a3b8]">
                  No searches yet. Start by describing your ideal customer
                  profile above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => navigate(`/session/${session.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-[#12121a] border border-[#1e1e2e] rounded-lg hover:border-blue-500/40 text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#e2e8f0] truncate">
                        {session.raw_query}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#94a3b8]">
                          {formatDate(session.created_at)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                        {session.result_count > 0 && (
                          <span className="text-xs text-[#94a3b8]">
                            {session.result_count} leads
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#94a3b8] group-hover:text-blue-500 shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
