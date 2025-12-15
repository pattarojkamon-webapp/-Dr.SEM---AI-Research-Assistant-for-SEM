import React, { useState, useEffect, useRef } from 'react';
import { Node, Link } from '../types';
import { PlusCircle, Link as LinkIcon, MousePointer2, Trash2, Undo2, ArrowLeftRight } from 'lucide-react';
import mermaid from 'mermaid';

interface ModelPreviewProps {
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    links: Link[];
    setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
    isDarkMode: boolean;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({ nodes, setNodes, links, setLinks, isDarkMode }) => {
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState<'latent' | 'observed'>('latent');
  const [mermaidSyntax, setMermaidSyntax] = useState('');
  const [viewMode, setViewMode] = useState<'canvas' | 'mermaid'>('canvas');
  const [interactionMode, setInteractionMode] = useState<'move' | 'link'>('move');
  const [linkType, setLinkType] = useState<'directed' | 'covariance'>('directed');
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [tempLineEnd, setTempLineEnd] = useState<{x: number, y: number} | null>(null);
  
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: isDarkMode ? 'dark' : 'default', securityLevel: 'loose' });
  }, [isDarkMode]);

  useEffect(() => {
    // Auto-generate mermaid syntax when nodes/links change
    let syntax = 'graph LR\n';
    
    // Define styles
    if (isDarkMode) {
        syntax += 'classDef latent fill:#1e293b,stroke:#e2e8f0,stroke-width:2px,rx:50,ry:50,color:#fff;\n';
        syntax += 'classDef observed fill:#0f172a,stroke:#06b6d4,stroke-width:1px,rx:0,ry:0,color:#fff;\n';
    } else {
        syntax += 'classDef latent fill:#fff,stroke:#333,stroke-width:2px,rx:50,ry:50;\n';
        syntax += 'classDef observed fill:#f0f9ff,stroke:#0891b2,stroke-width:1px,rx:0,ry:0;\n';
    }

    nodes.forEach(node => {
        // Sanitize label
        const safeLabel = node.label.replace(/\s/g, '_');
        const shape = node.type === 'latent' ? `((${safeLabel}))` : `[${safeLabel}]`;
        syntax += `${node.id}${shape}:::${node.type}\n`;
    });

    links.forEach(link => {
        const arrow = link.type === 'covariance' ? '<-->' : '-->';
        syntax += `${link.source} ${arrow} ${link.target}\n`;
    });

    setMermaidSyntax(syntax);
  }, [nodes, links, isDarkMode]);

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
              setLinkingSourceId(null); // Cancel
              setTempLineEnd(null);
          } else {
              // Create Link
              if (linkingSourceId !== id) { // Prevent self-loop
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
      }
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

  const removeLastLink = () => {
      if (links.length > 0) {
          setLinks(links.slice(0, -1));
      }
  };

  const clearAllLinks = () => {
      if (window.confirm("Are you sure you want to remove all links?")) {
          setLinks([]);
      }
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div>
            <h3 className={`text-lg font-bold font-serif ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Research Canvas</h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Conceptual & Structural Model</p>
        </div>
        <div className={`flex rounded p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
             <button 
                onClick={() => setViewMode('canvas')} 
                className={`px-2 py-1 text-xs rounded transition-all ${viewMode === 'canvas' ? (isDarkMode ? 'bg-slate-700 text-cyan-400 shadow' : 'bg-white shadow text-cyan-700') : (isDarkMode ? 'text-slate-400' : 'text-gray-500')}`}
             >
                 Interactive
             </button>
             <button 
                onClick={() => setViewMode('mermaid')} 
                className={`px-2 py-1 text-xs rounded transition-all ${viewMode === 'mermaid' ? (isDarkMode ? 'bg-slate-700 text-cyan-400 shadow' : 'bg-white shadow text-cyan-700') : (isDarkMode ? 'text-slate-400' : 'text-gray-500')}`}
             >
                 Mermaid Render
             </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        {viewMode === 'canvas' ? (
             <div 
                className={`w-full h-full rounded-xl shadow-inner border relative overflow-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}
                onMouseMove={handleMouseMove}
             >
             
             {/* Mode Toggle inside Canvas */}
             <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                 <button 
                    onClick={() => { setInteractionMode('move'); setLinkingSourceId(null); setTempLineEnd(null); }}
                    className={`p-2 rounded-lg shadow-sm border ${interactionMode === 'move' ? (isDarkMode ? 'bg-cyan-900 border-cyan-700 text-cyan-100' : 'bg-cyan-50 border-cyan-200 text-cyan-700') : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-500')}`}
                    title="Move Mode"
                 >
                     <MousePointer2 size={18} />
                 </button>
                 <button 
                    onClick={() => { setInteractionMode('link'); setLinkingSourceId(null); }}
                    className={`p-2 rounded-lg shadow-sm border ${interactionMode === 'link' ? (isDarkMode ? 'bg-cyan-900 border-cyan-700 text-cyan-100' : 'bg-cyan-50 border-cyan-200 text-cyan-700') : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-500')}`}
                    title="Link Mode"
                 >
                     <LinkIcon size={18} />
                 </button>

                 {/* Link Type Selector */}
                 {interactionMode === 'link' && (
                     <div className={`p-1 rounded-lg border flex flex-col gap-1 mt-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                         <button
                            onClick={() => setLinkType('directed')}
                            className={`p-1.5 rounded text-xs ${linkType === 'directed' ? (isDarkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-50 text-cyan-700') : (isDarkMode ? 'text-slate-400' : 'text-gray-500')}`}
                            title="Directed Arrow (Path)"
                         >
                            <LinkIcon size={14} />
                         </button>
                         <button
                            onClick={() => setLinkType('covariance')}
                            className={`p-1.5 rounded text-xs ${linkType === 'covariance' ? (isDarkMode ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-50 text-cyan-700') : (isDarkMode ? 'text-slate-400' : 'text-gray-500')}`}
                            title="Covariance (Double Arrow)"
                         >
                            <ArrowLeftRight size={14} />
                         </button>
                     </div>
                 )}

                 <div className="h-px bg-gray-300 dark:bg-slate-700 my-1"></div>
                 <button 
                    onClick={removeLastLink}
                    disabled={links.length === 0}
                    className={`p-2 rounded-lg shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-slate-900'} disabled:opacity-50`}
                    title="Undo Last Link"
                 >
                     <Undo2 size={18} />
                 </button>
                 <button 
                    onClick={clearAllLinks}
                    disabled={links.length === 0}
                    className={`p-2 rounded-lg shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-red-400' : 'bg-white border-gray-200 text-gray-500 hover:text-red-600'} disabled:opacity-50`}
                    title="Clear All Links"
                 >
                     <Trash2 size={18} />
                 </button>
             </div>

             <svg className="w-full h-full pointer-events-none absolute top-0 left-0 z-0">
                <defs>
                   <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                     <polygon points="0 0, 10 3.5, 0 7" fill={isDarkMode ? "#94a3b8" : "#64748b"} />
                   </marker>
                   <marker id="arrowhead-start" markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                     <polygon points="10 0, 0 3.5, 10 7" fill={isDarkMode ? "#94a3b8" : "#64748b"} />
                   </marker>
                </defs>
                {links.map((link, idx) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;
                    return (
                        <line 
                           key={idx}
                           x1={source.x + (source.type === 'latent' ? 50 : 60)} 
                           y1={source.y + 25} 
                           x2={target.x + (target.type === 'latent' ? 50 : 60)} 
                           y2={target.y + 25} 
                           stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                           strokeWidth="2"
                           markerEnd="url(#arrowhead)"
                           markerStart={link.type === 'covariance' ? "url(#arrowhead-start)" : undefined}
                           strokeDasharray={link.type === 'covariance' ? "5,5" : undefined}
                        />
                    )
                })}
                {/* Visual feedback line during linking */}
                {linkingSourceId && tempLineEnd && (() => {
                    const source = nodes.find(n => n.id === linkingSourceId);
                    if (!source) return null;
                    return (
                        <line 
                           x1={source.x + (source.type === 'latent' ? 50 : 60)} 
                           y1={source.y + 25} 
                           x2={tempLineEnd.x} 
                           y2={tempLineEnd.y} 
                           stroke={isDarkMode ? "#cbd5e1" : "#94a3b8"} 
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
                    ${node.type === 'latent' 
                        ? (isDarkMode ? 'w-[100px] h-[50px] rounded-full border-2 border-slate-400 bg-slate-800 text-slate-100 font-medium' : 'w-[100px] h-[50px] rounded-full border-2 border-slate-800 bg-white text-slate-800 font-medium') 
                        : (isDarkMode ? 'w-[120px] h-[50px] rounded-sm border border-cyan-500 bg-slate-900 text-cyan-300 font-medium' : 'w-[120px] h-[50px] rounded-sm border border-cyan-600 bg-cyan-50 text-slate-800 font-medium')
                    }
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
            <div className={`w-full h-full rounded-xl shadow-inner border overflow-auto p-4 flex justify-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                <div className="mermaid" ref={mermaidRef}>
                    {mermaidSyntax}
                </div>
            </div>
        )}
      </div>

      <div className={`p-4 border-t space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex gap-2 mb-2">
              <label className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input type="radio" checked={nodeType === 'latent'} onChange={() => setNodeType('latent')} /> Latent (O)
              </label>
              <label className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input type="radio" checked={nodeType === 'observed'} onChange={() => setNodeType('observed')} /> Observed ([])
              </label>
          </div>
          <div className="flex gap-2">
            <input 
                type="text" 
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="Variable Name..."
                className={`flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'}`}
            />
            <button 
                onClick={addNode}
                className={`px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${isDarkMode ? 'bg-cyan-700 text-white hover:bg-cyan-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
                <PlusCircle size={16} /> Add
            </button>
          </div>
          <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
              Select "Link Mode" to draw arrows. Drag nodes to rearrange.
          </div>
      </div>
    </div>
  );
};

export default ModelPreview;