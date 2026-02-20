import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Users,
  Brain,
  FlaskConical,
  AlertCircle,
  ArrowRight,
  Zap,
  Cpu,
  Crown,
  Sparkles,
  CircleDollarSign,
  Rocket,
} from 'lucide-react';
import {
  getKeyStatuses,
  updateKeys,
  testKey,
  getModels,
  updateModel,
} from '../services/api';
import type { ApiKeyStatus, ApiKeyTestResult, ModelInfo } from '../types';

interface ServiceConfig {
  service: string;
  name: string;
  description: string;
  url: string;
  icon: typeof Search;
}

const services: ServiceConfig[] = [
  {
    service: 'serper',
    name: 'Serper.dev',
    description: 'Web search API for finding companies and prospects',
    url: 'https://serper.dev',
    icon: Search,
  },
  {
    service: 'apollo',
    name: 'Apollo.io',
    description: 'Contact enrichment for finding decision-makers',
    url: 'https://apollo.io',
    icon: Users,
  },
  {
    service: 'openai',
    name: 'OpenAI',
    description: 'AI models for query parsing and email generation',
    url: 'https://openai.com',
    icon: Brain,
  },
];

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [keyStatuses, setKeyStatuses] = useState<
    Record<string, ApiKeyStatus>
  >({});
  const [testResults, setTestResults] = useState<
    Record<string, ApiKeyTestResult>
  >({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('gpt-4o-mini');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [modelSaving, setModelSaving] = useState(false);
  const [modelSaveSuccess, setModelSaveSuccess] = useState(false);

  const fetchStatuses = async () => {
    try {
      const data = await getKeyStatuses();
      setKeyStatuses(data as unknown as Record<string, ApiKeyStatus>);
      // Extract current_model from settings response
      const settingsData = data as unknown as Record<string, unknown>;
      if (settingsData.current_model) {
        setCurrentModel(settingsData.current_model as string);
        setSelectedModel(settingsData.current_model as string);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchModels();
  }, []);

  const handleTestKey = async (service: string) => {
    setTesting((prev) => ({ ...prev, [service]: true }));
    try {
      // If there's a key in the input, save it first then test
      const inputKey = (apiKeys[service] || '').trim();
      if (inputKey) {
        await updateKeys({ [service]: inputKey });
        setApiKeys((prev) => ({ ...prev, [service]: '' }));
        await fetchStatuses();
      }
      const result = await testKey(service);
      setTestResults((prev) => ({ ...prev, [service]: result }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [service]: {
          service,
          status: 'invalid',
          message: 'Failed to test key. Please try again.',
        },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [service]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    // Only send non-empty keys
    const keysToSend: Record<string, string> = {};
    Object.entries(apiKeys).forEach(([service, key]) => {
      if (key.trim()) {
        keysToSend[service] = key.trim();
      }
    });

    if (Object.keys(keysToSend).length === 0) {
      setSaveError('No keys to save. Enter at least one API key.');
      setSaving(false);
      return;
    }

    try {
      await updateKeys(keysToSend);
      setSaveSuccess(true);
      // Clear inputs after save
      setApiKeys((prev) => {
        const cleared: Record<string, string> = {};
        Object.keys(prev).forEach((k) => {
          cleared[k] = '';
        });
        return cleared;
      });
      // Refresh statuses
      await fetchStatuses();
      setTimeout(() => setSaveSuccess(false), 8000);
    } catch {
      setSaveError('Failed to save keys. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleModelSave = async () => {
    if (selectedModel === currentModel) return;
    setModelSaving(true);
    setModelSaveSuccess(false);
    try {
      await updateModel(selectedModel);
      setCurrentModel(selectedModel);
      setModelSaveSuccess(true);
      setTimeout(() => setModelSaveSuccess(false), 4000);
    } catch {
      setSaveError('Failed to update model.');
    } finally {
      setModelSaving(false);
    }
  };

  const getModelIcon = (modelId: string) => {
    if (modelId.includes('nano')) return CircleDollarSign;
    if (modelId === 'gpt-4.1') return Crown;
    if (modelId === 'gpt-4o') return Sparkles;
    if (modelId.includes('4.1-mini')) return Rocket;
    return Cpu;
  };

  const getRecommendedBadge = (rec: string) => {
    switch (rec) {
      case 'all':
        return 'Best for Everything';
      case 'email_generation':
        return 'Best for Emails';
      case 'query_parsing':
        return 'Best for Parsing';
      default:
        return rec;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e8f0] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#94a3b8]" />
          Settings
        </h1>
        <p className="text-[#94a3b8] mt-1">Manage your AI model and API keys</p>
      </div>

      {/* Model Selection */}
      {models.length > 0 && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#e2e8f0]">
                AI Model Selection
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                Choose which OpenAI model powers query parsing and email generation
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {models.map((model) => {
              const isSelected = selectedModel === model.id;
              const isCurrent = currentModel === model.id;
              const isRecommended = model.id === 'gpt-4.1-mini';
              const ModelIcon = getModelIcon(model.id);

              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-[#1e1e2e] bg-[#0a0a0f] hover:border-[#2a2a3e]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      {/* Radio indicator */}
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-blue-500'
                          : 'border-[#3a3a4e]'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <ModelIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-[#94a3b8]'}`} />
                          <span className="text-sm font-medium text-[#e2e8f0]">
                            {model.name}
                          </span>
                          {isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                              Recommended
                            </span>
                          )}
                          {isCurrent && !isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Current
                            </span>
                          )}
                          {isCurrent && isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-0.5 ml-5">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <span className="text-[10px] text-[#94a3b8] font-mono">
                        {model.cost}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e1e2e] text-[#94a3b8]">
                        {getRecommendedBadge(model.recommended_for)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Update Model Button */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleModelSave}
              disabled={modelSaving || selectedModel === currentModel}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-medium rounded-lg text-sm transition-colors"
            >
              {modelSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
              {modelSaving ? 'Updating...' : 'Update Model'}
            </button>
            {modelSaveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Model updated to {models.find((m) => m.id === currentModel)?.name}
              </span>
            )}
            {selectedModel !== currentModel && !modelSaving && (
              <span className="text-xs text-[#94a3b8]">
                Switching from {models.find((m) => m.id === currentModel)?.name} to {models.find((m) => m.id === selectedModel)?.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Service Cards */}
      {services.map((svc) => {
        const status = keyStatuses[svc.service];
        const testResult = testResults[svc.service];
        const isTesting = testing[svc.service] || false;
        const Icon = svc.icon;

        return (
          <div
            key={svc.service}
            className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-5"
          >
            {/* Service Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e2e8f0]">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {svc.description}
                  </p>
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 mt-1"
                  >
                    {svc.url.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Status Badge */}
              {status?.configured && !testResult && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Configured
                </span>
              )}
              {!status?.configured && !testResult && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Not Set
                </span>
              )}
              {testResult && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    testResult.status === 'valid'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {testResult.status === 'valid' ? 'Valid' : 'Invalid'}
                </span>
              )}
            </div>

            {/* Current Key */}
            {status?.configured && status.masked_key && (
              <p className="text-xs text-[#94a3b8] mb-2">
                Current key: <code className="text-[#e2e8f0]">{status.masked_key}</code>
              </p>
            )}

            {/* Input + Test */}
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeys[svc.service] || ''}
                onChange={(e) =>
                  setApiKeys((prev) => ({
                    ...prev,
                    [svc.service]: e.target.value,
                  }))
                }
                placeholder={
                  status?.configured
                    ? 'Enter new key to update...'
                    : 'Enter API key...'
                }
                className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg text-sm text-[#e2e8f0] placeholder-[#94a3b8]"
              />
              <button
                onClick={() => handleTestKey(svc.service)}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1e1e2e] hover:bg-[#2a2a3e] disabled:opacity-50 text-sm text-[#e2e8f0] rounded-lg shrink-0"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5" />
                )}
                Test
              </button>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`mt-2 flex items-start gap-1.5 text-xs ${
                  testResult.status === 'valid'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {testResult.status === 'valid' ? (
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                {testResult.message}
              </div>
            )}
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All Keys'}
        </button>

        {saveError && (
          <div className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            {saveError}
          </div>
        )}
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">
                {keyStatuses['serper']?.configured && keyStatuses['openai']?.configured
                  ? 'All set! You can now generate leads from the Dashboard.'
                  : 'Keys saved successfully.'}
              </p>
            </div>
          </div>
          {keyStatuses['serper']?.configured && keyStatuses['openai']?.configured && (
            <div className="ml-7">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg"
              >
                <Zap className="w-4 h-4" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
