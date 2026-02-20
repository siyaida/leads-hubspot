import { useState } from 'react';
import {
  Download,
  Users,
  MailCheck,
  FileText,
  Building2,
  Send,
  Table2,
  Settings2,
  ChevronRight,
  Info,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';
import type { Lead } from '../types';
import { downloadExportCsv } from '../services/api';

/* ── Field definitions (mirrors backend FIELD_DEFINITIONS keys) ── */
const ALL_FIELDS: { key: string; label: string }[] = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'job_title', label: 'Job Title' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'company_name', label: 'Company Name' },
  { key: 'company_domain', label: 'Company Domain' },
  { key: 'website_url', label: 'Website URL' },
  { key: 'industry', label: 'Industry' },
  { key: 'company_size', label: 'Number of Employees' },
  { key: 'company_linkedin_url', label: 'Company LinkedIn URL' },
  { key: 'description', label: 'Description' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State/Region' },
  { key: 'country', label: 'Country/Region' },
  { key: 'street_address', label: 'Street Address' },
  { key: 'email_subject', label: 'Email Subject' },
  { key: 'personalized_email', label: 'Personalized Email Draft' },
  { key: 'suggested_approach', label: 'Suggested Approach' },
];

/* ── Export type configs ── */
interface ExportTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
  borderColor: string;
  fields: string[];
  hubspotGuide: string[];
  tips: string[];
  warnings: string[];
}

