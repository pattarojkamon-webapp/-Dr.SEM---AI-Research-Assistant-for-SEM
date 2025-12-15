import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Copy, Check, Sun, Moon, ArrowRightCircle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  language: Language;
  isDarkMode: boolean;
  onSendMessage: (text: string, attachment?: File) => void;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, language, isDarkMode, onSendMessage, onLanguageChange, onToggleTheme }) => {
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

  const bgColor = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const headerBorder = isDarkMode ? 'border-slate-800' : 'border-gray-100';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex flex-col h-full border-r ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${headerBorder} ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-between shadow-sm z-10`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${isDarkMode ? 'bg-slate-800 text-cyan-400' : 'bg-slate-900 text-cyan-400'}`}>
                <Bot size={24} />
            </div>
            <div>
                <h2 className={`font-bold font-serif leading-tight ${textColor}`}>Dr.SEM</h2>
                <p className={`text-[10px] ${subTextColor}`}>AI Research Assistant</p>
            </div>
        </div>
        <div className="flex gap-2 items-center">
             <button onClick={onToggleTheme} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-200 text-slate-600 hover:bg-gray-300'}`}>
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
             </button>
             <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
             <div className="flex gap-1">
                {[Language.TH, Language.EN, Language.CN].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => onLanguageChange(lang)}
                        className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                            language === lang 
                            ? (isDarkMode ? 'bg-cyan-900 text-cyan-100' : 'bg-slate-800 text-white') 
                            : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100')
                        }`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
             </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50/50'}`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
              msg.sender === Sender.USER 
              ? (isDarkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-700') 
              : (isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white')
            }`}>
              {msg.sender === Sender.USER ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] flex flex-col gap-2`}>
                <div className={`rounded-2xl p-4 shadow-sm relative group ${
                msg.sender === Sender.USER 
                    ? (isDarkMode 
                        ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 text-cyan-100 border border-cyan-800 rounded-tr-none' 
                        : 'bg-gradient-to-br from-cyan-50 to-blue-50 text-slate-800 border border-cyan-100 rounded-tr-none')
                    : (isDarkMode 
                        ? 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none' 
                        : 'bg-white border border-gray-100 text-slate-700 rounded-tl-none')
                }`}>
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3">
                        {msg.attachments.map((att, idx) => (
                            <div key={idx} className={`rounded p-2 text-xs flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                                <Paperclip size={12} />
                                <span className="truncate max-w-[150px]">Attachment</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className={`prose prose-sm max-w-none break-words ${isDarkMode ? 'prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-cyan-400' : 'prose-slate'}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === Sender.AI && (
                        <button 
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-slate-700'}`}
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
                                <div className={`text-[10px] font-bold mb-1 flex items-center gap-1 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                    <ArrowRightCircle size={10} /> {t.importantQuestions}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {msg.suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSendMessage(q)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left shadow-sm ${
                                                isDarkMode 
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
                        {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                            <div className="animate-fade-in delay-75">
                                <div className={`text-[10px] font-bold mb-1 flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <HelpCircle size={10} /> {t.relatedQuestions}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {msg.relatedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => onSendMessage(q)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left shadow-sm ${
                                                isDarkMode 
                                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600' 
                                                : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300'
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
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
              <Bot size={16} />
            </div>
            <div className={`border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
              <Loader2 className="animate-spin text-cyan-600" size={20} />
              <span className={`ml-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Dr.SEM is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        {selectedFile && (
            <div className={`mb-2 flex items-center gap-2 text-xs p-2 rounded-lg inline-flex ${isDarkMode ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
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
            className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-400 hover:text-slate-700 hover:bg-gray-100'}`}
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm ${
                isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className={`p-3 rounded-xl transition-colors shadow-lg ${
                isDarkMode
                ? 'bg-cyan-700 text-white hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600'
                : 'bg-slate-900 text-cyan-400 hover:bg-slate-800 disabled:opacity-50'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;