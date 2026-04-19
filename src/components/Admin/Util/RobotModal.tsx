import React from 'react';
import { RiRobot3Fill } from 'react-icons/ri';

interface RobotModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const RobotModal: React.FC<RobotModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ok',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel || onConfirm} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-700/60 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-rose-600 to-purple-700 px-6 py-5 text-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
              <RiRobot3Fill size={22} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/90">Lu</span>
          </div>
          {title && (
            <h3 className="mt-3 text-center text-lg font-bold text-white">{title}</h3>
          )}
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600 dark:text-slate-300 font-medium">{message}</p>
          <div className={`mt-6 flex ${showCancel ? 'gap-3' : 'justify-center'}`}>
            {showCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`${showCancel ? 'flex-1' : ''} px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-rose-600 to-purple-700 text-white font-semibold shadow hover:opacity-95 transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotModal;
