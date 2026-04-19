import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUpload,
  HiOutlineTable
} from 'react-icons/hi';
import { BiColumns, BiText, BiLayout, BiCheckShield } from 'react-icons/bi';
import { RiLayoutRowFill, RiLayoutRowLine, RiTable2, RiHeading } from 'react-icons/ri';
import { AiOutlineBorder } from 'react-icons/ai';
import InputWithClear from '../Util/InputWithClear';
import { TableBlock, TableRow } from '../../../types';

interface TableWidgetEditorProps {
  block: TableBlock;
  onUpdate: (field: string, value: any) => void;
}

const TableWidgetEditor: React.FC<TableWidgetEditorProps> = ({ block, onUpdate }) => {
  const rows = block.rows || [];
  const headers = block.headers || [];
  const caption = block.caption || '';
  const showBorders = block.showBorders !== false;
  const striped = block.striped || false;

  const [rowsCount, setRowsCount] = useState(rows.length || 3);
  const [colsCount, setColsCount] = useState(headers.length || rows[0]?.cells.length || 3);
  const [activeTab, setActiveTab] = useState('editor');
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonImport = () => {
    try {
      const json = JSON.parse(jsonInput);
      const data = json.data || json; // Support {data: ...} or raw
      
      // If it's already in table format (headers/rows)
      if (data.headers && data.rows && Array.isArray(data.rows) && data.rows[0]?.cells) {
        onUpdate('headers', data.headers);
        onUpdate('rows', data.rows);
        if (data.caption) onUpdate('caption', data.caption);
        setColsCount(data.headers.length);
        setRowsCount(data.rows.length);
        setShowJsonImport(false);
        setJsonInput('');
        return;
      }

      // Extract specifications from various possible locations
      const rawSpecs = data.specifications || data.highlightedSpecs || data.specs || data.rows;

      let specs: any[] = [];
      
      if (Array.isArray(rawSpecs)) {
        specs = rawSpecs;
      } else if (rawSpecs && typeof rawSpecs === 'object') {
        // Convert object to array
        specs = Object.entries(rawSpecs).map(([key, value]) => ({ propriedade: key, valor: value }));
      }
      
      if (!specs || specs.length === 0) {
        throw new Error('Não foram encontradas especificações (specifications, highlightedSpecs, specs ou rows)');
      }

      // Convert from specifications to rows and headers
      const newHeaders = ['Característica', 'Detalhe'];
      
      const newRows = specs.map((spec: any, idx: number) => {
        // Handle different formats
        // Format 1: { propriedade: "Tela", valor: "6.7" }
        // Format 2: { categoria: "...", propriedade: "...", valor: "..." }
        // Format 3: { name: "...", value: "..." }
        
        const prop = spec.propriedade || spec.categoria || spec.name || spec.key || spec.title || spec.label;
        const val = spec.valor || spec.value || spec.detail || spec.description;
        
        if (!prop || !val) return null;

        return {
          id: `row-${Date.now()}-${idx}`,
          cells: [
            { id: `c-${idx}-0`, content: String(prop), isHeader: false, imageSrc: '', imageAlt: '', alignX: 'left', alignY: 'middle' },
            { id: `c-${idx}-1`, content: String(val), isHeader: false, imageSrc: '', imageAlt: '', alignX: 'left', alignY: 'middle' }
          ]
        };
      }).filter(Boolean);

      if (newRows.length === 0) throw new Error('Nenhum dado válido encontrado para importação');

      onUpdate('headers', newHeaders);
      onUpdate('rows', newRows);
      onUpdate('caption', (data.title || data.productName) ? `Especificações: ${data.title || data.productName}` : 'Especificações Técnicas');
      
      setColsCount(2);
      setRowsCount(newRows.length);
      setShowJsonImport(false);
      setJsonInput('');
    } catch (e: any) {
      alert('Erro ao importar JSON: ' + e.message);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonInput(String(reader.result || ''));
    };
    reader.onerror = () => {
      alert('Erro ao ler arquivo');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const updateCell = (rowIndex: number, cellIndex: number, updates: Partial<TableRow['cells'][number]>) => {
    const newRows = [...rows];
    if (!newRows[rowIndex]) return;

    newRows[rowIndex].cells[cellIndex] = {
      ...newRows[rowIndex].cells[cellIndex],
      ...updates
    };
    onUpdate('rows', newRows);
  };

  const updateHeader = (index: number, content: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = content;
    onUpdate('headers', newHeaders);
  };

  const addRow = () => {
    const currentCols = headers.length || (rows[0]?.cells.length) || colsCount;
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      cells: Array(currentCols).fill(null).map((_, i) => ({
        id: `cell-${Date.now()}-${i}`,
        content: '',
        isHeader: false,
        imageSrc: '',
        imageAlt: '',
        alignX: 'left',
        alignY: 'middle'
      }))
    };
    onUpdate('rows', [...rows, newRow]);
  };

  const addColumn = () => {
    const newRows = rows.map(row => ({
      ...row,
      cells: [...row.cells, {
        id: `cell-${Date.now()}-${Math.random()}`,
        content: '',
        isHeader: false,
        imageSrc: '',
        imageAlt: '',
        alignX: 'left',
        alignY: 'middle'
      }]
    }));
    onUpdate('rows', newRows);
    onUpdate('headers', [...headers, '']);
  };

  const deleteRow = (rowIndex: number) => {
    onUpdate('rows', rows.filter((_, i) => i !== rowIndex));
  };

  const deleteColumn = (colIndex: number) => {
    const newRows = rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== colIndex)
    }));
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    onUpdate('rows', newRows);
    onUpdate('headers', newHeaders);
  };

  const initializeTable = () => {
    const newRows = Array(rowsCount).fill(null).map((_, rowIndex) => ({
      id: `row-${rowIndex}-${Date.now()}`,
      cells: Array(colsCount).fill(null).map((_, cellIndex) => ({
        id: `cell-${rowIndex}-${cellIndex}-${Date.now()}`,
        content: '',
        isHeader: rowIndex === 0,
        imageSrc: '',
        imageAlt: '',
        alignX: 'left',
        alignY: 'middle'
      }))
    }));
    onUpdate('rows', newRows);
    onUpdate('headers', Array(colsCount).fill(''));
  };

  const toggleHeader = (rowIndex: number, cellIndex: number) => {
    const cell = rows[rowIndex]?.cells[cellIndex];
    if (!cell) return;
    updateCell(rowIndex, cellIndex, { isHeader: !cell.isHeader });
  };

  const importFromJson = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      if (!parsedData.headers || !parsedData.rows) {
        alert('JSON inválido. Deve conter "headers" (array) e "rows" (array).');
        return;
      }

      // Validate headers
      if (!Array.isArray(parsedData.headers)) {
        alert('"headers" deve ser um array.');
        return;
      }

      // Validate rows
      if (!Array.isArray(parsedData.rows)) {
        alert('"rows" deve ser um array.');
        return;
      }

      // Validate each row has cells array
      for (let i = 0; i < parsedData.rows.length; i++) {
        if (!parsedData.rows[i].cells || !Array.isArray(parsedData.rows[i].cells)) {
          alert(`Linha ${i + 1} deve conter "cells" (array).`);
          return;
        }
        
        // Validate cell count matches header count
        if (parsedData.rows[i].cells.length !== parsedData.headers.length) {
          alert(`Linha ${i + 1} deve ter ${parsedData.headers.length} células (igual ao número de headers).`);
          return;
        }
      }

      // Convert to internal format
      const newRows: TableRow[] = parsedData.rows.map((row: any, index: number) => ({
        id: `row-${index}-${Date.now()}`,
        cells: row.cells.map((cell: any, cellIndex: number) => ({
          id: `cell-${index}-${cellIndex}-${Date.now()}`,
          content: cell.content || cell.toString(),
          isHeader: cell.isHeader || false,
          imageSrc: cell.imageSrc || '',
          imageAlt: cell.imageAlt || '',
          alignX: cell.alignX || 'left',
          alignY: cell.alignY || 'middle'
        }))
      }));

      // Update the block
      onUpdate('headers', parsedData.headers);
      onUpdate('rows', newRows);
      
      // Close dialog and reset
      setShowJsonImport(false);
      setJsonInput('');
      
      alert('Tabela importada com sucesso!');
    } catch (error) {
      alert('Erro ao importar JSON: ' + (error as Error).message);
    }
  };

  const exportToJson = () => {
    const exportData = {
      headers: headers,
      rows: rows.map(row => ({
        cells: row.cells.map(cell => ({
          content: cell.content,
          isHeader: cell.isHeader,
          imageSrc: cell.imageSrc,
          imageAlt: cell.imageAlt,
          alignX: cell.alignX,
          alignY: cell.alignY
        }))
      }))
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabela.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sectionHeaderStyles = "flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2";
  const inputGroupStyles = "bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm";
  const inputLabelStyles = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider";
  const inputStyles = "w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white text-sm hover:border-gray-300 dark:hover:border-slate-600";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full overflow-hidden">
      {/* Header e Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
            <RiTable2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Editor DataGrid</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ESTRUTURAÇÃO DE DADOS TABULARES</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <HiOutlineTable size={18} /> EDITOR
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <HiOutlineEye size={18} /> PRÉVIA
          </button>
        </div>
      </div>

      {/* Configurações Iniciais / Setup */}
      {rows.length === 0 && (
        <div className={`${inputGroupStyles} bg-gradient-to-br from-blue-500/5 to-indigo-500/5`}>
          <div className={sectionHeaderStyles}>
            <HiOutlineCog size={20} className="text-blue-500" />
            <span>Configuração da Nova Tabela</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className={inputLabelStyles}>Colunas Iniciais</label>
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-1">
                <button onClick={() => setColsCount(Math.max(1, colsCount - 1))} className="p-3 text-slate-400 hover:text-blue-500 transition-colors"><HiOutlineChevronLeft size={20} /></button>
                <p className="flex-1 text-center font-black dark:text-white text-lg">{colsCount}</p>
                <button onClick={() => setColsCount(colsCount + 1)} className="p-3 text-slate-400 hover:text-blue-500 transition-colors"><HiOutlineChevronRight size={20} /></button>
              </div>
            </div>

            <div className="space-y-3">
              <label className={inputLabelStyles}>Linhas Iniciais</label>
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-1">
                <button onClick={() => setRowsCount(Math.max(1, rowsCount - 1))} className="p-3 text-slate-400 hover:text-blue-500 transition-colors"><HiOutlineChevronLeft size={20} /></button>
                <p className="flex-1 text-center font-black dark:text-white text-lg">{rowsCount}</p>
                <button onClick={() => setRowsCount(rowsCount + 1)} className="p-3 text-slate-400 hover:text-blue-500 transition-colors"><HiOutlineChevronRight size={20} /></button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={initializeTable}
                className="w-full h-[62px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <HiOutlinePlus size={20} />
                GERAR GRADE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Ativado */}
      {rows.length > 0 && activeTab === 'editor' && (
        <div className="space-y-8">
          {/* Barra de Ferramentas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all">
                <RiLayoutRowLine size={16} /> ADICIONAR LINHA
              </button>
              <button onClick={addColumn} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all">
                <BiColumns size={16} /> ADICIONAR COLUNA
              </button>
              <button onClick={() => setShowJsonImport(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-700 text-xs font-bold transition-all">
                <HiOutlineUpload size={16} /> IMPORTAR JSON
              </button>
              <button onClick={exportToJson} className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-700 text-xs font-bold transition-all">
                <HiOutlineUpload size={16} className="rotate-180" /> EXPORTAR JSON
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={() => onUpdate('showBorders', !showBorders)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${showBorders ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-400'}`}
              >
                <AiOutlineBorder size={18} />
                <span className="text-[9px] font-black uppercase">BORDER</span>
              </button>
              <button
                onClick={() => onUpdate('striped', !striped)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all ${striped ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-400'}`}
              >
                <RiLayoutRowFill size={18} />
                <span className="text-[9px] font-black uppercase">ZEBRA</span>
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className={inputLabelStyles}>Legenda / Título</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none z-10"><BiText size={18} /></div>
                <InputWithClear
                  type="text"
                  value={caption}
                  onChange={(e) => onUpdate('caption', e.target.value)}
                  onClear={() => onUpdate('caption', '')}
                  className={`${inputStyles} pl-10`}
                  placeholder="Título da Tabela..."
                />
              </div>
            </div>
          </div>

          {/* Área da Grade */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80">
                    {headers.map((header, colIndex) => (
                      <th key={colIndex} className="p-4 border-b border-r border-slate-100 dark:border-slate-800 min-w-[200px] group">
                        <div className="flex items-center gap-2">
                          <InputWithClear
                            type="text"
                            value={header}
                            onChange={(e) => updateHeader(colIndex, e.target.value)}
                            onClear={() => updateHeader(colIndex, '')}
                            className="bg-transparent text-sm font-black dark:text-white outline-none w-full placeholder:text-slate-300"
                            placeholder={`COLUNA ${colIndex + 1}`}
                          />
                          <button
                            onClick={() => deleteColumn(colIndex)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="w-20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-black text-slate-400 p-4">DEL</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                      {row.cells.map((cell, cellIndex) => (
                        <td key={cell.id} className={`p-4 border-b border-r border-slate-100 dark:border-slate-800 ${cell.isHeader ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                          <InputWithClear
                            as="textarea"
                            value={cell.content}
                            onChange={(e) => updateCell(rowIndex, cellIndex, { content: e.target.value })}
                            onClear={() => updateCell(rowIndex, cellIndex, { content: '' })}
                            className={`w-full bg-transparent text-sm resize-none outline-none min-h-[60px] dark:text-slate-200 transition-all ${cell.isHeader ? 'font-black' : ''}`}
                            placeholder="Conteúdo..."
                          />
                          <div className="mt-3 space-y-2">
                            <InputWithClear
                              type="text"
                              value={cell.imageSrc || ''}
                              onChange={(e) => updateCell(rowIndex, cellIndex, { imageSrc: e.target.value })}
                              onClear={() => updateCell(rowIndex, cellIndex, { imageSrc: '' })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="URL da imagem (opcional)"
                            />
                            <InputWithClear
                              type="text"
                              value={cell.imageAlt || ''}
                              onChange={(e) => updateCell(rowIndex, cellIndex, { imageAlt: e.target.value })}
                              onClear={() => updateCell(rowIndex, cellIndex, { imageAlt: '' })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Descrição da imagem"
                            />
                            <div className="flex gap-2">
                              <select
                                value={cell.alignX || 'left'}
                                onChange={(e) => updateCell(rowIndex, cellIndex, { alignX: e.target.value as any })}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              >
                                <option value="left">Alinhar à esquerda</option>
                                <option value="center">Centralizar</option>
                                <option value="right">Alinhar à direita</option>
                              </select>
                              <select
                                value={cell.alignY || 'middle'}
                                onChange={(e) => updateCell(rowIndex, cellIndex, { alignY: e.target.value as any })}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              >
                                <option value="top">Alinhar ao topo</option>
                                <option value="middle">Centralizar vertical</option>
                                <option value="bottom">Alinhar ao rodapé</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                              type="button"
                              onClick={() => toggleHeader(rowIndex, cellIndex)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${cell.isHeader
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                              <RiHeading size={12} /> {cell.isHeader ? 'CABEÇALHO' : 'TORNAR HEAD'}
                            </button>
                            <span className="text-[9px] font-black text-slate-300">L{rowIndex + 1} C{cellIndex + 1}</span>
                          </div>
                        </td>
                      ))}
                      <td className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center">
                        <button
                          type="button"
                          onClick={() => deleteRow(rowIndex)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        >
                          <HiOutlineTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {rows.length > 0 && activeTab === 'preview' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><HiOutlineEye size={20} /></div>
            <p className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">Visualização Final do Conteúdo</p>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-x-auto">
            <div className={`${showBorders ? 'border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden' : ''}`}>
              <table className="w-full">
                {caption && (
                  <caption className="p-5 font-black text-slate-800 dark:text-white text-lg bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                    {caption}
                  </caption>
                )}
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className={`p-4 text-left text-sm font-black uppercase tracking-wider dark:text-white ${showBorders ? 'border border-slate-200 dark:border-slate-800' : ''} bg-slate-50 dark:bg-slate-800/50`}>
                        {h || `-`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={row.id} className={`${striped && rIdx % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/20' : ''}`}>
                      {row.cells.map((cell, cIdx) => {
                        const alignX = cell.alignX || 'left';
                        const alignY = cell.alignY || 'middle';
                        const alignXClass = alignX === 'center' ? 'items-center text-center' : alignX === 'right' ? 'items-end text-right' : 'items-start text-left';
                        const alignYClass = alignY === 'top' ? 'justify-start' : alignY === 'bottom' ? 'justify-end' : 'justify-center';
                        return (
                          <td
                            key={cell.id}
                            className={`p-4 text-sm dark:text-slate-300 ${showBorders ? 'border border-slate-200 dark:border-slate-800' : ''} ${cell.isHeader ? 'font-black bg-slate-50/50 dark:bg-slate-800/10' : ''}`}
                          >
                            <div className={`flex flex-col gap-2 ${alignXClass} ${alignYClass}`}>
                              {cell.imageSrc && (
                                <Image
                                  src={cell.imageSrc}
                                  alt={cell.imageAlt || ''}
                                  width={240}
                                  height={160}
                                  sizes="100vw"
                                  className="max-w-full h-auto rounded-lg"
                                />
                              )}
                              <span>{cell.content || '-'}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> CABEÇALHOS</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div> DADOS COMUNS</span>
              </div>
              <span>{rows.length} LINHAS × {headers.length} COLUNAS</span>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import Dialog */}
      {showJsonImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
                    <HiOutlineUpload size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Importar Tabela via JSON</h3>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Suporta especificações de produto</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <HiOutlineTrash size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                JSON (Produto ou Tabela)
              </label>
              <div className="flex justify-end mb-2">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <HiOutlineUpload size={14} /> Carregar Arquivo
                </button>
              </div>
              <InputWithClear
                as="textarea"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  onClear={() => setJsonInput('')}
                  className="w-full h-64 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600 focus:ring-offset-0 transition-all text-sm font-mono dark:text-white"
                  placeholder='Cole aqui o JSON do produto (com specifications/highlightedSpecs) ou a estrutura de tabela.'
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleJsonImport}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <HiOutlineUpload size={18} />
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
};

export default TableWidgetEditor;