const EXPORT_TYPES: ExportTypeConfig[] = [
  {
    id: 'contacts',
    name: 'Contacts Only',
    description: 'Contact details ready for HubSpot Contacts import',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    fields: ['first_name', 'last_name', 'email', 'phone', 'job_title', 'linkedin_url'],
    hubspotGuide: [
      'Go to Contacts > Contacts in HubSpot',
      'Click "Import" in the top right',
      'Choose "File from computer" > "One file" > "One object"',
      'Select "Contacts" as the object type',
      'Upload the CSV and map columns (most will auto-map)',
      'Review and complete the import',
    ],
    tips: [
      'HubSpot deduplicates contacts by email — existing contacts will be updated',
      'LinkedIn URL imports as a custom property; create it first in Settings > Properties',
      'Use "Job Title" mapping for accurate persona segmentation',
    ],
    warnings: [
      'Contacts without an email address may fail to import or create duplicates',
    ],
  },
  {
    id: 'companies',
    name: 'Companies Only',
    description: 'Company data for HubSpot Companies import',
    icon: Building2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    fields: ['company_name', 'company_domain', 'website_url', 'industry', 'company_size', 'company_linkedin_url'],
    hubspotGuide: [
      'Go to Contacts > Companies in HubSpot',
      'Click "Import" in the top right',
      'Choose "File from computer" > "One file" > "One object"',
      'Select "Companies" as the object type',
      'Map "Company Domain Name" — this is the primary dedup key',
      'Review and complete the import',
    ],
    tips: [
      'HubSpot deduplicates companies by domain — this is the most important field',
      'Import companies BEFORE contacts so associations can be auto-created',
      '"Number of Employees" maps to the built-in company size property',
    ],
    warnings: [
      'Companies without a domain will not auto-associate with contacts',
    ],
  },
  {
    id: 'contacts_companies',
    name: 'Contacts + Companies',
    description: 'Combined contact & company data in one file',
    icon: Table2,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    fields: [
      'first_name', 'last_name', 'email', 'phone', 'job_title', 'linkedin_url',
      'company_name', 'company_domain', 'website_url', 'industry', 'company_size',
    ],
    hubspotGuide: [
      'Go to Contacts > Contacts in HubSpot',
      'Click "Import" > "File from computer" > "One file"',
      'Select "Two objects" — Contacts AND Companies',
      'Upload the CSV file',
      'Map contact fields (First Name, Last Name, Email, etc.)',
      'Map company fields (Company Name, Domain, etc.)',
      'HubSpot will auto-associate contacts with their companies',
    ],
    tips: [
      'This is the recommended import for fresh CRM setups — creates both records at once',
      'Company Domain links contacts to companies automatically',
      'You can re-import to update existing records without creating duplicates',
    ],
    warnings: [
      'Ensure "Company Domain Name" is mapped — it\'s required for the two-object import',
    ],
  },
  {
    id: 'outreach',
    name: 'Outreach Ready',
    description: 'Contacts with personalized emails for outreach tools',
    icon: Send,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    fields: [
      'first_name', 'last_name', 'email', 'job_title', 'company_name',
      'email_subject', 'personalized_email', 'suggested_approach',
    ],
    hubspotGuide: [
      'Create custom properties in HubSpot for "Email Subject", "Personalized Email Draft", and "Suggested Approach"',
      'Go to Contacts > Import > "File from computer"',
      'Choose "One file" > "One object" > "Contacts"',
      'Map standard fields, then map custom fields to your new properties',
      'Use Sequences or Workflows to send the personalized emails',
    ],
    tips: [
      'Import into HubSpot then use Sequences to automate the outreach flow',
      'The "Suggested Approach" field helps your sales team personalize follow-ups',
      'You can also paste emails directly into tools like Lemlist or Apollo',
      'Review generated emails before sending — AI drafts benefit from a human touch',
    ],
    warnings: [
      'Email drafts require the email generation step to be completed first',
      'Contacts without verified emails may bounce — check email_status before sending',
    ],
  },
  {
    id: 'full',
    name: 'Full Export',
    description: 'All 19 columns — complete dataset with everything',
    icon: FileText,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    fields: ALL_FIELDS.map((f) => f.key),
    hubspotGuide: [
      'Go to Contacts > Import in HubSpot',
      'Choose "File from computer" > "One file" > "One object" > "Contacts"',
      'Upload the CSV — HubSpot will auto-detect most standard columns',
      'Create custom properties for non-standard fields before importing',
      'Map all columns and complete the import',
    ],
    tips: [
      'Best for data archiving or when you need every available field',
      'Some columns like Description and Suggested Approach need custom HubSpot properties',
      'Consider using Contacts + Companies export instead for cleaner CRM imports',
    ],
    warnings: [],
  },
  {
    id: 'custom',
    name: 'Custom Export',
    description: 'Pick exactly which fields to include',
    icon: Settings2,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    fields: [],
    hubspotGuide: [
      'Select the fields you need from the checklist below',
      'Download your custom CSV',
      'In HubSpot, go to Import > "File from computer"',
      'Map each column to the corresponding HubSpot property',
    ],
    tips: [
      'Include "Email" for contact imports — it\'s the primary identifier',
      'Include "Company Domain" if you want auto-association with companies',
      'Keep exports lean — only include fields you\'ll actually use in HubSpot',
    ],
    warnings: [],
  },
];

/* ── Component ── */
interface ExportSummaryProps {
  leads: Lead[];
  sessionId: string;
}

