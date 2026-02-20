import { useState, useEffect, useRef, useCallback } from 'react';
import type { Lead, PipelineStatus } from '../types';
import { getPipelineStatus, getLeads } from '../services/api';

interface UsePipelineReturn {
  status: PipelineStatus | null;
  progress: number;
  currentStep: string;
  isRunning: boolean;
  error: string | null;
  leads: Lead[];
  refetchLeads: () => Promise<void>;
}

export function usePipeline(sessionId: string | null): UsePipelineReturn {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const poll = async () => {
      try {
        const pipelineStatus = await getPipelineStatus(sessionId);
        setStatus(pipelineStatus);

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

    // Set up polling every 2 seconds
    intervalRef.current = setInterval(poll, 2000);

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
    refetchLeads: fetchLeads,
  };
}
