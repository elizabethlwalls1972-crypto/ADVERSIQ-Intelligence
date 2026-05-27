import React, { useState, useEffect } from 'react';
import { ShieldCheck, Scale, Lock, Users, BookOpen, LayoutGrid, X } from 'lucide-react';

interface LegalInfoHubProps {
    onBack: () => void;
    initialSection?: string;
}

const SECTIONS = [
    { id: 'ethical-framework', title: 'Ethical AI Framework', icon: ShieldCheck },
    { id: 'terms', title: 'Terms of Service', icon: Scale },
    { id: 'privacy', title: 'Privacy Policy', icon: Lock },
    { id: 'company', title: 'Company Profile', icon: Users },
    { id: 'narrative', title: 'Development Narrative', icon: BookOpen },
];

export const LegalInfoHub: React.FC<LegalInfoHubProps> = ({ onBack, initialSection }) => {
    const [activeSection, setActiveSection] = useState(initialSection || 'ethical-framework');

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        if (initialSection) {
            const element = document.getElementById(initialSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [initialSection]);

    return (
        <div className="flex h-screen bg-stone-50 overflow-hidden font-sans text-stone-900">
            {/* Sidebar Navigation */}
            <aside className="w-80 bg-white border-r border-stone-200 flex flex-col flex-shrink-0 z-20 shadow-sm">
                <div className="p-6 border-b border-stone-100 flex items-center gap-3 cursor-pointer" onClick={onBack}>
                    <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-stone-900 leading-none">BWGA AI</h1>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Governance Center</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 text-left ${
                                activeSection === section.id
                                    ? 'bg-stone-900 text-white shadow-md'
                                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                            }`}
                        >
                            <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-blue-400' : 'currentColor'}`} />
                            {section.title}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-stone-100">
                    <button 
                        onClick={onBack}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Return to Platform
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth bg-stone-50">
                <div className="max-w-4xl mx-auto p-8 md:p-12 space-y-16">
                    
                    {/* --- ETHICAL FRAMEWORK --- */}
                    <section id="ethical-framework" className="scroll-mt-12">
                        <div className="mb-8 border-b border-stone-200 pb-6">
                            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2 block">Governance Doctrine</span>
                            <h2 className="text-4xl font-serif font-bold text-stone-900">Ethical AI & Data Governance Framework</h2>
                            <p className="text-stone-500 mt-2 font-mono text-xs">Version 1.0 | May 2025</p>
                        </div>

                        <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700">
                            <h3 className="text-lg font-bold text-stone-900 mt-8 mb-4">1. Statement of Commitment</h3>
                            <p>
                                BW Global Advisory ("BWGA") is founded upon the principle that artificial intelligence must be developed and deployed with the highest degree of ethical responsibility. The firm acknowledges that the power of advanced computational systems carries a corresponding obligation to ensure that technology is never used in a manner that compromises human rights, privacy, or social stability.
                            </p>
                            
                            <h3 className="text-lg font-bold text-stone-900 mt-8 mb-4">2. Human Authority and Decision Governance</h3>
                            <p>
                                BWGA affirms without qualification that artificial intelligence shall never replace human authority. All outputs produced by the BWGA Nexus engine are advisory in nature and exist solely to assist decision-makers. No output is to be regarded as deterministic, final, or binding.
                            </p>

                            <h3 className="text-lg font-bold text-stone-900 mt-8 mb-4">3. Lawful Processing and Global Regulatory Compliance</h3>
                            <p>
                                BWGA operates as an international entity and therefore adopts a compliance-by-design methodology. The firm aligns its operations with major international regulatory standards, including GDPR and Australian Privacy Act.
                            </p>

                            <h3 className="text-lg font-bold text-stone-900 mt-8 mb-4">4. Data Collection, Limitation and Integrity Control</h3>
                            <p>
                                BWGA's data strategy is governed by the principle of data restraint. The firm collects and processes only those data necessary to fulfill legitimate analytical purposes.
                            </p>
                        </div>
                    </section>

                    {/* --- TERMS OF SERVICE --- */}
                    <section id="terms" className="scroll-mt-12 pt-12 border-t border-stone-200">
                        <div className="mb-8">
                            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block">Legal Agreement</span>
                            <h2 className="text-3xl font-serif font-bold text-stone-900">Terms and Conditions of Service</h2>
                            <p className="text-stone-500 mt-2 font-mono text-xs">Effective May 2025</p>
                        </div>
                        <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700 bg-white p-8 rounded-xl border border-stone-200 shadow-sm space-y-4">
                            <div>
                                <strong className="text-stone-900 block mb-1">1. Authorized Use & Access Protocols</strong>
                                <p>This system is strictly for authorized strategic analysis. Access rights and data depth are calibrated to the user's declared Skill Level (Novice, Experienced, Expert). All inputs, including custom entity data, are processed via secure enterprise gateways. Unlawful data injection is prohibited.</p>
                            </div>
                            <div>
                                <strong className="text-stone-900 block mb-1">2. Decision Support & Authority</strong>
                                <p>BW Global Advisory provides insights for informational purposes. The Nexus OS outputs are probabilistic. Users operating at 'Novice' levels should verify insights with 'Expert' domain holders. Strategic decisions remain the sole responsibility of the user.</p>
                            </div>
                            <div>
                                <strong className="text-stone-900 block mb-1">3. Data Privacy & Sovereignty</strong>
                                <p>We adhere to strict GDPR and local data sovereignty laws. Custom operational data (Revenue, Headcount) and specific strategic intents are isolated. No user-specific data is used to train public foundation models.</p>
                            </div>
                            <div>
                                <strong className="text-stone-900 block mb-1">4. Financial & Operational Models</strong>
                                <p>The SCF (Strategic Cash Flow) and IVAS (Investment Viability Assessment) models are simulations based on provided Operational Scale and historical benchmarks. They do not constitute financial advice and scale dynamically with input granularity.</p>
                            </div>
                            <div>
                                <strong className="text-stone-900 block mb-1">5. Historical Context & Predictive Limits</strong>
                                <p>The system utilizes a dataset spanning 2015-2025 to identify failure patterns. Users acknowledge that past performance is used for predictive modeling only. Black swan events outside the training data may impact accuracy.</p>
                            </div>
                        </div>
                    </section>

                    {/* --- PRIVACY POLICY --- */}
                    <section id="privacy" className="scroll-mt-12 pt-12 border-t border-stone-200">
                        <div className="mb-8">
                            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block">Data Protection</span>
                            <h2 className="text-3xl font-serif font-bold text-stone-900">Privacy Policy & Data Handling</h2>
                        </div>
                        <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700">
                            <p>
                                BWGA is committed to lawful handling of all personal data.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 my-6">
                                <div className="bg-stone-100 p-6 rounded-lg">
                                    <h4 className="font-bold text-stone-900 mb-2">Commercial Usage</h4>
                                    <p className="text-xs text-stone-600">Personal information is not sold or shared for commercial exploitation.</p>
                                </div>
                                <div className="bg-stone-100 p-6 rounded-lg">
                                    <h4 className="font-bold text-stone-900 mb-2">Security</h4>
                                    <p className="text-xs text-stone-600">All personal data is stored securely using enterprise-grade encryption.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- COMPANY PROFILE --- */}
                    <section id="company" className="scroll-mt-12 pt-12 border-t border-stone-200">
                        <div className="mb-8">
                            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block">About The Firm</span>
                            <h2 className="text-3xl font-serif font-bold text-stone-900">Company Profile</h2>
                        </div>
                        <div className="bg-stone-900 text-stone-300 p-8 rounded-xl shadow-lg prose prose-invert max-w-none leading-relaxed">
                            <p className="text-lg text-white font-medium">
                                BW Global Advisory is an international advisory and intelligence firm dedicated to unlocking regional economic potential through structured intelligence and ethical AI deployment.
                            </p>
                        </div>
                    </section>

                    {/* --- DEVELOPMENT NARRATIVE --- */}
                    <section id="narrative" className="scroll-mt-12 pt-12 border-t border-stone-200">
                        <div className="mb-8">
                            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2 block">Origin Story</span>
                            <h2 className="text-3xl font-serif font-bold text-stone-900">Why This System Exists</h2>
                        </div>
                        <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700">
                            <p>
                                BWGA AI was built as a response to repeated field observations that emerging regions are structurally excluded not because they lack value, but because they lack visibility and governance translation.
                            </p>
                        </div>
                    </section>

                    {/* --- FOOTER --- */}
                    <div className="pt-20 pb-12 text-center border-t border-stone-200">
                        <LayoutGrid className="w-10 h-10 text-stone-300 mx-auto mb-4" />
                        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">BW Global Advisory Pty Ltd</p>
                        <p className="text-xs text-stone-400 mt-2">ABN: 55 978 113 300</p>
                    </div>

                </div>
            </main>
        </div>
    );
};
