import React, { useState } from 'react';

export default function ExportModal({ open, onClose }: any) {
  const [format, setFormat] = useState('pdf');
  const [includeIntelligence, setIncludeIntelligence] = useState(true);
  const [includeModels, setIncludeModels] = useState(true);

  if (!open) return null;

  const handleExport = () => {
    // This would trigger the actual export
    console.log('Exporting with options:', { format, includeIntelligence, includeModels });
    onClose();
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[640px] bg-white rounded p-6">
        <h3 className="text-lg font-semibold mb-4 text-stone-900">Export Intelligence Report</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-stone-700">PDF Document</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="docx"
                  checked={format === 'docx'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-stone-700">Word Document</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="nsil"
                  checked={format === 'nsil'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-stone-700">NSIL Intelligence</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-stone-700">JSON Data</span>
              </label>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <h4 className="text-sm font-medium text-stone-700 mb-3">Export Options</h4>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeIntelligence}
                  onChange={(e) => setIncludeIntelligence(e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <div className="text-sm font-medium text-stone-800">Include NSIL Intelligence</div>
                  <div className="text-xs text-stone-500">SPI, IVAS, SCF scores and agent insights</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeModels}
                  onChange={(e) => setIncludeModels(e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <div className="text-sm font-medium text-stone-800">Include Model Visualizations</div>
                  <div className="text-xs text-stone-500">Charts and data visualizations</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded text-xs text-stone-600">
            <div className="font-medium mb-1">Export Summary:</div>
            <div>* Report sections: All included</div>
            <div>* Intelligence data: {includeIntelligence ? 'Included' : 'Excluded'}</div>
            <div>* Model visualizations: {includeModels ? 'Included' : 'Excluded'}</div>
            <div>* Format: {format.toUpperCase()}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-50 transition-colors text-stone-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
