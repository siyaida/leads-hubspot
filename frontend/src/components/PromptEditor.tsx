import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Settings2,
  FileText,
  User,
  RotateCcw,
  Loader2,
  Mail,
} from 'lucide-react';
import { getPromptPreview, type PromptPreview } from '../services/api';

interface PromptEditorProps {
  sessionId: string;
  onGenerate: (senderContext: string, systemPrompt: string) => Promise<void>;
  generating: boolean;
  selectedCount: number;
}

export default function PromptEditor({
  sessionId,
  onGenerate,
  generating,
  selectedCount,
}: PromptEditorProps) {
  const [preview, setPreview] = useState<PromptPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // Editable fields
  const [systemPrompt, setSystemPrompt] = useState('');
  const [senderContext, setSenderContext] = useState('');

  // Track defaults for reset
  const [defaultSystemPrompt, setDefaultSystemPrompt] = useState('');

  useEffect(() => {
    setLoading(true);
    getPromptPreview(sessionId)
      .then((data) => {
        setPreview(data);
        setSystemPrompt(data.system_prompt);
        setDefaultSystemPrompt(data.system_prompt);
        setSenderContext(data.sender_context);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const isModified = systemPrompt !== defaultSystemPrompt || senderContext !== (preview?.sender_context ?? '');

  const handleReset = () => {
    setSystemPrompt(defaultSystemPrompt);
    setSenderContext(preview?.sender_context ?? '');
  };

  const handleGenerate = () => {
    onGenerate(
      senderContext,
      systemPrompt !== defaultSystemPrompt ? systemPrompt : '',
    );
  };

  if (loading) {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-sm text-[#94a3b8]">Loading prompt data...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#1e1e2e]/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-[#e2e8f0]">
            Prompt & Context Editor
          </span>
          {isModified && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Modified
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#94a3b8]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#94a3b8]" />
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-[#1e1e2e] px-5 py-4 space-y-5">
          {/* System Prompt */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                System Prompt
              </label>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] font-mono leading-relaxed placeholder-[#94a3b8] resize-y focus:outline-none focus:border-purple-500/50"
            />
            <p className="mt-1 text-[11px] text-[#64748b]">
              This prompt tells the AI how to write emails. Modify to change
              tone, format, or style.
            </p>
          </div>

          {/* Sender Context */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                Sender Context
              </label>
            </div>
            <textarea
              value={senderContext}
              onChange={(e) => setSenderContext(e.target.value)}
              rows={3}
              placeholder="Describe who you are and what you offer, e.g. 'We are Siyada Tech, an AI consulting firm specializing in enterprise automation...'"
              className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#64748b] resize-y focus:outline-none focus:border-blue-500/50"
            />
            <p className="mt-1 text-[11px] text-[#64748b]">
              Your company/product context. The AI uses this to tailor the
              value proposition in each email.
            </p>
          </div>

          {/* Original Query */}
          {preview?.original_query && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-green-400" />
                <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Original Search Query
                </label>
              </div>
              <div className="px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#94a3b8]">
                {preview.original_query}
              </div>
            </div>
          )}

          {/* Lead Data Previews */}
          {preview && preview.leads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <label className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Lead Data Sent to AI ({preview.leads.length} leads)
                </label>
              </div>
              <div className="space-y-1">
                {preview.leads.map((lead) => (
                  <div
                    key={lead.lead_id}
                    className="border border-[#1e1e2e] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedLead(
                          expandedLead === lead.lead_id
                            ? null
                            : lead.lead_id
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1e1e2e]/30 transition-colors"
                    >
                      <span className="text-xs text-[#e2e8f0]">
                        {lead.lead_name}
                      </span>
                      {expandedLead === lead.lead_id ? (
                        <ChevronUp className="w-3 h-3 text-[#94a3b8]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
                      )}
                    </button>
                    {expandedLead === lead.lead_id && (
                      <div className="px-3 py-2 bg-[#0a0a0f] border-t border-[#1e1e2e]">
                        <pre className="text-[11px] text-[#94a3b8] font-mono whitespace-pre-wrap leading-relaxed">
                          {lead.lead_info}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#1e1e2e]">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {generating
                ? 'Generating...'
                : `Generate Emails (${selectedCount})`}
            </button>
            {isModified && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
