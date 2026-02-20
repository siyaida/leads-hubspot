import { useState } from 'react';
import { Save, RefreshCw, User, Building2, MapPin, Briefcase, Lightbulb } from 'lucide-react';
import type { Lead } from '../types';

interface EmailPreviewProps {
  lead: Lead;
  onSave: (leadId: string, subject: string, body: string) => Promise<void>;
  onRegenerate: (leadId: string) => Promise<void>;
}

export default function EmailPreview({
  lead,
  onSave,
  onRegenerate,
}: EmailPreviewProps) {
  const [subject, setSubject] = useState(lead.email_subject || '');
  const [body, setBody] = useState(lead.personalized_email || '');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const fullName = `${lead.first_name} ${lead.last_name}`.trim();
  const location = [lead.city, lead.state, lead.country]
    .filter(Boolean)
    .join(', ');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(lead.id, subject, body);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerate(lead.id);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-5">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Lead info */}
        <div className="lg:w-1/3 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-[#e2e8f0]">
              {fullName || 'Unknown Contact'}
            </h3>
          </div>
          {lead.job_title && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#94a3b8]" />
              <p className="text-xs text-[#94a3b8]">{lead.job_title}</p>
            </div>
          )}
          {lead.company_name && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
              <p className="text-xs text-[#94a3b8]">{lead.company_name}</p>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#94a3b8]" />
              <p className="text-xs text-[#94a3b8]">{location}</p>
            </div>
          )}

          {lead.suggested_approach && (
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">
                  Suggested Approach
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {lead.suggested_approach}
              </p>
            </div>
          )}
        </div>

        {/* Right: Email editor */}
        <div className="lg:w-2/3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8]"
              placeholder="Email subject..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8] resize-y"
              placeholder="Email body..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`}
              />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
