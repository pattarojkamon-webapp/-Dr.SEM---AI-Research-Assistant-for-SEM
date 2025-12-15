import React, { useState } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

interface FitIndicesCheckerProps {
    isDarkMode: boolean;
}

const TOOLTIPS: Record<string, string> = {
    'CFI': "Comparative Fit Index. > 0.95 Excellent, 0.90-0.94 Acceptable, < 0.90 Poor (Kline, 2023).",
    'TLI': "Tucker-Lewis Index. > 0.95 Excellent, 0.90-0.94 Acceptable, < 0.90 Poor.",
    'RMSEA': "Root Mean Square Error of Approximation. < 0.06 Good, 0.06-0.08 Acceptable, > 0.08 Poor (Hair et al., 2022).",
    'SRMR': "Standardized Root Mean Square Residual. < 0.08 Good, > 0.08 Poor.",
    'Chi-Square': "Should be non-significant (p > .05) ideally, but sensitive to sample size.",
    'df': "Degrees of Freedom. Used to calculate Chi-Square/df ratio."
};

const FitIndicesChecker: React.FC<FitIndicesCheckerProps> = ({ isDarkMode }) => {
  const [inputs, setInputs] = useState({
    cfi: 0.85,
    tli: 0.82,
    rmsea: 0.09,
    srmr: 0.09,
    chisq: 120.5,
    df: 60
  });

  const analyzeFit = () => {
    const results = [];
    
    // CFI Analysis
    results.push({
      name: 'CFI',
      value: inputs.cfi,
      fullMark: 1,
      fill: inputs.cfi >= 0.95 ? '#10b981' : inputs.cfi >= 0.90 ? '#f59e0b' : '#ef4444',
      status: inputs.cfi >= 0.90 ? 'Pass' : 'Fail',
      msg: inputs.cfi >= 0.95 ? 'Excellent fit (> 0.95)' : inputs.cfi >= 0.90 ? 'Acceptable (> 0.90)' : 'Poor fit (< 0.90)'
    });

    // RMSEA Analysis
    results.push({
      name: 'RMSEA',
      value: inputs.rmsea,
      fullMark: 0.2, // Scaling for visualization
      fill: inputs.rmsea <= 0.06 ? '#10b981' : inputs.rmsea <= 0.08 ? '#f59e0b' : '#ef4444',
      status: inputs.rmsea <= 0.08 ? 'Pass' : 'Fail',
      msg: inputs.rmsea <= 0.06 ? 'Good fit (< 0.06)' : inputs.rmsea <= 0.08 ? 'Acceptable (< 0.08)' : 'Poor fit (> 0.08)'
    });

    // SRMR Analysis
    results.push({
        name: 'SRMR',
        value: inputs.srmr,
        fullMark: 0.2,
        fill: inputs.srmr <= 0.08 ? '#10b981' : '#ef4444',
        status: inputs.srmr <= 0.08 ? 'Pass' : 'Fail',
        msg: inputs.srmr <= 0.08 ? 'Good fit (< 0.08)' : 'Poor fit (> 0.08)'
    });

    return results;
  };

  const results = analyzeFit();
  const chisqDf = inputs.chisq / inputs.df;

  const inputClass = isDarkMode 
    ? "px-3 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-mono" 
    : "px-3 py-2 border border-gray-300 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-mono";

  return (
    <div className={`p-6 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="mb-6">
        <h3 className={`text-xl font-bold font-serif mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Fit Indices Checker</h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Enter your model fit indices to check against Kline (2023) & Hair et al. (2022) criteria.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'CFI', key: 'cfi', step: 0.01 },
          { label: 'TLI', key: 'tli', step: 0.01 },
          { label: 'RMSEA', key: 'rmsea', step: 0.001 },
          { label: 'SRMR', key: 'srmr', step: 0.001 },
          { label: 'Chi-Square', key: 'chisq', step: 0.1 },
          { label: 'df', key: 'df', step: 1 },
        ].map((field) => (
          <div key={field.key} className="flex flex-col relative group">
            <div className="flex items-center gap-1 mb-1">
                <label className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{field.label}</label>
                <HelpCircle size={12} className={`${isDarkMode ? 'text-slate-500' : 'text-gray-400'} cursor-help`} />
                {/* Tooltip */}
                <div className={`absolute bottom-full left-0 mb-2 w-48 p-2 rounded shadow-lg text-xs z-20 hidden group-hover:block ${isDarkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-800 text-white'}`}>
                    {TOOLTIPS[field.label]}
                    <div className={`absolute top-full left-4 -mt-1 border-4 border-transparent ${isDarkMode ? 'border-t-slate-800' : 'border-t-slate-800'}`}></div>
                </div>
            </div>
            <input
              type="number"
              step={field.step}
              value={inputs[field.key as keyof typeof inputs]}
              onChange={(e) => setInputs({ ...inputs, [field.key]: parseFloat(e.target.value) })}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className={`rounded-xl p-4 mb-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
         <div className="flex justify-between items-center mb-4">
             <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Visual Diagnostics</span>
             <span className={`text-xs px-2 py-1 rounded ${chisqDf < 3 ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')}`}>
                Chi-Square/df: {chisqDf.toFixed(2)} ({chisqDf < 3 ? 'Good < 3' : 'High'})
             </span>
         </div>
         
         <div className="space-y-4">
            {results.map((res) => (
                <div key={res.name} className={`flex items-center justify-between p-3 rounded-lg shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full`} style={{ backgroundColor: res.fill }}></div>
                        <div>
                            <div className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{res.name}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{res.msg}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-mono font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{res.value}</div>
                        <div className={`text-xs font-bold ${res.status === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>
                            {res.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-yellow-900/10 border-yellow-900/30' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start gap-2">
            <Info className={`${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'} mt-1 flex-shrink-0`} size={16} />
            <div className={`text-sm ${isDarkMode ? 'text-yellow-200/80' : 'text-yellow-800'}`}>
                <strong>Dr.SEM Suggestion:</strong>
                {inputs.cfi < 0.90 && (
                    <p className="mt-1">CFI is low. Consider checking modification indices (MI) for potential error correlations, but only if theoretically justified (Byrne, 2016).</p>
                )}
                {inputs.rmsea > 0.08 && (
                    <p className="mt-1">RMSEA is high. This might indicate model misspecification or small degrees of freedom.</p>
                )}
                {inputs.cfi >= 0.90 && inputs.rmsea <= 0.08 && (
                    <p className="mt-1">Your model fit is generally acceptable. You can proceed to interpret structural paths.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FitIndicesChecker;