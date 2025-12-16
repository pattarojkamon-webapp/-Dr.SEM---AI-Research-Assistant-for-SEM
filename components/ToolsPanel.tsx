
import React from 'react';
import { Layout, Activity, FileText, Terminal, Users, Calculator } from 'lucide-react';
import { ToolMode, Language, Node, Link, Theme } from '../types';
import { TRANSLATIONS } from '../constants';
import FitIndicesChecker from './FitIndicesChecker';
import ApaTableGenerator from './ApaTableGenerator';
import ModelPreview from './ModelPreview';
import JamoviHelper from './JamoviHelper';
import SampleSizeCalculator from './SampleSizeCalculator';
import ValidityCalculator from './ValidityCalculator';

interface ToolsPanelProps {
  activeMode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  language: Language;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  theme: Theme;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ activeMode, onModeChange, language, nodes, setNodes, links, setLinks, theme }) => {
  const t = TRANSLATIONS[language];
  const isDark = theme === 'dark';

  const tabs = [
      { id: ToolMode.CONCEPTUAL, label: t.toolCanvas, icon: Layout },
      { id: ToolMode.FIT_CHECKER, label: t.toolFit, icon: Activity },
      { id: ToolMode.APA_TABLE, label: t.toolApa, icon: FileText },
      { id: ToolMode.JAMOVI, label: t.toolJamovi, icon: Terminal },
      { id: ToolMode.SAMPLE_SIZE, label: "Sample Size", icon: Users },
      { id: ToolMode.VALIDITY, label: "AVE/CR Calc", icon: Calculator },
  ];
  
  // Theme styling for tabs container
  const getTabContainerStyle = () => {
     switch(theme) {
         case 'dark': return 'border-slate-800 bg-slate-900';
         case 'corporate': return 'border-blue-100 bg-white';
         case 'academic': return 'border-[#e5e0d8] bg-[#fffefb]';
         default: return 'border-gray-200 bg-white';
     }
  };

  const getTabStyle = (isActive: boolean) => {
      if (isActive) {
          switch(theme) {
              case 'dark': return 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-800';
              case 'corporate': return 'text-blue-600 border-b-2 border-blue-500 bg-blue-50';
              case 'academic': return 'text-[#5d4037] border-b-2 border-[#5d4037] bg-[#efebe9]';
              default: return 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/20';
          }
      } else {
          return isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-slate-700';
      }
  };

  return (
    <div className={`flex flex-col h-full`}>
      {/* Tool Navigation */}
      <div className={`flex border-b overflow-x-auto scrollbar-hide ${getTabContainerStyle()}`}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onModeChange(tab.id)}
                className={`flex-1 min-w-[70px] py-3 text-[10px] md:text-xs font-medium flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors whitespace-nowrap px-2 ${getTabStyle(activeMode === tab.id)}`}
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
                theme={theme} 
            />
        }
        {activeMode === ToolMode.FIT_CHECKER && <FitIndicesChecker isDarkMode={isDark} />}
        {activeMode === ToolMode.APA_TABLE && <ApaTableGenerator isDarkMode={isDark} />}
        {activeMode === ToolMode.JAMOVI && <JamoviHelper isDarkMode={isDark} />}
        {activeMode === ToolMode.SAMPLE_SIZE && <SampleSizeCalculator theme={theme} />}
        {activeMode === ToolMode.VALIDITY && <ValidityCalculator theme={theme} />}
      </div>
    </div>
  );
};

export default ToolsPanel;
