import React, { useState } from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';
import { TrainInfo } from '../types/railway';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  train: TrainInfo;
  dateLabel: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  train,
  dateLabel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🚆 *${train.number} - ${train.name}*\n📅 Date: ${dateLabel}\n📍 Status: ${train.currentLocation.statusSummary}\n⚡ Speed: ${train.currentLocation.speedKmH} km/h\n⏱ Delay: ${train.currentLocation.delayMinutes === 0 ? 'On Time' : `${train.currentLocation.delayMinutes}m Late`}\n\nTrack live updates on RailLive App.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-slate-900 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Share Running Status</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
          {shareText}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsApp}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
