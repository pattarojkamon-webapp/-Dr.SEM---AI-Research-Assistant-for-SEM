
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Node, Link, Theme } from '../types';
import { PlusCircle, Link as LinkIcon, MousePointer2, Trash2, Undo2, Redo2, ArrowLeftRight, Save, FolderOpen, FilePlus, Wand2 } from 'lucide-react';
import mermaid from 'mermaid';

interface ModelPreviewProps {
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    links: Link[];
    setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
    theme: Theme;
}

interface SavedModel {
    id: string;
    name: string;
    timestamp: Date;
    nodes: Node[];
    links: Link[];
}

// Maximum history steps
const HISTORY_LIMIT = 20;

const ModelPreview: React.FC<ModelPreviewProps> = ({ nodes, setNodes, links, setLinks, theme }) => {
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<'latent' | 'observed'>('latent');
  const [mermaidSyntax, setMermaidSyntax] = useState('');
  const [viewMode, setViewMode] = useState<'canvas' | 'mermaid'>('canvas');
  const [interactionMode, setInteractionMode] = useState<'move' | 'link'>('move');
  const [linkType, setLinkType] = useState<'directed' | 'covariance'>('directed');
  
  // Interaction State
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [tempLineEnd, setTempLineEnd] = useState<{x: number, y: number} | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);
  
  // History State
  const [history, setHistory] = useState<{nodes: Node[], links: Link[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Save/Load State
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  
  const mermaidRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // --- History Management ---
  const saveToHistory = useCallback((newNodes: Node[], newLinks: Link[]) => {
      setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          // Deep copy to prevent reference issues
          const entry = { nodes: JSON.parse(JSON.stringify(newNodes)), links: JSON.parse(JSON.stringify(newLinks)) };
          
          if (newHistory.length >= HISTORY_LIMIT) {
              newHistory.shift();
          }
          return [...newHistory, entry];
      });
      setHistoryIndex(prev => Math.min(prev + 1, HISTORY_LIMIT - 1));
  }, [historyIndex]);

  const undo = () => {
      if (historyIndex > 0) {
          isUndoRedoAction.current = true;
          const prevState = history[historyIndex - 1];
          // Deep copy when restoring
          setNodes(JSON.parse(JSON.stringify(prevState.nodes)));
          setLinks(JSON.parse(JSON.stringify(prevState.links)));
          setHistoryIndex(historyIndex - 1);
          setSelectedNodeId(null);
          setSelectedLinkIndex(null);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          isUndoRedoAction.current = true;
          const nextState = history[historyIndex + 1];
          setNodes(JSON.parse(JSON.stringify(nextState.nodes)));
          setLinks(JSON.parse(JSON.stringify(nextState.links)));
          setHistoryIndex(historyIndex + 1);
          setSelectedNodeId(null);
          setSelectedLinkIndex(null);
      }
  };

  useEffect(() => {
     if (history.length === 0 && nodes.length > 0) {
         saveToHistory(nodes, links);
     }
  }, []);

  useEffect(() => {
      if (!isUndoRedoAction.current) {
          if (nodes.length > 0 || links.length > 0) {
            const currentHistory = history[historyIndex];
            // Simple stringify check to avoid redundant saves
            if (!currentHistory || JSON.stringify(currentHistory.nodes) !== JSON.stringify(nodes) || JSON.stringify(currentHistory.links) !== JSON.stringify(links)) {
                 saveToHistory(nodes, links);
            }
          }
      }
      isUndoRedoAction.current = false;
  }, [nodes, links, saveToHistory, history, historyIndex]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: isDark ? 'dark' : 'default', securityLevel: 'loose' });
  }, [isDark]);

  useEffect(() => {
    const storedModels = localStorage.getItem('drsem_saved_models');
    if (storedModels) {
        try {
            setSavedModels(JSON.parse(storedModels));
        } catch (e) {
            console.error("Failed to parse saved models");
        }
    }
  }, []);

  // --- Save/Load Logic Fixed ---
  const saveCurrentModel = () => {
    const name = prompt("Enter a name for this model:", `Model ${savedModels.length + 1}`);
    if (!name) return;

    const newModel: SavedModel = {
        id: Date.now().toString(),
        name,
        timestamp: new Date(),
        nodes: JSON.parse(JSON.stringify(nodes)), // Deep copy
        links: JSON.parse(JSON.stringify(links))
    };
    
    const updatedModels = [...savedModels, newModel];
    setSavedModels(updatedModels);
    localStorage.setItem('drsem_saved_models', JSON.stringify(updatedModels));
  };

  const loadModel = (model: SavedModel) => {
      if (window.confirm(`Load "${model.name}"? Current canvas will be replaced.`)) {
          // Deep copy on load
          const loadedNodes = JSON.parse(JSON.stringify(model.nodes));
          const loadedLinks = JSON.parse(JSON.stringify(model.links));
          
          setNodes(loadedNodes);
          setLinks(loadedLinks);
          
          // Reset History for new model
          setHistory([{ nodes: loadedNodes, links: loadedLinks }]);
          setHistoryIndex(0);
          setIsLoadModalOpen(false);
      }
  };

  const deleteSavedModel = (id: string, e: React.MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this saved file?")) {
          const updatedModels = savedModels.filter(m => m.id !== id);
          setSavedModels(updatedModels);
          localStorage.setItem('drsem_saved_models', JSON.stringify(updatedModels));
      }
  };

  const createNewModel = () => {
      if (window.confirm("Start a new model? Unsaved changes will be lost.")) {
          setNodes([]);
          setLinks([]);
          setHistory([{ nodes: [], links: [] }]);
          setHistoryIndex(0);
      }
  };

  // --- Auto Layout Logic (Fixed Mutation Issue) ---
  const autoLayout = () => {
      // 1. Deep Clone to ensure React detects state changes
      const newNodes = nodes.map(n => ({ ...n }));
      
      const latents = newNodes.filter(n => n.type === 'latent');
      const observed = newNodes.filter(n => n.type === 'observed');
      
      if (latents.length === 0 && observed.length === 0) return;

      // 2. Identify Exogenous vs Endogenous Latents
      // Exogenous: No incoming paths from other Latents
      const exogenousLatents = latents.filter(l => 
          !links.some(link => link.target === l.id && link.type === 'directed' && latents.some(src => src.id === link.source))
      );
      
      // Endogenous: Have incoming paths from other Latents
      const endogenousLatents = latents.filter(l => !exogenousLatents.find(ex => ex.id === l.id));

      // 3. Layout Parameters
      const canvasPadding = 100;
      const layerGap = 350; // Horizontal gap between Latent Layers
      const nodeGap = 180;  // Vertical gap between nodes
      const observedGap = 100; // Horizontal gap between observed variables

      // 4. Position Exogenous Latents (Left Column)
      let currentY = canvasPadding;
      exogenousLatents.forEach((node) => {
          node.x = canvasPadding;
          node.y = currentY;
          currentY += nodeGap;
      });

      // 5. Position Endogenous Latents (Right Column - Simplified)
      // Reset Y but center relative to Exogenous if fewer
      const totalExoHeight = exogenousLatents.length * nodeGap;
      const totalEndoHeight = endogenousLatents.length * nodeGap;
      let endoStartY = canvasPadding;
      if (endogenousLatents.length < exogenousLatents.length) {
           endoStartY += (totalExoHeight - totalEndoHeight) / 2;
      }

      endogenousLatents.forEach((node, i) => {
          node.x = canvasPadding + layerGap;
          node.y = endoStartY + (i * nodeGap);
      });

      // 6. Position Observed Variables (Below their Latents)
      latents.forEach(latent => {
           // Find observed variables connected to this latent (source=Latent, target=Observed OR source=Observed, target=Latent)
           // Usually Latent -> Observed (Reflective) or Observed -> Latent (Formative)
           const connectedObs = links
            .filter(l => (l.source === latent.id && observed.some(o => o.id === l.target)) || (l.target === latent.id && observed.some(o => o.id === l.source)))
            .map(l => {
                const targetId = l.source === latent.id ? l.target : l.source;
                return observed.find(o => o.id === targetId)!;
            })
            // Filter out undefined and remove duplicates
            .filter((v, i, a) => v && a.findIndex(t => t.id === v.id) === i);
           
           if (connectedObs.length > 0) {
               const totalWidth = (connectedObs.length - 1) * observedGap;
               const startX = latent.x - (totalWidth / 2);
               
               connectedObs.forEach((obs, i) => {
                   if (obs) {
                       obs.x = startX + (i * observedGap);
                       // Place below if Reflective (Latent -> Obs), could be above if complex, defaulting to below for tidiness
                       obs.y = latent.y + 120; 
                   }
               });
           }
      });

      setNodes(newNodes);
      saveToHistory(newNodes, links);
  };

  useEffect(() => {
    // Auto-generate mermaid syntax when nodes/links change
    let syntax = 'graph LR\n';
    
    if (isDark) {
        syntax += 'classDef latent fill:#1e293b,stroke:#e2e8f0,stroke-width:2px,rx:50,ry:50,color:#fff;\n';
        syntax += 'classDef observed fill:#0f172a,stroke:#06b6d4,stroke-width:1px,rx:0,ry:0,color:#fff;\n';
    } else {
        syntax += 'classDef latent fill:#fff,stroke:#333,stroke-width:2px,rx:50,ry:50;\n';
        syntax += 'classDef observed fill:#f0f9ff,stroke:#0891b2,stroke-width:1px,rx:0,ry:0;\n';
    }

    nodes.forEach(node => {
        const safeLabel = node.label.replace(/[^a-zA-Z0-9]/g, '_');
        const displayLabel = node.label || node.id;
        const shape = node.type === 'latent' ? `((${displayLabel}))` : `[${displayLabel}]`;
        syntax += `${node.id}${shape}:::${node.type}\n`;
    });

    links.forEach(link => {
        const arrow = link.type === 'covariance' ? '<-->' : '-->';
        syntax += `${link.source} ${arrow} ${link.target}\n`;
    });

    setMermaidSyntax(syntax);
  }, [nodes, links, isDark]);

  useEffect(() => {
      if (viewMode === 'mermaid' && mermaidRef.current) {
          mermaid.contentLoaded();
          try {
             mermaid.run({ nodes: [mermaidRef.current] });
          } catch(e) { console.error(e); }
      }
  }, [viewMode, mermaidSyntax]);

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const newNode: Node = {
      id: `n${Date.now()}`,
      label: newNodeLabel,
      type: nodeType,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
    };
    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
  };

  const handleNodeClick = (id: string) => {
      if (interactionMode === 'link') {
          if (linkingSourceId === null) {
              setLinkingSourceId(id);
          } else if (linkingSourceId === id) {
              setLinkingSourceId(null);
              setTempLineEnd(null);
          } else {
              if (linkingSourceId !== id) { 
                  const exists = links.some(l => 
                    (l.source === linkingSourceId && l.target === id) || 
                    (linkType === 'covariance' && l.source === id && l.target === linkingSourceId)
                  );
                  if (!exists) {
                      setLinks([...links, { source: linkingSourceId, target: id, type: linkType }]);
                  }
              }
              setLinkingSourceId(null);
              setTempLineEnd(null);
          }
      } else {
          setSelectedNodeId(id);
          setSelectedLinkIndex(null);
      }
  };

  const handleLinkClick = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedLinkIndex(index);
      setSelectedNodeId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (interactionMode === 'link' && linkingSourceId) {
          const rect = e.currentTarget.getBoundingClientRect();
          setTempLineEnd({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          });
      }
  };

  const handleDeleteSelected = () => {
      if (selectedNodeId) {
          const node = nodes.find(n => n.id === selectedNodeId);
          if (window.confirm(`Delete variable "${node?.label}"?`)) {
              setNodes(nodes.filter(n => n.id !== selectedNodeId));
              setLinks(links.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId));
              setSelectedNodeId(null);
          }
      } else if (selectedLinkIndex !== null) {
          if (window.confirm("Delete this link?")) {
              setLinks(links.filter((_, i) => i !== selectedLinkIndex));
              setSelectedLinkIndex(null);
          }
      }
  };

  // Styles based on theme
  const getStyles = () => {
      switch(theme) {
          case 'dark': return { 
              bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-100', 
              nodeLatent: 'border-slate-400 bg-slate-800 text-white',
              nodeObserved: 'border-cyan-500 bg-slate-900 text-cyan-300',
              btn: 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white',
              btnActive: 'bg-cyan-900 border-cyan-700 text-cyan-100'
          };
          case 'corporate': return { 
              bg: 'bg-white', border: 'border-blue-100', text: 'text-slate-800', 
              nodeLatent: 'border-blue-800 bg-blue-50 text-blue-900',
              nodeObserved: 'border-blue-400 bg-white text-blue-700',
              btn: 'bg-white border-blue-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50',
              btnActive: 'bg-blue-100 border-blue-300 text-blue-800'
          };
          case 'academic': return { 
              bg: 'bg-[#fdfbf7]', border: 'border-[#e5e0d8]', text: 'text-[#333]', 
              nodeLatent: 'border-[#5d4037] bg-[#efebe9] text-[#3e2723]',
              nodeObserved: 'border-[#8d6e63] bg-white text-[#5d4037]',
              btn: 'bg-white border-[#d7ccc8] text-[#5d4037] hover:bg-[#efebe9]',
              btnActive: 'bg-[#d7ccc8] border-[#a1887f] text-[#3e2723]'
          };
          default: return { 
              bg: 'bg-slate-50', border: 'border-gray-200', text: 'text-slate-900', 
              nodeLatent: 'border-slate-800 bg-white text-slate-900',
              nodeObserved: 'border-cyan-600 bg-cyan-50 text-slate-900',
              btn: 'bg-white border-gray-200 text-gray-500 hover:text-slate-900 hover:bg-gray-100',
              btnActive: 'bg-cyan-50 border-cyan-200 text-cyan-700'
          };
      }
  };
  const s = getStyles();

  // Helper for Square Buttons
  const SquareBtn = ({ onClick, active = false, disabled = false, title, children, className = '' }: any) => (
      <button 
          onClick={onClick} 
          disabled={disabled}
          title={title}
          className={`w-9 h-9 p-0 rounded-lg flex items-center justify-center transition-all shadow-sm border ${active ? s.btnActive : s.btn} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      >
          {children}
      </button>
  );

  return (
    <div className={`flex flex-col h-full ${s.bg}`}>
      <div className={`p-4 border-b flex justify-between items-center ${s.bg} ${s.border}`}>
        <div>
            <h3 className={`text-lg font-bold font-serif ${s.text}`}>Research Canvas</h3>
            <p className={`text-xs opacity-60`}>Conceptual & Structural Model</p>
        </div>
        <div className={`flex rounded p-1 gap-1 border ${s.border}`}>
             <button 
                onClick={() => setViewMode('canvas')} 
                className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'canvas' ? s.btnActive : 'opacity-60 hover:opacity-100'}`}
             >
                 Interactive
             </button>
             <button 
                onClick={() => setViewMode('mermaid')} 
                className={`px-3 py-1 text-xs rounded transition-all ${viewMode === 'mermaid' ? s.btnActive : 'opacity-60 hover:opacity-100'}`}
             >
                 Mermaid
             </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        {viewMode === 'canvas' ? (
             <div 
                className={`w-full h-full rounded-xl shadow-inner border relative overflow-auto ${s.bg} ${s.border}`}
                onMouseMove={handleMouseMove}
                onClick={() => { setSelectedNodeId(null); setSelectedLinkIndex(null); }}
             >
             
             {/* Toolbar inside Canvas (Square Buttons) */}
             <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                 <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <SquareBtn onClick={createNewModel} title="New Model"><FilePlus size={18} /></SquareBtn>
                        <SquareBtn onClick={saveCurrentModel} title="Save Model"><Save size={18} /></SquareBtn>
                        <SquareBtn onClick={() => setIsLoadModalOpen(!isLoadModalOpen)} active={isLoadModalOpen} title="Load Model"><FolderOpen size={18} /></SquareBtn>
                    </div>
                    
                    {/* Saved Models Dropdown */}
                    {isLoadModalOpen && (
                        <div className={`absolute top-10 left-0 w-72 rounded-lg shadow-xl border z-50 overflow-hidden bg-white dark:bg-slate-800 ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                            <div className={`p-2 text-xs font-bold border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-gray-100 text-gray-500'}`}>Saved Models</div>
                            <div className="max-h-60 overflow-y-auto">
                                {savedModels.length === 0 ? (
                                    <div className="p-4 text-xs text-center opacity-50">No saved models</div>
                                ) : (
                                    savedModels.map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => loadModel(m)}
                                            className={`p-3 text-xs flex justify-between items-center cursor-pointer border-b last:border-0 ${isDark ? 'hover:bg-slate-700 text-slate-200 border-slate-700' : 'hover:bg-gray-50 text-slate-800 border-gray-50'}`}
                                        >
                                            <div className="truncate flex-1 pr-2">
                                                <div className="font-bold">{m.name}</div>
                                                <div className="text-[10px] opacity-60">{new Date(m.timestamp).toLocaleString()}</div>
                                            </div>
                                            <button 
                                                onClick={(e) => deleteSavedModel(m.id, e)} 
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                                                title="Delete File"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>

                 <div className={`h-px w-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

                 <div className="flex gap-2">
                    <SquareBtn onClick={autoLayout} title="Auto Layout (Magic Wand)" className="text-purple-500 border-purple-200 bg-purple-50 hover:bg-purple-100"><Wand2 size={18} /></SquareBtn>
                 </div>

                 <div className={`h-px w-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

                 <div className="flex gap-2">
                     <SquareBtn 
                        onClick={() => { setInteractionMode('move'); setLinkingSourceId(null); setTempLineEnd(null); }}
                        active={interactionMode === 'move'}
                        title="Move Mode"
                     >
                         <MousePointer2 size={18} />
                     </SquareBtn>
                     <SquareBtn 
                        onClick={() => { setInteractionMode('link'); setLinkingSourceId(null); }}
                        active={interactionMode === 'link'}
                        title="Link Mode"
                     >
                         <LinkIcon size={18} />
                     </SquareBtn>
                 </div>

                 {/* Link Type Selector */}
                 {interactionMode === 'link' && (
                     <div className={`p-1 rounded-lg border flex gap-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                         <button
                            onClick={() => setLinkType('directed')}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${linkType === 'directed' ? (isDark ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-50 text-cyan-700') : 'opacity-40 hover:opacity-100'}`}
                            title="Directed Arrow"
                         >
                            <LinkIcon size={14} />
                         </button>
                         <button
                            onClick={() => setLinkType('covariance')}
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${linkType === 'covariance' ? (isDark ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-50 text-cyan-700') : 'opacity-40 hover:opacity-100'}`}
                            title="Covariance"
                         >
                            <ArrowLeftRight size={14} />
                         </button>
                     </div>
                 )}

                 <div className={`h-px w-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                 
                 {/* Undo / Redo */}
                 <div className="flex gap-2">
                     <SquareBtn onClick={undo} disabled={historyIndex <= 0} title="Undo"><Undo2 size={18} /></SquareBtn>
                     <SquareBtn onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo"><Redo2 size={18} /></SquareBtn>
                 </div>

                 <div className={`h-px w-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

                 <SquareBtn 
                    onClick={handleDeleteSelected}
                    disabled={!selectedNodeId && selectedLinkIndex === null}
                    className={`${(selectedNodeId || selectedLinkIndex !== null) ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : ''}`}
                    title="Delete Selected"
                 >
                     <Trash2 size={18} />
                 </SquareBtn>
             </div>

             <svg className="w-full h-full pointer-events-none absolute top-0 left-0 z-0">
                <defs>
                   <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                     <polygon points="0 0, 10 3.5, 0 7" fill={isDark ? "#94a3b8" : "#64748b"} />
                   </marker>
                   <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                     <polygon points="10 0, 0 3.5, 10 7" fill={isDark ? "#94a3b8" : "#64748b"} />
                   </marker>
                   <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                     <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                   </marker>
                   <marker id="arrowhead-start-selected" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                     <polygon points="10 0, 0 3.5, 10 7" fill="#ef4444" />
                   </marker>
                </defs>
                {links.map((link, idx) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;
                    const isSelected = selectedLinkIndex === idx;
                    const color = isSelected ? '#ef4444' : (isDark ? "#94a3b8" : "#64748b");
                    
                    return (
                        <g key={idx} onClick={(e) => handleLinkClick(idx, e)} className="pointer-events-auto cursor-pointer">
                            <line 
                               x1={source.x + (source.type === 'latent' ? 50 : 60)} 
                               y1={source.y + 25} 
                               x2={target.x + (target.type === 'latent' ? 50 : 60)} 
                               y2={target.y + 25} 
                               stroke="transparent"
                               strokeWidth="15"
                            />
                            <line 
                               x1={source.x + (source.type === 'latent' ? 50 : 60)} 
                               y1={source.y + 25} 
                               x2={target.x + (target.type === 'latent' ? 50 : 60)} 
                               y2={target.y + 25} 
                               stroke={color} 
                               strokeWidth={isSelected ? "3" : "2"}
                               markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                               markerStart={link.type === 'covariance' ? (isSelected ? "url(#arrowhead-start-selected)" : "url(#arrowhead-start)") : undefined}
                               strokeDasharray={link.type === 'covariance' ? "5,5" : undefined}
                            />
                        </g>
                    )
                })}
                {linkingSourceId && tempLineEnd && (() => {
                    const source = nodes.find(n => n.id === linkingSourceId);
                    if (!source) return null;
                    return (
                        <line 
                           x1={source.x + (source.type === 'latent' ? 50 : 60)} 
                           y1={source.y + 25} 
                           x2={tempLineEnd.x} 
                           y2={tempLineEnd.y} 
                           stroke={isDark ? "#cbd5e1" : "#94a3b8"} 
                           strokeWidth="2"
                           strokeDasharray="5,5"
                        />
                    )
                })()}
             </svg>
             
             {nodes.map((node) => (
               <div
                 key={node.id}
                 onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                 className={`absolute flex items-center justify-center shadow-lg transition-all z-10 
                    ${interactionMode === 'move' ? 'cursor-move' : 'cursor-pointer'}
                    ${linkingSourceId === node.id ? 'ring-4 ring-yellow-400 scale-105' : ''}
                    ${selectedNodeId === node.id ? 'ring-2 ring-red-500' : ''}
                    ${node.type === 'latent' ? `${s.nodeLatent} w-[100px] h-[50px] rounded-full border-2 font-medium` : `${s.nodeObserved} w-[120px] h-[50px] rounded-sm border font-medium`}
                 `}
                 style={{ left: node.x, top: node.y }}
                 draggable={interactionMode === 'move'}
                 onDragEnd={(e) => {
                    if (interactionMode !== 'move') return;
                    const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
                    if(rect) {
                        const newX = e.clientX - rect.left - (node.type === 'latent' ? 50 : 60);
                        const newY = e.clientY - rect.top - 25;
                        setNodes(nodes.map(n => n.id === node.id ? {...n, x: newX, y: newY} : n));
                    }
                 }}
               >
                 <span className="text-xs truncate px-2 select-none">{node.label}</span>
               </div>
             ))}
           </div>
        ) : (
            <div className={`w-full h-full rounded-xl shadow-inner border overflow-auto p-4 flex justify-center ${s.bg} ${s.border}`}>
                <div className="mermaid" ref={mermaidRef}>
                    {mermaidSyntax}
                </div>
            </div>
        )}
      </div>

      <div className={`p-4 border-t space-y-2 ${s.bg} ${s.border}`}>
          <div className="flex gap-2 mb-2">
              <label className={`flex items-center gap-2 text-xs opacity-80`}>
                  <input type="radio" checked={nodeType === 'latent'} onChange={() => setNodeType('latent')} /> Latent (O)
              </label>
              <label className={`flex items-center gap-2 text-xs opacity-80`}>
                  <input type="radio" checked={nodeType === 'observed'} onChange={() => setNodeType('observed')} /> Observed ([])
              </label>
          </div>
          <div className="flex gap-2">
            <input 
                type="text" 
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="Variable Name..."
                className={`flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-slate-900'}`}
            />
            <button onClick={addNode} className={`px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${s.btnActive}`}>
                <PlusCircle size={16} /> Add
            </button>
          </div>
          <div className={`text-[10px] opacity-60`}>
              Select "Link Mode" to draw arrows. Use "Magic Wand" to auto-layout.
          </div>
      </div>
    </div>
  );
};

export default ModelPreview;
