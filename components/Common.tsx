// components/Common.tsx
import React from 'react';
import { Box, Gift, AlertCircle, AlertTriangle } from 'lucide-react';

// 荷姿バッジ
export const PackagingBadge = ({ type }: { type: string | undefined }) => {
  if (type === '箱入') {
    return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200"><Box size={10} /> 箱入</span>;
  }
  if (type === 'セット') {
    return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200"><Gift size={10} /> セット</span>;
  }
  return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">バラ</span>;
};

// 確認・アラートダイアログ
type DialogConfig = {
  isOpen: boolean;
  type: 'CONFIRM' | 'ALERT';
  title: string;
  message: string;
  onConfirm?: () => void;
};

interface CustomDialogProps {
  config: DialogConfig;
  onClose: () => void;
  onConfirm: () => void;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({ config, onClose, onConfirm }) => {
  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{zIndex: 9999}}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className={`px-6 py-4 flex items-center gap-2 text-white ${config.type === 'CONFIRM' ? 'bg-indigo-600' : 'bg-red-500'}`}>
          {config.type === 'CONFIRM' ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
          <h2 className="font-bold text-lg">{config.title}</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{config.message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              {config.type === 'CONFIRM' ? 'キャンセル' : '閉じる'}
            </button>
            {config.type === 'CONFIRM' && (
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md"
              >
                実行する
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};