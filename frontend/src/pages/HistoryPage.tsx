import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Loader2,
  Search,
  Users,
  Calendar,
} from 'lucide-react';
import { getSessions } from '../services/api';
import type { SearchSession } from '../types';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getSessions()
      .then((data) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = sessions.filter((s) =>
    s.raw_query.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0] flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#94a3b8]" />
          Search History
        </h1>
        <p className="text-[#94a3b8] mt-1">
          View and revisit your previous lead generation searches
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your history..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8]"
        />
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-8 text-center">
          <Clock className="w-8 h-8 text-[#94a3b8] mx-auto mb-3" />
          <p className="text-sm text-[#94a3b8]">
            {searchQuery
              ? 'No sessions match your search.'
              : 'No search history yet. Start by generating leads from the Dashboard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => navigate(`/session/${session.id}`)}
              className="w-full flex items-center justify-between p-4 bg-[#12121a] border border-[#1e1e2e] rounded-lg hover:border-blue-500/40 text-left group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#e2e8f0] truncate">
                  {session.raw_query}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                  {session.result_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                      <Users className="w-3 h-3" />
                      {session.result_count} leads
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                    <Calendar className="w-3 h-3" />
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94a3b8] group-hover:text-blue-500 shrink-0 ml-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
