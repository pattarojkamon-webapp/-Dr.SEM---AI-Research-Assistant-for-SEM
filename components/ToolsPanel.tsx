import React from 'react';
import { Layout, Activity, FileText, Terminal } from 'lucide-react';
import { ToolMode, Language, Node, Link } from '../types';
import { TRANSLATIONS } from '../constants';
import FitIndicesChecker from './FitIndicesChecker';
import ApaTableGenerator from './ApaTableGenerator';
import ModelPreview from './ModelPreview';
import JamoviHelper from './JamoviHelper';

interface ToolsPanelProps {
  activeMode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  language: Language;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  isDarkMode: boolean;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeMode, onModeChange, language, nodes, setNodes, links, setLinks, isDarkMode }) => {
  const t = TRANSLATIONS[language];

  const tabs = [
      { id: ToolMode.CONCEPTUAL, label: t.toolCanvas, icon: Layout },
      { id: ToolMode.FIT_CHECKER, label: t.toolFit, icon: Activity },
      { id: ToolMode.APA_TABLE, label: t.toolApa, icon: FileText },
      { id: ToolMode.JAMOVI, label: t.toolJamovi, icon: Terminal },
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Tool Navigation */}
      <div className={`flex border-b overflow-x-auto scrollbar-hide ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onModeChange(tab.id)}
                className={`flex-1 min-w-[80px] py-3 text-[10px] md:text-xs font-medium flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors ${
                    activeMode === tab.id
                    ? (isDarkMode ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-800' : 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/20')
                    : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-slate-700')
                }`}
            >
                <tab.icon size={16} /> {tab.label}
            </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeMode === ToolMode.CONCEPTUAL && 
            <ModelPreview 
                nodes={nodes} 
                setNodes={setNodes} 
                links={links} 
                setLinks={setLinks} 
                isDarkMode={isDarkMode} 
            />
        }
        {activeMode === ToolMode.FIT_CHECKER && <FitIndicesChecker isDarkMode={isDarkMode} />}
        {activeMode === ToolMode.APA_TABLE && <ApaTableGenerator isDarkMode={isDarkMode} />}
        {activeMode === ToolMode.JAMOVI && <JamoviHelper isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

export default ToolsPanel;