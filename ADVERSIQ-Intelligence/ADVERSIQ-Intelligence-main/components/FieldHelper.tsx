import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, BookOpen, Users } from 'lucide-react';
import { ExperienceLevel, FIELD_DESCRIPTIONS } from '../constants/systemMetadata';

interface FieldHelperProps {
  fieldKey: string;
  experienceLevel: ExperienceLevel;
  className?: string;
}

const FieldHelper: React.FC<FieldHelperProps> = ({ fieldKey, experienceLevel, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fieldInfo = FIELD_DESCRIPTIONS[fieldKey as keyof typeof FIELD_DESCRIPTIONS];
  
  if (!fieldInfo) return null;

  const getHelpText = () => {
    switch (experienceLevel) {
      case 'beginner':
        return fieldInfo.detailed;
      case 'intermediate':
        return fieldInfo.detailed;
      case 'advanced':
        return fieldInfo.short;
      default:
        return fieldInfo.short;
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Help Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition"
      >
        <HelpCircle className="w-4 h-4" />
        {experienceLevel === 'beginner' ? 'What is this?' : 'Help'}
        {isExpanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Expanded Help Section */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 space-y-3">
          {/* Main explanation */}
          <div>
            <p className="text-sm text-gray-700">{getHelpText()}</p>
          </div>

          {/* Why it matters */}
          <div className="pt-2 border-t border-blue-200">
            <div className="flex gap-2 items-start">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Why this matters:</p>
                <p className="text-xs text-gray-700 mt-1">{fieldInfo.why}</p>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="pt-2 border-t border-blue-200">
            <div className="flex gap-2 items-start">
              <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Example:</p>
                <p className="text-xs text-gray-700 mt-1 font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                  {fieldInfo.example}
                </p>
              </div>
            </div>
          </div>

          {/* Beginner tips */}
          {experienceLevel === 'beginner' && fieldInfo.helpBeginners && (
            <div className="pt-2 border-t border-blue-200">
              <div className="flex gap-2 items-start">
                <Users className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Tips from experts:</p>
                  <ul className="text-xs text-gray-700 mt-1 space-y-1 list-disc list-inside">
                    {fieldInfo.helpBeginners.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldHelper;

