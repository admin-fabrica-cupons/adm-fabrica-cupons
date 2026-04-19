'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function GoBackButton() {
  return (
    <button 
      onClick={() => window.history.back()}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95"
    >
      <ArrowLeft size={20} />
      Voltar
    </button>
  );
}
