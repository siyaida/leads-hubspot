import {
  Search,
  Globe,
  Users,
  Mail,
  Download,
  Check,
} from 'lucide-react';

interface PipelineStepperProps {
  currentStep: string;
  status: string;
}

const steps = [
  { key: 'query', label: 'Query', icon: Search },
  { key: 'search', label: 'Search', icon: Globe },
  { key: 'enrich', label: 'Enrich', icon: Users },
  { key: 'generate', label: 'Generate', icon: Mail },
  { key: 'export', label: 'Export', icon: Download },
];

function getStepState(
  stepIndex: number,
  currentStepIndex: number,
  status: string
): 'completed' | 'active' | 'pending' {
  if (status === 'completed') return 'completed';
  if (status === 'failed') {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  }
  if (stepIndex < currentStepIndex) return 'completed';
  if (stepIndex === currentStepIndex) return 'active';
  return 'pending';
}

export default function PipelineStepper({
  currentStep,
  status,
}: PipelineStepperProps) {
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepState = getStepState(
            index,
            currentStepIndex >= 0 ? currentStepIndex : 0,
            status
          );
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    stepState === 'completed'
                      ? 'bg-green-500/20 border-green-500'
                      : stepState === 'active'
                      ? 'bg-blue-500/20 border-blue-500 animate-pulse-glow'
                      : 'bg-[#1e1e2e] border-[#1e1e2e]'
                  }`}
                >
                  {stepState === 'completed' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        stepState === 'active'
                          ? 'text-blue-500'
                          : 'text-[#94a3b8]'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    stepState === 'completed'
                      ? 'text-green-500'
                      : stepState === 'active'
                      ? 'text-blue-500'
                      : 'text-[#94a3b8]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 mb-6">
                  <div
                    className={`h-0.5 w-full rounded ${
                      index < currentStepIndex ||
                      status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-[#1e1e2e]'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
