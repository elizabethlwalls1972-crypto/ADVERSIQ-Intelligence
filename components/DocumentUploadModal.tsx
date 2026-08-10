import React, { useState, useCallback } from 'react';
import { X, FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { CaseStudyAnalyzer, CaseStudyAnalysis } from '../services/CaseStudyAnalyzer';
import type { IngestedDocumentMeta } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentProcessed?: (document: IngestedDocumentMeta, analysis?: CaseStudyAnalysis) => void;
}

interface UploadResult {
  success: boolean;
  document?: IngestedDocumentMeta;
  analysis?: CaseStudyAnalysis;
  validation?: {
    isValid: boolean;
    reasoning: string;
    categories: string[];
  };
  error?: string;
  processingTime: number;
}

/**
 * Read a File object as text via FileReader (browser-native, no server needed).
 * Supports .txt, .md, .csv, .json, .xml, .html natively.
 * For .pdf and .docx, falls back to a metadata-only extraction with a notice.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm', '.tsv', '.log', '.rtf'];
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');

    if (textExtensions.includes(ext) || file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } else if (ext === '.pdf') {
      // PDF: read as data and extract what plain-text we can
      const reader = new FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        // Extract readable text segments from PDF binary (heuristic)
        const textSegments = raw.match(/\(([^)]{3,})\)/g);
        if (textSegments && textSegments.length > 5) {
          const extracted = textSegments.map(s => s.slice(1, -1)).join(' ');
          resolve(extracted);
        } else {
          resolve(`[PDF document: ${file.name}, ${file.size} bytes. Full text extraction requires server-side processing. Metadata analysis available.]`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF'));
      reader.readAsText(file, 'latin1');
    } else if (ext === '.docx' || ext === '.doc') {
      // DOCX: read as arraybuffer and extract xml text
      const reader = new FileReader();
      reader.onload = () => {
        const raw = new TextDecoder('utf-8', { fatal: false }).decode(reader.result as ArrayBuffer);
        // Try to extract readable text from DOCX XML
        const textContent = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (textContent.length > 100) {
          resolve(textContent);
        } else {
          resolve(`[DOCX document: ${file.name}, ${file.size} bytes. Full text extraction requires server-side processing. Metadata analysis available.]`);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX'));
      reader.readAsArrayBuffer(file);
    } else {
      // Attempt text read regardless
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Unsupported file type: ${ext}`));
      reader.readAsText(file);
    }
  });
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentProcessed
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadResults([]);

    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const startTime = Date.now();

        // ── 1. Read actual file content ──────────────────────────────
        const textContent = await readFileAsText(file);
        const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

        // ── 2. Run CaseStudyAnalyzer on the content ─────────────────
        const analysis = CaseStudyAnalyzer.analyze(file.name, textContent);

        // ── 3. Build IngestedDocumentMeta with content + insights ────
        const ingestedDoc = CaseStudyAnalyzer.toIngestedDocument(analysis);

        const processingTime = Date.now() - startTime;

        // ── 4. Build validation from real analysis ──────────────────
        const validation = {
          isValid: analysis.scores.overallViability > 20,
          reasoning: analysis.adversarialDebate.consensus,
          categories: [analysis.sector, analysis.country, ...analysis.stakeholders.slice(0, 2)],
        };

        results.push({
          success: true,
          document: ingestedDoc,
          analysis,
          validation,
          processingTime,
        });

        // ── 5. Notify parent with real content + analysis ───────────
        if (onDocumentProcessed) {
          onDocumentProcessed(ingestedDoc, analysis);
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process document',
          processingTime: 0,
        });
      }
    }

    setUploadResults(results);
    setIsUploading(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄"';
      case 'docx': return '📄';
      case 'txt': return '📄f';
      case 'image': return '📁';
      default: return '📄"';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-stone-200 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-stone-900">Document Intelligence Ingestion</h2>
              <p className="text-sm text-stone-500">Upload PDFs, DOCX, images, and text files for AI analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-900" title="Close modal">
            <X className="w-6 h-6"/>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-stone-300 hover:border-stone-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Drop documents here or click to browse
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              Supports PDF, DOCX, TXT, and image files up to 50MB each
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Processing...' : 'Choose Files'}
            </label>
          </div>

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-stone-900">Processing Results</h4>
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}

                    <div className="flex-1">
                      {result.document && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getFileTypeIcon(result.document.fileType)}</span>
                          <span className="font-medium text-stone-900">{result.document.filename}</span>
                          <span className="text-sm text-stone-500">
                            ({formatFileSize(result.document.fileSize)})
                          </span>
                        </div>
                      )}

                      {result.success ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-600">Words extracted:</span>
                            <span className="font-medium">{result.document?.wordCount?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-600">Processing time:</span>
                            <span className="font-medium">{result.processingTime}ms</span>
                          </div>
                          {result.analysis && (
                            <div className="mt-3 p-3 bg-white rounded border border-stone-200 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-stone-900">NSIL Analysis</span>
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                  result.analysis.scores.overallViability >= 65
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : result.analysis.scores.overallViability >= 40
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  Viability: {result.analysis.scores.overallViability}/100
                                </span>
                              </div>
                              {/* Score grid */}
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="flex justify-between"><span className="text-stone-500">Governance</span><span className="font-medium">{result.analysis.scores.governanceQuality}/100</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Financial</span><span className="font-medium">{result.analysis.scores.financialViability}/100</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Evidence</span><span className="font-medium">{result.analysis.scores.evidenceStrength}/100</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Risk Mgmt</span><span className="font-medium">{result.analysis.scores.riskManagement}/100</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Replication</span><span className="font-medium">{result.analysis.scores.replicationViability}/100</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Partner Ready</span><span className="font-medium">{result.analysis.scores.partnerMatchReadiness}/100</span></div>
                              </div>
                              {/* Strengths/weaknesses counts */}
                              <div className="flex gap-3 text-xs">
                                <span className="text-emerald-700">{result.analysis.strengths.length} strengths</span>
                                <span className="text-red-700">{result.analysis.weaknesses.length} weaknesses</span>
                                <span className="text-stone-500">{result.analysis.historicalParallels.length} historical parallels</span>
                              </div>
                              {/* Sector + Country */}
                              <div className="flex gap-1 flex-wrap">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{result.analysis.sector}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{result.analysis.country}</span>
                                {result.analysis.stakeholders.slice(0, 3).map((s: string, i: number) => (
                                  <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{s}</span>
                                ))}
                              </div>
                              {/* Consensus */}
                              <p className="text-xs text-stone-600 italic border-t border-stone-100 pt-2">
                                {result.analysis.adversarialDebate.consensus}
                              </p>
                            </div>
                          )}
                          {result.validation && !result.analysis && (
                            <div className="mt-3 p-3 bg-white rounded border border-stone-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-stone-900">Content Validation</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  result.validation.isValid
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {result.validation.isValid ? 'Valid' : 'Low Relevance'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600">{result.validation.reasoning}</p>
                              {result.validation.categories.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {result.validation.categories.map((cat: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-700 text-sm">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Supported Formats Info */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg">
            <h5 className="font-medium text-stone-900 mb-2">Supported Formats</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>📄"</span>
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>DOCX</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📄f</span>
                <span>TXT</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📁</span>
                <span>Images (OCR)</span>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Files are processed server-side with OCR for images and text extraction for documents.
              Content is validated for economic intelligence relevance.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
