import React, { useState, useEffect } from 'react';
import ChatPanel from './components/ChatPanel';
import ToolsPanel from './components/ToolsPanel';
import { Message, Sender, ToolMode, Language, Node, Link } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { TRANSLATIONS } from './constants';
import { AlertTriangle, Sparkles } from 'lucide-react';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    if (savedTheme === 'dark') setIsDarkMode(true);
    
    // Check API Key
    if (!process.env.API_KEY) checkApiKey();
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
    localStorage.setItem('drsem_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  return (
    <div className={`flex h-screen overflow-hidden flex-col md:flex-row relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
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

      {/* Left: Chat */}
      <div className={`w-full md:w-1/2 lg:w-5/12 h-[60%] md:h-full z-10 shadow-xl flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-gray-200'}`}>
        <ChatPanel 
            messages={messages} 
            isLoading={isLoading} 
            language={language}
            onLanguageChange={setLanguage}
            onSendMessage={handleSendMessage}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Right: Tools */}
      <div className={`w-full md:w-1/2 lg:w-7/12 h-[40%] md:h-full border-t md:border-l md:border-t-0 flex flex-col transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-200'}`}>
        <div className="flex-1 overflow-hidden">
            <ToolsPanel 
                activeMode={activeTool} 
                onModeChange={setActiveTool} 
                language={language}
                nodes={nodes}
                setNodes={setNodes}
                links={links}
                setLinks={setLinks}
                isDarkMode={isDarkMode}
            />
        </div>
        {/* Footer */}
        <div className={`p-2 text-[10px] text-center font-light tracking-wide border-t transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-500 border-slate-900' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
            {TRANSLATIONS[language].footer}
        </div>
      </div>
    </div>
  );
}

export default App;