export default function ExportSummary({ leads, sessionId }: ExportSummaryProps) {
  const totalLeads = leads.length;
  const verifiedEmails = leads.filter((l) => l.email_status === 'verified').length;
  const emailsGenerated = leads.filter((l) => l.personalized_email).length;

  const [selectedType, setSelectedType] = useState<string>('contacts_companies');
  const [customFields, setCustomFields] = useState<Set<string>>(
    new Set(['first_name', 'last_name', 'email'])
  );
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = EXPORT_TYPES.find((t) => t.id === selectedType)!;
  const isCustom = selectedType === 'custom';
  const activeFields = isCustom ? Array.from(customFields) : activeConfig.fields;
  const fieldCount = activeFields.length;

  const toggleCustomField = (key: string) => {
    setCustomFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDownload = async () => {
    if (isCustom && customFields.size === 0) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadExportCsv(
        sessionId,
        selectedType,
        isCustom ? Array.from(customFields) : undefined
      );
    } catch {
      setError('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Verified Emails',
      value: verifiedEmails,
      icon: MailCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Emails Generated',
      value: emailsGenerated,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[#12121a] border ${stat.borderColor} rounded-lg p-5`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e2e8f0]">{stat.value}</p>
                <p className="text-xs text-[#94a3b8]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Type Cards — 2x3 grid */}
      <div>
        <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
          Choose Export Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXPORT_TYPES.map((type) => {
            const isActive = selectedType === type.id;
            const count = type.id === 'custom'
              ? customFields.size
              : type.fields.length;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  isActive
                    ? `${type.borderColor} ${type.bgColor} ring-1 ring-${type.color.replace('text-', '')}`
                    : 'border-[#1e1e2e] bg-[#12121a] hover:border-[#2e2e3e]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isActive ? type.bgColor : 'bg-[#1a1a2e]'
                      }`}
                    >
                      <type.icon
                        className={`w-4.5 h-4.5 ${isActive ? type.color : 'text-[#64748b]'}`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'
                        }`}
                      >
                        {type.name}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">{count} fields</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className={`w-5 h-5 rounded-full ${type.bgColor} flex items-center justify-center`}>
                      <Check className={`w-3 h-3 ${type.color}`} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#64748b] mt-2 line-clamp-2">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 border-b border-[#1e1e2e] ${activeConfig.bgColor}`}>
          <div className="flex items-center gap-3">
            <activeConfig.icon className={`w-5 h-5 ${activeConfig.color}`} />
            <div>
              <h3 className="text-base font-semibold text-[#e2e8f0]">
                {activeConfig.name}
              </h3>
              <p className="text-xs text-[#94a3b8]">
                {fieldCount} column{fieldCount !== 1 ? 's' : ''} will be exported
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Custom field selector */}
          {isCustom && (
            <div>
              <p className="text-sm font-medium text-[#e2e8f0] mb-2">Select Fields</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {ALL_FIELDS.map((f) => {
                  const checked = customFields.has(f.key);
                  return (
                    <label
                      key={f.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-rose-500/40 bg-rose-500/10 text-[#e2e8f0]'
                          : 'border-[#1e1e2e] bg-[#0a0a14] text-[#64748b] hover:border-[#2e2e3e]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCustomField(f.key)}
                        className="sr-only"
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                          checked
                            ? 'bg-rose-500 border-rose-500'
                            : 'border-[#3e3e4e] bg-transparent'
                        }`}
                      >
                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* CSV Columns preview */}
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] mb-2">CSV Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {activeFields.map((key) => {
                const field = ALL_FIELDS.find((f) => f.key === key);
                return (
                  <span
                    key={key}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${activeConfig.bgColor} ${activeConfig.color} border ${activeConfig.borderColor}`}
                  >
                    {field?.label ?? key}
                  </span>
                );
              })}
              {isCustom && customFields.size === 0 && (
                <span className="text-xs text-[#64748b] italic">
                  No fields selected — pick at least one above
                </span>
              )}
            </div>
          </div>

          {/* HubSpot Import Guide */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-medium text-[#e2e8f0]">HubSpot Import Guide</p>
            </div>
            <ol className="space-y-1.5 ml-1">
              {activeConfig.hubspotGuide.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-[#94a3b8]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a1a2e] text-[#64748b] flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {activeConfig.tips.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-[#e2e8f0]">Tips & Best Practices</p>
              </div>
              <ul className="space-y-1.5 ml-1">
                {activeConfig.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[#94a3b8]">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">&#x2022;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {activeConfig.warnings.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">Heads Up</p>
              </div>
              <ul className="space-y-1">
                {activeConfig.warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-300/80">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Download Button */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading || (isCustom && customFields.size === 0)}
              className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 font-semibold rounded-lg text-sm transition-colors ${
                isCustom && customFields.size === 0
                  ? 'bg-[#1a1a2e] text-[#64748b] cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white'
              }`}
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {downloading
                ? 'Downloading...'
                : `Download ${activeConfig.name} CSV (${fieldCount} columns)`}
            </button>
            {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
