import React, { useState } from 'react';
import { ReportParameters } from '../types';
import { ORGANIZATION_TYPES, ORGANIZATION_SUBTYPES } from '../constants';
import { generateFastSuggestion } from '../services/engine';

interface ProfileStepProps {
    params: ReportParameters;
    handleChange: (field: keyof ReportParameters, value: any) => void;
    onParamsChange?: (params: ReportParameters) => void;
    inputStyles?: string;
    labelStyles?: string;
    savedReports?: ReportParameters[];
    onSave?: (params: ReportParameters) => void;
    onLoad?: (params: ReportParameters) => void;
    onDelete?: (reportName: string) => void;
}

const UploadIcon = ({className}: {className?: string}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

export const ProfileStep: React.FC<ProfileStepProps> = ({ 
    params, handleChange, onParamsChange, inputStyles = "w-full p-3 border border-stone-300 rounded-lg text-sm", labelStyles = "block text-sm font-bold text-stone-700 mb-1",
    savedReports = [], onSave, onLoad, onDelete
}) => {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleProblemBlur = async () => {
        if (!params.problemStatement || params.problemStatement.length < 5) return;
        setIsSuggesting(true);
        const result = await generateFastSuggestion(params.problemStatement, "Strategic Objective refinement");
        setSuggestion(result);
        setIsSuggesting(false);
    };

    const applySuggestion = () => {
        if (suggestion) {
            handleChange('problemStatement', suggestion);
            setSuggestion(null);
        }
    };

    const handleOrgTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        
        if (onParamsChange) {
            onParamsChange({
                ...params,
                organizationType: newType,
                organizationSubType: '',
                customOrganizationSubType: '',
                customOrganizationType: '',
            });
        } else {
            handleChange('organizationType', newType);
            handleChange('organizationSubType', ''); 
            handleChange('customOrganizationSubType', '');
            handleChange('customOrganizationType', '');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Record selected file metadata for downstream upload processing.
            console.log("File uploaded:", file.name);
        }
    };

    const displayOrgTypes = ORGANIZATION_TYPES.filter(t => t !== 'Other');
    const subTypes = ORGANIZATION_SUBTYPES[params.organizationType] || [];
    const showCustomTypeInput = params.organizationType === 'Custom';
    const showCustomCategoryInput = params.organizationType && (params.organizationSubType === 'Custom' || subTypes.length === 0);

    return (
        <div className="grid gap-10 text-stone-800">
            <div className="space-y-8">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Core Profile</h4>
                
                <div className="grid md:grid-cols-2 gap-10">
                    <div>
                        <label className={labelStyles}>Full Name</label>
                        <input type="text" value={params.userName} onChange={e => handleChange('userName', e.target.value)} className={inputStyles} placeholder="Enter Name" />
                    </div>
                    <div>
                        <label className={labelStyles}>Department / Role</label>
                        <input type="text" value={params.userDepartment} onChange={e => handleChange('userDepartment', e.target.value)} className={inputStyles} placeholder="Enter Position" />
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                     <div>
                        <label className={labelStyles}>Organization Type</label>
                        <select value={params.organizationType} onChange={handleOrgTypeChange} className={inputStyles}>
                            <option value="">Select Type</option>
                            {displayOrgTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                            <option value="Custom">Other / Custom</option>
                        </select>
                        
                        {showCustomTypeInput && (
                            <input 
                                type="text" 
                                value={params.customOrganizationType || ''}
                                onChange={(e) => handleChange('customOrganizationType', e.target.value)}
                                className={`${inputStyles} mt-4 bg-yellow-50/50`} 
                                placeholder="Specify Organization Type..."
                            />
                        )}
                    </div>
                     <div>
                        <label className={labelStyles}>Category / Level</label>
                        {subTypes.length > 0 ? (
                            <select 
                                value={params.organizationSubType || ''} 
                                onChange={e => handleChange('organizationSubType', e.target.value)} 
                                className={inputStyles}
                                disabled={!params.organizationType}
                            >
                                <option value="">Select Category</option>
                                {subTypes.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                                <option value="Custom">Other (Specify below)</option>
                            </select>
                        ) : (
                            <div className="text-xs text-stone-400 mt-2 italic">
                                {params.organizationType && params.organizationType !== 'Custom' 
                                    ? "Please specify category manually below." 
                                    : "Select Organization Type first."}
                            </div>
                        )}
                        
                        {showCustomCategoryInput && (
                            <input 
                                type="text" 
                                value={params.customOrganizationSubType || ''} 
                                onChange={(e) => handleChange('customOrganizationSubType', e.target.value)} 
                                className={`${inputStyles} mt-4 bg-yellow-50/50`} 
                                placeholder="Enter Category / Level manually..." 
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8 mt-4">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Context & Documents</h4>

                <div>
                    <label className={labelStyles}>Report Name</label>
                    <input type="text" value={params.reportName} onChange={e => handleChange('reportName', e.target.value)} className={inputStyles} placeholder="e.g., Project Alpha Expansion Strategy" />
                </div>
                
                 <div>
                    <label className={labelStyles}>Strategic Intent (Draft)</label>
                    <div className="relative">
                        <textarea 
                            value={params.problemStatement} 
                            onChange={e => handleChange('problemStatement', e.target.value)} 
                            onBlur={handleProblemBlur}
                            className={`${inputStyles} border-b-0 border border-stone-200 rounded-lg p-4 bg-stone-50 min-h-[100px]`}
                            rows={3}
                            placeholder="Briefly describe objectives (e.g., 'Expand manufacturing to Vietnam')..." 
                        />
                        {isSuggesting && <div className="absolute right-2 bottom-2 text-xs text-bronze-600 animate-pulse">Refining...</div>}
                    </div>
                    {suggestion && (
                        <div className="mt-3 p-4 bg-stone-50 border border-stone-200 rounded flex justify-between items-start gap-4">
                            <div>
                                <span className="text-xs font-bold text-stone-900 block mb-1">AI Suggestion:</span>
                                <p className="text-sm text-stone-600 font-serif italic">"{suggestion}"</p>
                            </div>
                            <button onClick={applySuggestion} className="text-xs bg-stone-800 text-white px-3 py-1 rounded hover:bg-stone-900 font-bold">Apply</button>
                        </div>
                    )}
                </div>

                <div className="p-8 border-2 border-dashed border-stone-200 rounded-xl hover:border-bronze-400 transition-colors text-center group bg-stone-50/30">
                    <input 
                        type="file" 
                        id="doc-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt"
                    />
                    <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <UploadIcon className="w-10 h-10 text-stone-300 group-hover:text-bronze-600 mb-3 transition-colors" />
                        <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900">
                            Upload Strategic Documents
                        </span>
                        <span className="text-xs text-stone-400 mt-2">
                            PDF, DOCX, or TXT context.
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};
