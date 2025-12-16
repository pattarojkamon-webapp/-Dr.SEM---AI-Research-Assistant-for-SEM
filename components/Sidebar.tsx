
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { SIDEBAR_ITEMS } from '../constants';
import { Theme } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelectTopic: (topic: string) => void;
  theme: Theme;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onSelectTopic, theme }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Dr.SEM User Guide': true,
    '1. SEM Fundamentals': true
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isDark = theme === 'dark';

  const getStyles = () => {
      switch(theme) {
          case 'dark': return { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-300', hover: 'hover:bg-slate-800', itemHover: 'hover:text-cyan-300 hover:bg-slate-800' };
          case 'corporate': return { bg: 'bg-white', border: 'border-blue-100', text: 'text-slate-700', hover: 'hover:bg-blue-50', itemHover: 'hover:text-blue-700 hover:bg-blue-50' };
          case 'academic': return { bg: 'bg-[#fffefb]', border: 'border-[#e5e0d8]', text: 'text-[#5d4037]', hover: 'hover:bg-[#f0ece5]', itemHover: 'hover:text-[#3e2723] hover:bg-[#efebe9]' };
          default: return { bg: 'bg-white', border: 'border-gray-200', text: 'text-slate-700', hover: 'hover:bg-gray-100', itemHover: 'hover:text-cyan-700 hover:bg-gray-50' };
      }
  };
  const s = getStyles();

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg shadow-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}
        ${s.bg} ${s.border} border-r ${s.text} flex flex-col h-full
      `}>
        <div className={`p-4 border-b ${s.border} flex items-center gap-2`}>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold font-serif shadow-sm ${
                theme === 'corporate' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 
                theme === 'academic' ? 'bg-gradient-to-br from-[#8d6e63] to-[#5d4037]' :
                'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
                Dr
            </div>
            <h1 className="font-serif font-bold text-lg tracking-tight">Dr.SEM Menu</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {SIDEBAR_ITEMS.map((section) => (
            <div key={section.title} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-semibold transition-colors ${s.hover}`}
              >
                <div className="flex items-center gap-2">
                  <section.icon size={16} className={
                      theme === 'corporate' ? 'text-blue-500' : 
                      theme === 'academic' ? 'text-[#8d6e63]' :
                      'text-cyan-500'
                  } />
                  <span>{section.title}</span>
                </div>
                {expandedSections[section.title] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {expandedSections[section.title] && (
                <div className={`ml-4 mt-1 pl-2 border-l ${s.border} space-y-1`}>
                  {section.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                          onSelectTopic(item);
                          if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${s.itemHover}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`p-4 text-[10px] text-center opacity-60 border-t ${s.border}`}>
             Version 2.0.1 <br/> Updated for Jamovi SEMLj
        </div>
      </div>
    </>
  );
};

export default Sidebar;
