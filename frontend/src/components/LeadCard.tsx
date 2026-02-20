import { MapPin, Linkedin, Mail, Building2 } from 'lucide-react';
import type { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onToggle: (leadId: string, selected: boolean) => void;
  onSelect?: (lead: Lead) => void;
}

export default function LeadCard({ lead, onToggle, onSelect }: LeadCardProps) {
  const fullName = [lead.first_name, lead.last_name]
    .filter((v) => v && v !== 'null')
    .join(' ') || '';
  const location = [lead.city, lead.state, lead.country]
    .filter((v) => v && v !== 'null')
    .join(', ');

  return (
    <div
      className={`bg-[#12121a] border rounded-lg p-4 hover:border-blue-500/40 cursor-pointer ${
        lead.is_selected ? 'border-blue-500/60' : 'border-[#1e1e2e]'
      }`}
      onClick={() => onSelect?.(lead)}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={lead.is_selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(lead.id, !lead.is_selected);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded border-[#1e1e2e] bg-[#0a0a0f] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 accent-blue-500"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#e2e8f0] truncate">
            {fullName || 'Unknown Contact'}
          </h3>
          <p className="text-xs text-[#94a3b8] truncate">
            {lead.job_title || lead.headline || 'No title'}
          </p>
        </div>
      </div>

      {/* Company row */}
      <div className="mt-3 flex items-center gap-2">
        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="text-sm text-blue-400 truncate">
          {lead.company_name || 'Unknown Company'}
        </span>
        {lead.company_industry && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            {lead.company_industry}
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {lead.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8] truncate max-w-[140px]">
              {lead.email}
            </span>
            {lead.email_status && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  lead.email_status === 'verified'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : lead.email_status === 'unverified'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'bg-[#1e1e2e] text-[#94a3b8]'
                }`}
              >
                {lead.email_status}
              </span>
            )}
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#94a3b8]" />
            <span className="text-xs text-[#94a3b8] truncate max-w-[120px]">
              {location}
            </span>
          </div>
        )}

        {lead.linkedin_url && (
          <a
            href={lead.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-400 hover:text-blue-300"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
