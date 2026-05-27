import React from 'react';
import { EXPERIENCE_LEVELS, ExperienceLevel } from '../constants/systemMetadata';
import { ChevronRight, Info } from 'lucide-react';

interface ExperienceLevelSelectorProps {
  selectedLevel: ExperienceLevel | null;
  onSelectLevel: (level: ExperienceLevel) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ExperienceLevelSelector: React.FC<ExperienceLevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold mb-2">How would you like help?</h2>
          <p className="text-blue-100">
            Select your experience level to customize guidance and recommendations
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Your experience level affects how detailed explanations are, what fields are suggested, and which documents are recommended. <strong>You can change this anytime.</strong>
            </p>
          </div>
        </div>

        {/* Level Options */}
        <div className="grid gap-4 p-6">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                onSelectLevel(level.id as ExperienceLevel);
                onClose();
              }}
              className={`
                p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg
                ${selectedLevel === level.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{level.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{level.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{level.description}</p>
                  
                  {/* What you get */}
                  <div className="mt-3 ml-11 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">You'll get:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {level.id === 'beginner' && (
                        <>
                          <li>✓ Detailed step-by-step guidance</li>
                          <li>✓ Definitions and examples for every field</li>
                          <li>✓ Best practice recommendations</li>
                          <li>✓ Suggested documents to use</li>
                          <li>✓ Tips for talking to potential partners</li>
                        </>
                      )}
                      {level.id === 'intermediate' && (
                        <>
                          <li>✓ Clear guidance with key insights</li>
                          <li>✓ Examples and best practices</li>
                          <li>✓ Document recommendations</li>
                          <li>✓ Tips for specific scenarios</li>
                          <li>✓ Growth-focused suggestions</li>
                        </>
                      )}
                      {level.id === 'advanced' && (
                        <>
                          <li>✓ Minimal guidance, maximum flexibility</li>
                          <li>✓ Field prompts and templates only</li>
                          <li>✓ Advanced features and options</li>
                          <li>✓ Direct access to all tools</li>
                          <li>✓ Full customization capability</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                {selectedLevel === level.id && (
                  <div className="mt-1">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-3">Quick Tips:</p>
            <ul className="space-y-2 text-gray-700 text-xs">
              <li>
                <strong>Choose Beginner if:</strong> This is your first time planning like this, or you want comprehensive guidance
              </li>
              <li>
                <strong>Choose Intermediate if:</strong> You have some experience but want balanced guidance and examples
              </li>
              <li>
                <strong>Choose Advanced if:</strong> You're experienced and just need templates and key prompts
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Cancel
          </button>
          {selectedLevel && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Continue as {EXPERIENCE_LEVELS.find(l => l.id === selectedLevel)?.label.split('/')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceLevelSelector;

