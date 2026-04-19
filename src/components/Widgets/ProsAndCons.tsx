import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { ProsAndConsBlock } from '../../types';
import { IoClose } from 'react-icons/io5';

interface ProsAndConsProps {
  data: ProsAndConsBlock;
}

const ProsAndCons: React.FC<ProsAndConsProps> = ({ data }) => {
  const hasPros = data.pros && data.pros.some(p => p.trim() !== '');
  const hasCons = data.cons && data.cons.some(c => c.trim() !== '');

  if (!hasPros && !hasCons) return null;

  return (
    <div className="not-prose rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5 md:p-6">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Pontos positivos
          </h3>
          <div className="mt-3 space-y-3">
            {data.pros?.filter(pro => pro.trim() !== '').map((pro, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/20 px-4 py-3">
                <FaCheck className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={14} />
                <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{pro}</span>
              </div>
            ))}
            {!hasPros && (
              <div className="text-sm text-slate-400 italic">
                Nenhum ponto positivo destacado.
              </div>
            )}
          </div>
        </div>
        <div className="p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 md:border-t-0 md:border-l">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            Pontos a se considerar
          </h3>
          <div className="mt-3 space-y-3">
            {data.cons?.filter(con => con.trim() !== '').map((con, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-50/70 dark:bg-amber-900/20 px-4 py-3">
                <IoClose className="mt-0.5 text-amber-600 dark:text-amber-400" size={16} />
                <span className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{con}</span>
              </div>
            ))}
            {!hasCons && (
              <div className="text-sm text-slate-400 italic">
                Nenhum ponto negativo destacado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsAndCons;
