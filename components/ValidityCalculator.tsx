
import React, { useState, useEffect } from 'react';
import { Theme } from '../types';
import { Calculator, Plus, Trash2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface ValidityCalculatorProps {
    theme: Theme;
}

const ValidityCalculator: React.FC<ValidityCalculatorProps> = ({ theme }) => {
    const isDark = theme === 'dark';
    
    const [loadings, setLoadings] = useState<number[]>([0.75, 0.80, 0.85]);
    const [ave, setAve] = useState(0);
    const [cr, setCr] = useState(0);

    useEffect(() => {
        calculate();
    }, [loadings]);

    const handleLoadingChange = (index: number, value: string) => {
        const newLoadings = [...loadings];
        const floatVal = parseFloat(value);
        if (!isNaN(floatVal) && floatVal >= 0 && floatVal <= 1) {
            newLoadings[index] = floatVal;
            setLoadings(newLoadings);
        }
    };

    const addLoading = () => setLoadings([...loadings, 0.70]);
    const removeLoading = (index: number) => setLoadings(loadings.filter((_, i) => i !== index));
    const reset = () => setLoadings([0.70, 0.70, 0.70]);

    const calculate = () => {
        // AVE = Sum(lambda^2) / n
        const sumSquaredLoadings = loadings.reduce((acc, val) => acc + (val * val), 0);
        const calculatedAve = sumSquaredLoadings / loadings.length;
        
        // CR = (Sum(lambda))^2 / [ (Sum(lambda))^2 + Sum(1-lambda^2) ]
        const sumLoadings = loadings.reduce((acc, val) => acc + val, 0);
        const sumErrorVariance = loadings.reduce((acc, val) => acc + (1 - (val * val)), 0);
        
        const calculatedCr = (sumLoadings * sumLoadings) / ((sumLoadings * sumLoadings) + sumErrorVariance);

        setAve(calculatedAve);
        setCr(calculatedCr);
    };

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

    const StatusBadge = ({ pass, label }: { pass: boolean, label: string }) => (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${pass ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {pass ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {label}
        </div>
    );

    return (
        <div className={`p-6 h-full overflow-y-auto ${s.bg}`}>
            <div className="mb-6">
                <h3 className={`text-xl font-bold font-serif mb-2 ${s.text}`}>Validity Master</h3>
                <p className={`text-sm opacity-70 ${s.text}`}>Calculate Convergent Validity (AVE & CR) from Factor Loadings.</p>
            </div>

            <div className={`rounded-xl p-5 mb-6 border flex flex-col items-center justify-center ${s.card}`}>
                <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="text-center">
                        <div className={`text-sm opacity-70 mb-1 ${s.text}`}>AVE (Avg Variance Extracted)</div>
                        <div className={`text-3xl font-mono font-bold mb-2 ${ave >= 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                            {ave.toFixed(3)}
                        </div>
                        <div className="flex justify-center">
                            <StatusBadge pass={ave >= 0.5} label={ave >= 0.5 ? 'Pass (> 0.5)' : 'Fail (< 0.5)'} />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-sm opacity-70 mb-1 ${s.text}`}>CR (Composite Reliability)</div>
                        <div className={`text-3xl font-mono font-bold mb-2 ${cr >= 0.7 ? 'text-green-500' : 'text-red-500'}`}>
                            {cr.toFixed(3)}
                        </div>
                        <div className="flex justify-center">
                            <StatusBadge pass={cr >= 0.7} label={cr >= 0.7 ? 'Pass (> 0.7)' : 'Fail (< 0.7)'} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <label className={`text-sm font-bold opacity-80 ${s.text}`}>Standardized Factor Loadings</label>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><RotateCcw size={12}/> Reset</button>
            </div>

            <div className="space-y-2 mb-4">
                {loadings.map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <span className={`text-xs font-mono w-6 text-right opacity-50 ${s.text}`}>λ{idx+1}</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={val}
                            onChange={(e) => handleLoadingChange(idx, e.target.value)}
                            className={`flex-1 p-2 rounded text-sm outline-none focus:ring-1 focus:ring-cyan-500 ${s.input}`}
                        />
                        <button 
                            onClick={() => removeLoading(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button 
                onClick={addLoading}
                className={`w-full py-2 border border-dashed rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-gray-300 hover:bg-gray-50 text-gray-500'}`}
            >
                <Plus size={16} /> Add Item
            </button>
            
            <div className={`mt-6 text-xs p-3 rounded border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                <strong>Criteria:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li><strong>AVE {'>'} 0.50</strong>: Indicates adequate convergent validity (Hair et al., 2019).</li>
                    <li><strong>CR {'>'} 0.70</strong>: Indicates good internal consistency reliability.</li>
                </ul>
            </div>
        </div>
    );
};

export default ValidityCalculator;
