import { useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  Building2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Users,
  Factory,
  FileText,
  Lightbulb,
  Shield,
  ExternalLink,
} from 'lucide-react';
import type { Lead } from '../types';

interface LeadDetailOverlayProps {
  lead: Lead;
  onClose: () => void;
}

export default function LeadDetailOverlay({
  lead,
  onClose,
}: LeadDetailOverlayProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const fullName =
    [lead.first_name, lead.last_name]
      .filter((v) => v && v !== 'null')
      .join(' ') || 'Unknown Contact';

  const location = [lead.city, lead.state, lead.country]
    .filter((v) => v && v !== 'null')
    .join(', ');

  const emailStatusColor =
    lead.email_status === 'verified'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : lead.email_status === 'unverified'
      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      : 'bg-[#1e1e2e] text-[#94a3b8] border-[#1e1e2e]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#12121a] border border-[#1e1e2e] rounded-xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#12121a] border-b border-[#1e1e2e] px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#e2e8f0] truncate">
              {fullName}
            </h2>
            <p className="text-sm text-[#94a3b8] mt-0.5">
              {lead.job_title || lead.headline || 'No title available'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-[#1e1e2e] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Contact Info ─────────────────────────────────────── */}
          <Section title="Contact" icon={User}>
            <InfoRow icon={Mail} label="Email" value={lead.email}>
              {lead.email_status && (
                <span
                  className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border ${emailStatusColor}`}
                >
                  {lead.email_status}
                </span>
              )}
            </InfoRow>
            <InfoRow icon={Phone} label="Phone" value={lead.phone} />
            <InfoRow icon={MapPin} label="Location" value={location} />
            {lead.linkedin_url && (
              <div className="flex items-center gap-3 py-2">
                <Linkedin className="w-4 h-4 text-[#94a3b8] shrink-0" />
                <span className="text-xs text-[#64748b] w-20 shrink-0">
                  LinkedIn
                </span>
                <a
                  href={lead.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                >
                  {lead.linkedin_url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </Section>

          {/* ── Role ─────────────────────────────────────────────── */}
          <Section title="Role" icon={Briefcase}>
            <InfoRow icon={Briefcase} label="Title" value={lead.job_title} />
            {lead.headline && lead.headline !== lead.job_title && (
              <InfoRow icon={FileText} label="Headline" value={lead.headline} />
            )}
          </Section>

          {/* ── Company ──────────────────────────────────────────── */}
          <Section title="Company" icon={Building2}>
            <InfoRow
              icon={Building2}
              label="Name"
              value={lead.company_name}
            />
            <InfoRow icon={Globe} label="Domain" value={lead.company_domain}>
              {lead.company_domain && (
                <a
                  href={`https://${lead.company_domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              )}
            </InfoRow>
            <InfoRow
              icon={Factory}
              label="Industry"
              value={lead.company_industry}
            />
            <InfoRow icon={Users} label="Size" value={lead.company_size} />
            {lead.company_linkedin_url && (
              <div className="flex items-center gap-3 py-2">
                <Linkedin className="w-4 h-4 text-[#94a3b8] shrink-0" />
                <span className="text-xs text-[#64748b] w-20 shrink-0">
                  LinkedIn
                </span>
                <a
                  href={lead.company_linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                >
                  Company Page
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </Section>

          {/* ── Scraped Context ───────────────────────────────────── */}
          {lead.scraped_context && (
            <Section title="Website Context" icon={Globe}>
              <p className="text-sm text-[#94a3b8] leading-relaxed whitespace-pre-wrap">
                {lead.scraped_context}
              </p>
            </Section>
          )}

          {/* ── Outreach ─────────────────────────────────────────── */}
          {(lead.personalized_email || lead.suggested_approach) && (
            <Section title="Outreach" icon={Mail}>
              {lead.suggested_approach && (
                <div className="mb-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">
                      Suggested Approach
                    </span>
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">
                    {lead.suggested_approach}
                  </p>
                </div>
              )}
              {lead.email_subject && (
                <div className="mb-2">
                  <span className="text-xs text-[#64748b]">Subject:</span>
                  <p className="text-sm text-[#e2e8f0] font-medium mt-0.5">
                    {lead.email_subject}
                  </p>
                </div>
              )}
              {lead.personalized_email && (
                <div>
                  <span className="text-xs text-[#64748b]">Email Body:</span>
                  <p className="text-sm text-[#94a3b8] leading-relaxed mt-1 whitespace-pre-wrap">
                    {lead.personalized_email}
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* ── Selection Status ──────────────────────────────────── */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e2e]">
            <Shield className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="text-xs text-[#64748b]">
              {lead.is_selected
                ? 'This lead is selected for outreach'
                : 'This lead is not selected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ─────────────────────────────────────────────── */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-semibold text-[#e2e8f0] uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="ml-6 space-y-0.5">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof Mail;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-[#94a3b8] shrink-0" />
      <span className="text-xs text-[#64748b] w-20 shrink-0">{label}</span>
      <span className="text-sm text-[#e2e8f0] truncate">{value}</span>
      {children}
    </div>
  );
}
