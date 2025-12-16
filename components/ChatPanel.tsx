
import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Copy, Check, Sun, Moon, ArrowRightCircle, HelpCircle, Palette } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender, Language, Theme } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  language: Language;
  theme: Theme;
  onSendMessage: (text: string, attachment?: File) => void;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, language, theme, onSendMessage, onLanguageChange, onToggleTheme }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    onSendMessage(input, selectedFile || undefined);
    setInput('');
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  // Theme Helpers
  const isDark = theme === 'dark';
  
  const getStyles = () => {
      switch(theme) {
          case 'dark': return {
              bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-100', subText: 'text-slate-400',
              msgUser: 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 text-cyan-100 border border-cyan-800',
              msgAi: 'bg-slate-900 border border-slate-800 text-slate-100',
              inputBg: 'bg-slate-800 border-slate-700 text-white placeholder-slate-400',
              button: 'bg-cyan-700 text-white hover:bg-cyan-600',
              iconUser: 'bg-cyan-900 text-cyan-200', iconAi: 'bg-slate-800 text-white'
          };
          case 'corporate': return {
              bg: 'bg-white', border: 'border-blue-100', text: 'text-slate-900', subText: 'text-slate-500',
              msgUser: 'bg-blue-600 text-white border border-blue-600',
              msgAi: 'bg-white border border-blue-100 text-slate-800 shadow-sm',
              inputBg: 'bg-white border-blue-200 text-slate-900 placeholder-slate-400',
              button: 'bg-blue-600 text-white hover:bg-blue-700',
              iconUser: 'bg-blue-100 text-blue-700', iconAi: 'bg-white border border-blue-200 text-blue-600'
          };
          case 'academic': return {
              bg: 'bg-[#fffefb]', border: 'border-[#e5e0d8]', text: 'text-[#333]', subText: 'text-[#8d6e63]',
              msgUser: 'bg-[#5d4037] text-[#fffefb] border border-[#4e342e]',
              msgAi: 'bg-white border border-[#e5e0d8] text-[#333] shadow-sm',
              inputBg: 'bg-white border-[#d7ccc8] text-[#4e342e] placeholder-[#a1887f]',
              button: 'bg-[#5d4037] text-white hover:bg-[#4e342e]',
              iconUser: 'bg-[#d7ccc8] text-[#5d4037]', iconAi: 'bg-white border border-[#d7ccc8] text-[#5d4037]'
          };
          default: return { // Light
              bg: 'bg-white', border: 'border-gray-200', text: 'text-slate-900', subText: 'text-slate-500',
              msgUser: 'bg-gradient-to-br from-cyan-50 to-blue-50 text-slate-900 border border-cyan-100',
              msgAi: 'bg-white border border-gray-100 text-slate-900',
              inputBg: 'bg-white border-gray-300 text-slate-900 placeholder-gray-400',
              button: 'bg-slate-900 text-cyan-400 hover:bg-slate-800',
              iconUser: 'bg-cyan-100 text-cyan-700', iconAi: 'bg-slate-900 text-white'
          };
      }
  }
  const s = getStyles();

  // Custom Markdown Components
  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className={`text-2xl font-bold font-serif mb-4 mt-6 ${isDark ? 'text-white' : 'text-slate-900'}`} {...props} />,
    h2: ({node, ...props}: any) => <h2 className={`text-xl font-bold font-serif mb-3 mt-5 ${isDark ? 'text-cyan-100' : (theme === 'academic' ? 'text-[#5d4037]' : 'text-slate-800')}`} {...props} />,
    h3: ({node, ...props}: any) => <h3 className={`text-lg font-bold font-serif mb-2 mt-4 italic ${isDark ? 'text-cyan-200' : 'text-slate-700'}`} {...props} />,
    p: ({node, ...props}: any) => <p className={`mb-3 leading-relaxed text-base`} {...props} />,
    strong: ({node, ...props}: any) => <strong className={`font-bold`} {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className={``} {...props} />,
    
    // APA Style Table
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-4 mb-6">
            <table className={`w-full border-collapse text-sm text-left`} {...props} />
        </div>
    ),
    thead: ({node, ...props}: any) => <thead className={`border-b-2 ${isDark ? 'border-slate-500' : 'border-black'}`} {...props} />,
    tbody: ({node, ...props}: any) => <tbody className={`border-b ${isDark ? 'border-slate-500' : 'border-black'}`} {...props} />,
    tr: ({node, ...props}: any) => <tr className="" {...props} />,
    th: ({node, ...props}: any) => <th className={`py-2 px-4 font-bold italic align-bottom whitespace-nowrap`} {...props} />,
    td: ({node, ...props}: any) => <td className={`py-2 px-4 align-top ${isDark ? 'border-slate-700' : 'border-gray-200'}`} {...props} />,
    code: ({node, className, children, ...props}: any) => {
        return (
            <code className={`font-mono text-sm px-1 py-0.5 rounded ${isDark ? 'bg-slate-800 text-cyan-300' : 'bg-gray-100 text-pink-600'}`} {...props}>
                {children}
            </code>
        )
    }
  };

  return (
    <div className={`flex flex-col h-full border-r ${s.bg} ${s.border}`}>
      {/* Header */}
      <div className={`p-4 border-b ${s.border} ${s.bg} flex items-center justify-between shadow-sm z-10`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${s.iconAi}`}>
                <Bot size={24} />
            </div>
            <div>
                <h2 className={`font-bold font-serif leading-tight ${s.text}`}>Dr.SEM</h2>
                <p className={`text-[10px] ${s.subText}`}>AI Research Assistant</p>
            </div>
        </div>
        <div className="flex gap-2 items-center">
             <button onClick={onToggleTheme} className={`p-1.5 rounded-full transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider ${
                 isDark ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-slate-600'
             }`}>
                <Palette size={14} /> {theme}
             </button>
             <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
             <div className="flex gap-1">
                {[Language.TH, Language.EN, Language.CN].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => onLanguageChange(lang)}
                        className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                            language === lang 
                            ? (isDark ? 'bg-cyan-900 text-cyan-100' : (theme === 'corporate' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white')) 
                            : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100')
                        }`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
             </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-transparent'}`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
              msg.sender === Sender.USER ? s.iconUser : s.iconAi
            }`}>
              {msg.sender === Sender.USER ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] flex flex-col gap-2`}>
                <div className={`rounded-2xl p-6 shadow-sm relative group ${
                msg.sender === Sender.USER 
                    ? `${s.msgUser} rounded-tr-none`
                    : `${s.msgAi} rounded-tl-none`
                }`}>
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3">
                        {msg.attachments.map((att, idx) => (
                            <div key={idx} className={`rounded p-2 text-xs flex items-center gap-2 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                                <Paperclip size={12} />
                                <span className="truncate max-w-[150px]">Attachment</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="font-serif text-sm leading-7">
                    <ReactMarkdown components={MarkdownComponents as any}>
                        {msg.text}
                    </ReactMarkdown>
                </div>
                
                <div className={`flex items-center justify-between mt-4 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                    <span className={`text-[10px] opacity-60`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === Sender.AI && (
                        <button 
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-slate-700'}`}
                            title="Copy Markdown"
                        >
                            {copiedId === msg.id ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                        </button>
                    )}
                </div>
                </div>

                {/* Suggestions */}
                {msg.sender === Sender.AI && (
                    <div className="space-y-3 mt-1">
                        {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                            <div className="animate-fade-in">
                                <div className={`text-[10px] font-bold mb-1 flex items-center gap-1 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                    <ArrowRightCircle size={10} /> {t.importantQuestions}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {msg.suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSendMessage(q)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left shadow-sm ${
                                                isDark 
                                                ? 'bg-cyan-900/20 border-cyan-800 text-cyan-200 hover:bg-cyan-900/40 hover:border-cyan-700' 
                                                : 'bg-cyan-50 border-cyan-100 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-200'
                                            }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.iconAi}`}>
              <Bot size={16} />
            </div>
            <div className={`border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center ${s.msgAi}`}>
              <Loader2 className="animate-spin text-cyan-600" size={20} />
              <span className={`ml-2 text-sm opacity-70`}>Dr.SEM is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${s.bg} ${s.border}`}>
        {selectedFile && (
            <div className={`mb-2 flex items-center gap-2 text-xs p-2 rounded-lg inline-flex ${isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
                <Paperclip size={14} />
                <span className="max-w-[200px] truncate">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="ml-2 hover:text-red-500">×</button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*,.pdf,.csv,.txt"
             onChange={handleFileSelect}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:text-slate-700 hover:bg-gray-100'}`}
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all text-sm ${s.inputBg}`}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`p-3 rounded-xl transition-colors shadow-lg ${s.button} disabled:opacity-50`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
