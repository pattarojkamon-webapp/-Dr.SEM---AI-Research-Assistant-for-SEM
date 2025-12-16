
import React, { useState } from 'react';
import { Theme } from '../types';
import { Users, AlertCircle, Info } from 'lucide-react';

interface SampleSizeCalculatorProps {
    theme: Theme;
}

const SampleSizeCalculator: React.FC<SampleSizeCalculatorProps> = ({ theme }) => {
    const isDark = theme === 'dark';
    
    // Inputs
    const [observedVars, setObservedVars] = useState(15);
    const [latentVars, setLatentVars] = useState(3);
    const [population, setPopulation] = useState<string>(""); // Optional
    const [errorMargin, setErrorMargin] = useState(0.05);

    // Calculations
    // 1. SEM Rule: 10-20 times observed variables (Schumacker & Lomax, 2016)
    const rule10x = observedVars * 10;
    const rule20x = observedVars * 20;

    // 2. Yamane (Simplified)
    const calculateYamane = () => {
        const N = parseInt(population);
        if (!N) return "N/A (Population unknown)";
        const n = N / (1 + N * (errorMargin * errorMargin));
        return Math.ceil(n);
    };

    // 3. Minimum Absolute (Kline)
    const klineMin = 200;

    // Determine Status
    const recommended = Math.max(rule10x, 200);

    const getStyles = () => {
        switch(theme) {
            case 'dark': return { 
                bg: 'bg-slate-950', card: 'bg-slate-900 border-slate-800', text: 'text-slate-100', 
                input: 'bg-slate-800 border-slate-700 text-white'
            };
            case 'corporate': return { 
                bg: 'bg-white', card: 'bg-white border-blue-100 shadow-sm', text: 'text-slate-800', 
                input: 'bg-white border-blue-200 text-slate-800'
            };
            case 'academic': return { 
                bg: 'bg-[#fdfbf7]', card: 'bg-[#fffefb] border-[#e5e0d8] shadow-sm', text: 'text-[#333]', 
                input: 'bg-white border-[#d7ccc8] text-[#333]'
            };
            default: return { 
                bg: 'bg-slate-50', card: 'bg-white border-gray-200 shadow-sm', text: 'text-slate-900', 
                input: 'bg-white border-gray-300 text-slate-900'
            };
        }
    };
    const s = getStyles();

    return (
        <div className={`p-6 h-full overflow-y-auto ${s.bg}`}>
            <div className="mb-6">
                <h3 className={`text-xl font-bold font-serif mb-2 ${s.text}`}>Sample Size Calculator</h3>
                <p className={`text-sm opacity-70 ${s.text}`}>Calculate required sample size based on SEM rules of thumb and statistical formulas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className={`block text-xs font-bold mb-1 opacity-80 ${s.text}`}>Number of Observed Variables (Items)</label>
                    <input 
                        type="number" 
                        value={observedVars} 
                        onChange={e => setObservedVars(Number(e.target.value))}
                        className={`w-full p-2 rounded text-sm outline-none focus:ring-2 focus:ring-cyan-500 ${s.input}`}
                    />
                </div>
                <div>
                    <label className={`block text-xs font-bold mb-1 opacity-80 ${s.text}`}>Population Size (Optional)</label>
                    <input 
                        type="number" 
                        placeholder="Leave empty for infinite"
                        value={population} 
                        onChange={e => setPopulation(e.target.value)}
                        className={`w-full p-2 rounded text-sm outline-none focus:ring-2 focus:ring-cyan-500 ${s.input}`}
                    />
                </div>
            </div>

            <div className={`rounded-xl p-5 mb-6 border ${s.card}`}>
                <h4 className={`font-serif font-bold mb-4 flex items-center gap-2 ${s.text}`}>
                    <Users size={18} className="text-cyan-500" />
                    Recommended Minimum: <span className="text-2xl text-cyan-600">{recommended}</span>
                </h4>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 border-b border-dashed border-gray-200 dark:border-slate-700">
                        <span className="text-sm opacity-80">SEM Rule (10x Items):</span>
                        <span className="font-mono font-bold">{rule10x}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b border-dashed border-gray-200 dark:border-slate-700">
                        <span className="text-sm opacity-80">SEM Rule (20x Items):</span>
                        <span className="font-mono font-bold">{rule20x}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border-b border-dashed border-gray-200 dark:border-slate-700">
                        <span className="text-sm opacity-80">Kline's Minimum (2023):</span>
                        <span className="font-mono font-bold">{klineMin}</span>
                    </div>
                    {population && (
                         <div className="flex justify-between items-center p-2 border-b border-dashed border-gray-200 dark:border-slate-700">
                            <span className="text-sm opacity-80">Yamane Formula (e={errorMargin}):</span>
                            <span className="font-mono font-bold text-purple-500">{calculateYamane()}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-4 rounded-lg border text-sm ${isDark ? 'bg-blue-900/20 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                <div className="flex gap-2">
                    <Info size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <strong>Dr.SEM Advice:</strong> For Structural Equation Modeling, sample size is critical for model stability.
                        <ul className="list-disc pl-4 mt-1 space-y-1 opacity-90">
                            <li><strong>Kline (2023)</strong> suggests a minimum of 200 samples for most standard models.</li>
                            <li><strong>Hair et al. (2019)</strong> recommends 10-20 times the number of variables.</li>
                            <li>If your data is non-normal, consider increasing N even further or using bootstrapping.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleSizeCalculator;
