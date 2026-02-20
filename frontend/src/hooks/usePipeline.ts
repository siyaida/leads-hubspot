import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lead, PipelineStatus, LogEntry } from '../types';
import { getPipelineStatus, getLeads } from '../services/api';

interface UsePipelineReturn {
  status: PipelineStatus | null;
  progress: number;
  currentStep: string;
  isRunning: boolean;
  error: string | null;
  leads: Lead[];
  logs: LogEntry[];
  refetchLeads: () => Promise<void>;
}

export function usePipeline(sessionId: string | null): UsePipelineReturn {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logCountRef = useRef(0);

  const fetchLeads = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await getLeads(sessionId);
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    // Reset on new session
    logCountRef.current = 0;
    setLogs([]);

    const poll = async () => {
      try {
        const pipelineStatus = await getPipelineStatus(
          sessionId,
          logCountRef.current
        );
        setStatus(pipelineStatus);

        // Append new log entries
        if (pipelineStatus.logs && pipelineStatus.logs.length > 0) {
          logCountRef.current += pipelineStatus.logs.length;
          setLogs((prev) => [...prev, ...pipelineStatus.logs]);
        }

        if (
          pipelineStatus.status === 'completed' ||
          pipelineStatus.status === 'failed'
        ) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (pipelineStatus.status === 'completed') {
            await fetchLeads();
          }
          if (pipelineStatus.status === 'failed') {
            setError('Pipeline failed. Please try again.');
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
        setError('Failed to get pipeline status.');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Initial poll
    poll();

    // Poll every 1.5 seconds for smoother updates
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, fetchLeads]);

  const isRunning =
    status !== null &&
    status.status !== 'completed' &&
    status.status !== 'failed';

  return {
    status,
    progress: status?.progress_pct ?? 0,
    currentStep: status?.current_step ?? '',
    isRunning,
    error,
    leads,
    logs,
    refetchLeads: fetchLeads,
  };
}
