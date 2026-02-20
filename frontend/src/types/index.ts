export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface SearchSession {
  id: string;
  raw_query: string;
  status: string;
  result_count: number;
  created_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_status: string;
  phone: string;
  job_title: string;
  headline: string;
  linkedin_url: string;
  city: string;
  state: string;
  country: string;
  company_name: string;
  company_domain: string;
  company_industry: string;
  company_size: string;
  company_linkedin_url: string;
  scraped_context: string;
  personalized_email: string;
  email_subject: string;
  suggested_approach: string;
  is_selected: boolean;
}

export interface LogEntry {
  step: string;
  emoji: string;
  message: string;
  detail?: string;
  timestamp: string;
}

export interface PipelineStatus {
  session_id: string;
  status: string;
  result_count: number;
  current_step: string;
  progress_pct: number;
  message: string;
  logs: LogEntry[];
}

export interface ApiKeyStatus {
  service: string;
  configured: boolean;
  masked_key: string;
}

export interface ApiKeyTestResult {
  service: string;
  status: 'valid' | 'invalid';
  message: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  cost: string;
  recommended_for: string;
}
