import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';

interface ActivityFeedProps {
  logs: LogEntry[];
  progress: number;
}

export default function ActivityFeed({ logs, progress }: ActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-[#1e1e2e]">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Log entries */}
      <div className="max-h-72 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        {logs.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 animate-fade-in"
          >
            <span className="text-sm leading-6 shrink-0 w-5 text-center">
              {entry.emoji || '•'}
            </span>
            <span className="text-sm text-[#c8d0da] leading-6">
              {entry.message}
            </span>
          </div>
        ))}

        {/* Typing indicator when in progress */}
        {progress > 0 && progress < 100 && (
          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-sm leading-6 shrink-0 w-5 text-center text-blue-400">
              ⏳
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer with progress */}
      <div className="border-t border-[#1e1e2e] px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-[#64748b]">
          {logs.length} events
        </span>
        <span className="text-xs font-medium text-blue-400">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
