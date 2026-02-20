import { useState, useMemo } from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import type { Lead } from '../types';
import LeadCard from './LeadCard';

interface LeadListProps {
  leads: Lead[];
  onToggle: (leadId: string, selected: boolean) => void;
}

export default function LeadList({ leads, onToggle }: LeadListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(q) ||
        (lead.company_name || '').toLowerCase().includes(q) ||
        (lead.job_title || '').toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const selectedCount = leads.filter((l) => l.is_selected).length;

  const handleSelectAll = () => {
    filteredLeads.forEach((lead) => {
      if (!lead.is_selected) {
        onToggle(lead.id, true);
      }
    });
  };

  const handleDeselectAll = () => {
    filteredLeads.forEach((lead) => {
      if (lead.is_selected) {
        onToggle(lead.id, false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#94a3b8]">
            <span className="text-[#e2e8f0] font-semibold">{leads.length}</span>{' '}
            leads found,{' '}
            <span className="text-blue-400 font-semibold">{selectedCount}</span>{' '}
            selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-[#e2e8f0] bg-[#12121a] border border-[#1e1e2e] rounded-lg hover:border-blue-500/40"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-[#e2e8f0] bg-[#12121a] border border-[#1e1e2e] rounded-lg hover:border-blue-500/40"
          >
            <Square className="w-3.5 h-3.5" />
            Deselect All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, company, or title..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8]"
        />
      </div>

      {/* Grid */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#94a3b8] text-sm">No leads match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
