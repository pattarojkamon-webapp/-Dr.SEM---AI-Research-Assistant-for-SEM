
import React, { useState, useEffect, useCallback } from 'react';
import ChatPanel from './components/ChatPanel';
import ToolsPanel from './components/ToolsPanel';
import Sidebar from './components/Sidebar';
import { Message, Sender, ToolMode, Language, Node, Link, Theme } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { TRANSLATIONS } from './constants';
import { AlertTriangle, Sparkles, GripVertical, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [nodes, setNodes] = useState<Node[]>([
      { id: '1', label: 'Leadership', type: 'latent', x: 50, y: 50 },
      { id: '2', label: 'Quality', type: 'latent', x: 250, y: 50 },
      { id: '3', label: 'Success', type: 'latent', x: 150, y: 200 },
  ]);
  const [links, setLinks] = useState<Link[]>([
      { source: '1', target: '3', type: 'directed' },
      { source: '2', target: '3', type: 'directed' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolMode>(ToolMode.CONCEPTUAL);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.TH);
  const [suggestedTool, setSuggestedTool] = useState<ToolMode | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('light');

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Resizable Panel State
  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Percentage
  const [isDragging, setIsDragging] = useState(false);

  // Persistence
  useEffect(() => {
    const savedMessages = localStorage.getItem('drsem_messages');
    const savedNodes = localStorage.getItem('drsem_nodes');
    const savedLinks = localStorage.getItem('drsem_links');
    const savedTheme = localStorage.getItem('drsem_theme');
    
    if (savedMessages) {
        setMessages(JSON.parse(savedMessages, (key, value) => 
            key === 'timestamp' ? new Date(value) : value
        ));
    } else {
        setMessages([{
            id: '1',
            text: TRANSLATIONS[Language.TH].greeting,
            sender: Sender.AI,
            timestamp: new Date(),
        }]);
    }

    if (savedNodes) setNodes(JSON.parse(savedNodes));
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedTheme) setTheme(savedTheme as Theme);
    
    // Check API Key safely
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
    if (!apiKey) checkApiKey();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('drsem_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('drsem_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('drsem_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('drsem_theme', theme);
    document.documentElement.className = ''; // Clear previous classes
    if (theme === 'dark') document.documentElement.classList.add('dark');
    // For other themes, we handle them via React props, but could add global classes if needed
  }, [theme]);

  const cycleTheme = () => {
      const themes: Theme[] = ['light', 'dark', 'corporate', 'academic'];
      const currentIndex = themes.indexOf(theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setTheme(nextTheme);
  };

  // Resizer Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const checkApiKey = async () => {
      try {
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setApiKeyMissing(!hasKey);
        }
      } catch (e) {
          console.error("Error checking API key", e);
      }
  }

  const handleSelectKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
          await (window as any).aistudio.openSelectKey();
          setApiKeyMissing(false);
      } else {
          alert("API Key configuration is missing. If you are deploying to Vercel, please set the 'API_KEY' environment variable in your project settings.");
      }
  }

  const handleSendMessage = async (text: string, attachment?: File) => {
    let attachmentData = null;
    if (attachment) {
        const reader = new FileReader();
        attachmentData = await new Promise<{mimeType: string, data: string} | null>((resolve) => {
            reader.onload = () => {
                const result = reader.result as string;
                resolve({ mimeType: attachment.type, data: result });
            };
            reader.readAsDataURL(attachment);
        });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: Sender.USER,
      timestamp: new Date(),
      attachments: attachment ? [{ type: 'file', content: attachment.name }] : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedTool(null);

    try {
      const history = messages.map(m => ({
          role: m.sender === Sender.USER ? 'user' : 'model',
          parts: [{ text: m.text }] 
      }));

      const response = await sendMessageToGemini(history, text, attachmentData);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer || "System Error",
        sender: Sender.AI,
        timestamp: new Date(),
        suggestedQuestions: response.suggestedQuestions,
        relatedQuestions: response.relatedQuestions
      };
      setMessages((prev) => [...prev, aiMsg]);

      const lowerText = response.answer?.toLowerCase() || "";
      if (lowerText.includes("cfi") || lowerText.includes("rmsea") || lowerText.includes("fit index")) {
          setSuggestedTool(ToolMode.FIT_CHECKER);
      } else if (lowerText.includes("apa table") || lowerText.includes("ตาราง")) {
          setSuggestedTool(ToolMode.APA_TABLE);
      } else if (lowerText.includes("jamovi") || lowerText.includes("syntax") || lowerText.includes("code")) {
          setSuggestedTool(ToolMode.JAMOVI);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error connecting to Dr.SEM. Please check your API Key.",
        sender: Sender.AI,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (String(error).includes('API_KEY')) setApiKeyMissing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuSelect = (topic: string) => {
    const prompt = `Can you explain about "${topic}" in the context of SEM research? Please guide me step-by-step or provide examples.`;
    handleSendMessage(prompt);
  };

  if (apiKeyMissing) {
      return (
          <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
              <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl max-w-md">
                  <AlertTriangle className="mx-auto mb-4 text-yellow-400" size={48} />
                  <h1 className="text-2xl font-bold mb-4 font-serif">API Key Required</h1>
                  <p className="mb-6 text-gray-300">To consult with Dr.SEM, please provide a valid Google GenAI API Key.</p>
                  <button onClick={handleSelectKey} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full transition-colors">Select API Key</button>
              </div>
          </div>
      )
  }

  // Helper for background colors based on theme
  const getAppBackground = () => {
      switch(theme) {
          case 'dark': return 'bg-slate-950 text-slate-100';
          case 'corporate': return 'bg-slate-50 text-slate-900';
          case 'academic': return 'bg-[#fdfbf7] text-[#333]'; // Warm paper-like
          default: return 'bg-gray-50 text-slate-900';
      }
  };

  const getBorderColor = () => {
      switch(theme) {
          case 'dark': return 'border-slate-800';
          case 'corporate': return 'border-blue-200';
          case 'academic': return 'border-[#e5e0d8]';
          default: return 'border-gray-200';
      }
  };

  return (
    <div className={`flex h-screen overflow-hidden flex-col md:flex-row relative transition-colors duration-300 ${getAppBackground()}`}>
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex h-full flex-shrink-0">
         <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
            onSelectTopic={handleMenuSelect}
            theme={theme}
         />
         
         {/* Sidebar Toggle Button (Sticky) */}
         <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className={`self-center p-1 -ml-3 z-30 rounded-full shadow border transition-colors ${
               theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 
               theme === 'corporate' ? 'bg-white border-blue-200 text-blue-500' :
               theme === 'academic' ? 'bg-[#fffefb] border-[#e5e0d8] text-[#5d4037]' :
               'bg-white border-gray-200 text-gray-500'
           }`}
         >
           {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
         </button>
      </div>

      {/* Sidebar - Mobile */}
      <div className="md:hidden">
         <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
            onSelectTopic={handleMenuSelect}
            theme={theme}
         />
      </div>

      {/* Toast Suggestion */}
      {suggestedTool && suggestedTool !== activeTool && (
          <div className="absolute top-20 right-4 md:right-[50%] z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in border border-slate-700">
              <Sparkles className="text-yellow-400" size={18} />
              <div className="text-sm">
                  <p className="font-bold">{TRANSLATIONS[language].suggestion}</p>
                  <p className="text-xs text-gray-300">{suggestedTool.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={() => { setActiveTool(suggestedTool); setSuggestedTool(null); }}
                className="ml-2 bg-cyan-600 px-3 py-1 rounded text-xs font-bold hover:bg-cyan-500"
              >
                  {TRANSLATIONS[language].switch}
              </button>
              <button onClick={() => setSuggestedTool(null)} className="text-gray-400 hover:text-white ml-1">×</button>
          </div>
      )}

      {/* Left: Chat - Resizable */}
      <div 
        className={`h-[60%] md:h-full z-10 shadow-xl flex flex-col transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-r border-slate-800' :
            theme === 'corporate' ? 'bg-white border-r border-blue-100' :
            theme === 'academic' ? 'bg-[#fffefb] border-r border-[#e5e0d8]' :
            'bg-white border-r border-gray-200'
        }`}
        style={{ width: window.innerWidth >= 768 ? `${leftPanelWidth}%` : '100%' }}
      >
        <ChatPanel 
            messages={messages} 
            isLoading={isLoading} 
            language={language}
            onLanguageChange={setLanguage}
            onSendMessage={handleSendMessage}
            theme={theme}
            onToggleTheme={cycleTheme}
        />
      </div>

      {/* Resizer Handle (Desktop only) */}
      <div 
        className={`hidden md:flex w-2 cursor-col-resize items-center justify-center hover:bg-opacity-50 transition-colors z-20 ${
            isDragging ? 'bg-cyan-500' : 
            theme === 'dark' ? 'bg-slate-950 text-slate-600' : 
            theme === 'corporate' ? 'bg-blue-50 text-blue-300' :
            theme === 'academic' ? 'bg-[#f0ece5] text-[#8d6e63]' :
            'bg-gray-100 text-gray-400'
        }`}
        onMouseDown={handleMouseDown}
      >
          <GripVertical size={16} />
      </div>

      {/* Right: Tools - Resizable */}
      <div 
        className={`h-[40%] md:h-full border-t md:border-t-0 flex flex-col transition-colors ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' :
            theme === 'corporate' ? 'bg-slate-50 border-blue-100' :
            theme === 'academic' ? 'bg-[#fdfbf7] border-[#e5e0d8]' :
            'bg-slate-50 border-gray-200'
        }`}
        style={{ width: window.innerWidth >= 768 ? `${100 - leftPanelWidth}%` : '100%' }}
      >
        <div className="flex-1 overflow-hidden">
            <ToolsPanel 
                activeMode={activeTool} 
                onModeChange={setActiveTool} 
                language={language}
                nodes={nodes}
                setNodes={setNodes}
                links={links}
                setLinks={setLinks}
                theme={theme}
            />
        </div>
        {/* Footer */}
        <div className={`p-2 text-[10px] text-center font-light tracking-wide border-t transition-colors ${
            theme === 'dark' ? 'bg-slate-950 text-slate-500 border-slate-900' : 
            theme === 'corporate' ? 'bg-white text-blue-400 border-blue-50' :
            theme === 'academic' ? 'bg-[#fdfbf7] text-[#8d6e63] border-[#e5e0d8]' :
            'bg-slate-900 text-slate-400 border-slate-800'
        }`}>
            {TRANSLATIONS[language].footer}
        </div>
      </div>
    </div>
  );
}

export default App;
