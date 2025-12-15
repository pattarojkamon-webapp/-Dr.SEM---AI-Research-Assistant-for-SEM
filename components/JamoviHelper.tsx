import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface JamoviHelperProps {
    isDarkMode: boolean;
}

const JamoviHelper: React.FC<JamoviHelperProps> = ({ isDarkMode }) => {
  const [syntax, setSyntax] = useState<string>(
`# Example Jamovi SEM Syntax (SEMLj)
jmv::sem(
    data = data,
    model = '
        # Measurement Model
        Leadership =~ L1 + L2 + L3
        Quality    =~ Q1 + Q2 + Q3
        Success    =~ S1 + S2 + S3
        
        # Structural Model
        Success ~ Leadership + Quality
    ',
    estMethod = 'standard'
)`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(syntax);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 h-full flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="mb-4">
        <h3 className={`text-xl font-bold font-serif mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Jamovi Syntax Helper</h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Generate or edit R syntax for Jamovi `jmv` modules.</p>
      </div>

      <div className={`flex-1 relative border rounded-xl overflow-hidden shadow-sm ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}`}>
        <div className="absolute top-0 right-0 p-2 z-10">
            <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-slate-700/80 hover:bg-slate-600 text-slate-200' : 'bg-slate-800/90 text-white hover:bg-slate-700'}`}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
            </button>
        </div>
        <textarea
            value={syntax}
            onChange={(e) => setSyntax(e.target.value)}
            className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed ${isDarkMode ? 'bg-slate-900 text-green-400' : 'bg-[#1e1e1e] text-green-400'}`}
            spellCheck={false}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
         <button 
            onClick={() => setSyntax(prev => prev + "\n# New CFA Block\nFactor1 =~ item1 + item2 + item3")}
            className={`px-3 py-2 border text-xs rounded transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'}`}
         >
             + Add CFA Template
         </button>
         <button 
            onClick={() => setSyntax(prev => prev + "\n# New Regression Path\nEndogenous ~ Exogenous1 + Exogenous2")}
            className={`px-3 py-2 border text-xs rounded transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'}`}
         >
             + Add Path Template
         </button>
      </div>
    </div>
  );
};

export default JamoviHelper;