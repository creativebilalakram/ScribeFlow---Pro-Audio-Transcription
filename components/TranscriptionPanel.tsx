import React, { useState } from 'react';
import { TranscriptionResult } from '../types.ts';
import { translateText } from '../services/geminiService.ts';

interface Props {
  result: TranscriptionResult;
  onClose: () => void;
}

const TranscriptionPanel: React.FC<Props> = ({ result, onClose }) => {
  const [editableText, setEditableText] = useState(result.text);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 reveal">
      <div className="flex justify-between items-center bg-white p-7 border border-zinc-100 rounded-3xl shadow-sm">
        <h3 className="text-lg font-black">{result.fileName}</h3>
        <div className="flex gap-3">
          <button onClick={() => navigator.clipboard.writeText(editableText)} className="px-6 py-3 bg-zinc-50 rounded-2xl font-black text-[12px] uppercase">Copy</button>
          <button onClick={onClose} className="px-6 py-3 bg-zinc-950 text-white rounded-2xl font-black text-[12px] uppercase">Return</button>
        </div>
      </div>
      <div className="premium-container active">
        <div className="inner-content p-2 bg-zinc-50/30">
          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="w-full h-[600px] p-12 bg-white rounded-[44px] text-lg leading-loose font-medium focus:outline-none resize-none border-none shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;