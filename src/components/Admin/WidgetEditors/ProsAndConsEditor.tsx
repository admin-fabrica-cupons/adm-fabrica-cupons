import React from 'react';
import { ProsAndConsBlock } from '../../../types';
import { Check, X, Trash2, Plus } from 'lucide-react';
import { BiTrashAlt } from 'react-icons/bi';
import { RiPlayListAddLine } from 'react-icons/ri';
import InputWithClear from '../Util/InputWithClear';

interface ProsAndConsEditorProps {
  block: ProsAndConsBlock;
  onUpdate: (field: string, value: any) => void;
}

const ProsAndConsEditor: React.FC<ProsAndConsEditorProps> = ({ block, onUpdate }) => {
  const addPro = () => {
    const newPros = [...(block.pros || []), ''];
    onUpdate('pros', newPros);
  };

  const updatePro = (index: number, value: string) => {
    const newPros = [...(block.pros || [])];
    newPros[index] = value;
    onUpdate('pros', newPros);
  };

  const removePro = (index: number) => {
    const newPros = [...(block.pros || [])];
    newPros.splice(index, 1);
    onUpdate('pros', newPros);
  };

  const addCon = () => {
    const newCons = [...(block.cons || []), ''];
    onUpdate('cons', newCons);
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...(block.cons || [])];
    newCons[index] = value;
    onUpdate('cons', newCons);
  };

  const removeCon = (index: number) => {
    const newCons = [...(block.cons || [])];
    newCons.splice(index, 1);
    onUpdate('cons', newCons);
  };

  const sectionHeaderStyles = "flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 pb-2";
  const inputGroupStyles = "bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm";
  const inputStyles = "w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all dark:text-white text-sm";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
      {/* Prós */}
      <div className={inputGroupStyles}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <Check size={20} />
            <span>PONTOS POSITIVOS</span>
          </div>
          <button
            onClick={addPro}
            className="p-1.5 px-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-200 transition-colors"
          >
            <Plus size={14} />
            ADICIONAR
          </button>
        </div>

        <div className="space-y-3">
          {(block.pros || []).map((pro, index) => (
            <div key={index} className="flex gap-2 group">
              <InputWithClear
                type="text"
                value={pro}
                onChange={(e) => updatePro(index, e.target.value)}
                onClear={() => updatePro(index, '')}
                className={inputStyles}
                placeholder="Ex: Excelente autonomia de bateria"
              />
              <button
                onClick={() => removePro(index)}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <BiTrashAlt size={20} />
              </button>
            </div>
          ))}
          {(block.pros || []).length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Nenhum ponto positivo adicionado
            </div>
          )}
        </div>
      </div>

      {/* Contras */}
      <div className={inputGroupStyles}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <X size={20} />
            <span>PONTOS NEGATIVOS</span>
          </div>
          <button
            onClick={addCon}
            className="p-1.5 px-4 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-red-200 transition-colors"
          >
            <Plus size={14} />
            ADICIONAR
          </button>
        </div>

        <div className="space-y-3">
          {(block.cons || []).map((con, index) => (
            <div key={index} className="flex gap-2 group">
              <InputWithClear
                type="text"
                value={con}
                onChange={(e) => updateCon(index, e.target.value)}
                onClear={() => updateCon(index, '')}
                className={inputStyles}
                placeholder="Ex: Preço um pouco elevado"
              />
              <button
                onClick={() => removeCon(index)}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <BiTrashAlt size={20} />
              </button>
            </div>
          ))}
          {(block.cons || []).length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Nenhum ponto negativo adicionado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProsAndConsEditor;
