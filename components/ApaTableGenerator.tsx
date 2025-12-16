import React, { useState } from 'react';
import { Copy, FileDown, Check, Eye, EyeOff } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ApaTableGeneratorProps {
    isDarkMode: boolean;
}

const ApaTableGenerator: React.FC<ApaTableGeneratorProps> = ({ isDarkMode }) => {
  const [dataText, setDataText] = useState(
`Latent Variable, Cronbach Alpha, CR, AVE
Leadership, 0.85, 0.88, 0.62
Infrastructure, 0.78, 0.81, 0.54
Quality, 0.91, 0.93, 0.70`
  );
  
  // Split title state for APA 7th compliance
  const [tableNum, setTableNum] = useState('Table 1');
  const [tableTitle, setTableTitle] = useState('Reliability and Validity Analysis');
  
  const [note, setNote] = useState('Note. CR = Composite Reliability; AVE = Average Variance Extracted.');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const rows = dataText.trim().split('\n').map(r => r.split(',').map(c => c.trim()));
  const allHeaders = rows[0] || [];
  const allBody = rows.slice(1);

  const getVisibleData = () => {
       const indices = allHeaders.map((h, i) => hiddenColumns.includes(h) ? -1 : i).filter(i => i !== -1);
       const h = allHeaders.filter((_, i) => indices.includes(i));
       const b = allBody.map(row => row.filter((_, i) => indices.includes(i)));
       return { h, b };
  };

  const { h: header, b: body } = getVisibleData();

  const toggleColumn = (col: string) => {
      setHiddenColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const handleCopyMarkdown = () => {
    // APA 7th Markdown: Bold Table Num, Italic Title, Newline between
    let mdTable = `**${tableNum}**  \n*${tableTitle}*\n\n`;
    mdTable += `| ${header.join(' | ')} |\n`;
    mdTable += `| ${header.map(() => '---').join(' | ')} |\n`;
    body.forEach(row => {
        mdTable += `| ${row.join(' | ')} |\n`;
    });
    mdTable += `\n*${note}*`;

    navigator.clipboard.writeText(mdTable);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Table Number (Bold)
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(tableNum, 14, 15);
    
    // Table Title (Italic, below number)
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.text(tableTitle, 14, 22);

    // Table
    autoTable(doc, {
        head: [header],
        body: body,
        startY: 28,
        theme: 'plain',
        styles: { font: "times", fontSize: 10, cellPadding: 2, lineColor: 0, lineWidth: 0 },
        headStyles: { fontStyle: 'bold', borderBottomWidth: 1.5, borderColor: 0 }, // Thick bottom border for header
        margin: { top: 20 },
        didParseCell: (data) => {
           // APA style usually has horizontal lines only at top, bottom of header, and bottom of table
           if (data.row.index === body.length - 1) {
               data.cell.styles.borderBottomWidth = 1;
               data.cell.styles.borderColor = 0;
           }
        }
    });

    // Note
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    const splitNote = doc.splitTextToSize(note, 180);
    doc.text(splitNote, 14, finalY + 5);

    doc.save(`${tableNum.replace(/\s/g, '_')}_APA.pdf`);
  };

  const inputClass = isDarkMode
    ? "w-full p-2 border border-slate-600 bg-slate-800 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400"
    : "w-full p-2 border border-gray-300 bg-white text-slate-900 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400";

  const labelClass = `block text-xs font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`;

  return (
    <div className={`p-6 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="mb-6">
        <h3 className={`text-xl font-bold font-serif mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>APA Table Generator</h3>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Configure and export your statistical tables (APA 7th).</p>
      </div>

      <div className="space-y-4 mb-6">
          <div className="flex gap-4">
              <div className="w-1/3">
                <label className={labelClass}>Table Number</label>
                <input 
                    type="text"
                    value={tableNum}
                    onChange={e => setTableNum(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Table 1"
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Table Title</label>
                <input 
                    type="text"
                    value={tableTitle}
                    onChange={e => setTableTitle(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Means, Standard Deviations, and Correlations"
                />
              </div>
          </div>

          <div>
            <label className={labelClass}>CSV Data Input</label>
            <textarea
                value={dataText}
                onChange={(e) => setDataText(e.target.value)}
                className={`${inputClass} h-24 font-mono`}
            />
          </div>
          
          {/* Column Selection */}
          <div>
             <label className={labelClass}>Select Columns to Include</label>
             <div className="flex flex-wrap gap-2">
                 {allHeaders.map((col, idx) => (
                     <button
                        key={idx}
                        onClick={() => toggleColumn(col)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors ${
                            hiddenColumns.includes(col)
                             ? (isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-400')
                             : (isDarkMode ? 'bg-cyan-900/30 border-cyan-700 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-700')
                        }`}
                     >
                         {hiddenColumns.includes(col) ? <EyeOff size={12} /> : <Eye size={12} />}
                         {col}
                     </button>
                 ))}
             </div>
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <input 
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className={inputClass}
            />
          </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
            onClick={handleCopyMarkdown}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded text-sm transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'}`}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied MD' : 'Copy Markdown'}
        </button>
        <button 
            onClick={handleExportPDF}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white text-sm rounded transition-colors shadow-sm ${isDarkMode ? 'bg-cyan-700 hover:bg-cyan-600' : 'bg-slate-900 hover:bg-slate-800'}`}
        >
            <FileDown size={16} />
            Export PDF
        </button>
      </div>
      
      {/* Preview */}
      <div className={`p-6 border shadow-sm rounded-lg min-h-[200px] overflow-x-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
         <div className={`font-serif mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
            <div className="font-bold">{tableNum}</div>
            <div className="italic">{tableTitle}</div>
         </div>
         <table className="w-full text-left border-collapse mb-2 min-w-full">
            <thead>
                <tr>
                    {header.map((head, i) => (
                        <th key={i} className={`py-1 px-2 border-b-2 font-semibold text-sm whitespace-nowrap ${isDarkMode ? 'border-slate-500 text-slate-200' : 'border-black text-slate-900'}`}>
                            {head}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {body.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j} className={`py-1 px-2 text-sm whitespace-nowrap ${isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-gray-100'} border-b ${i === body.length - 1 ? (isDarkMode ? 'border-b-slate-500' : 'border-b-black') : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
         </table>
         <div className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{note}</div>
      </div>
    </div>
  );
};

export default ApaTableGenerator;