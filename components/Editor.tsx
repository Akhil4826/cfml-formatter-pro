
import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface EditorProps {
  title: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isReadOnly?: boolean;
  language: string;
}

const Editor: React.FC<EditorProps> = ({ title, value, onChange, isReadOnly = false, language }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <div className="flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-full">
      <div className="flex justify-between items-center bg-slate-700/50 px-4 py-2 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
        <div className="flex items-center gap-4">
          {isReadOnly && (
            <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Copy</span>
                </>
              )}
            </button>
          )}
          <span className="text-xs uppercase font-mono bg-slate-600 text-slate-300 px-2 py-0.5 rounded">{language}</span>
        </div>
      </div>
      <div className="flex-grow relative">
        <textarea
          value={value}
          onChange={onChange}
          readOnly={isReadOnly}
          spellCheck="false"
          className="w-full h-full p-4 bg-transparent text-slate-300 font-mono text-sm leading-6 resize-none focus:outline-none absolute top-0 left-0"
          aria-label={title}
        />
      </div>
    </div>
  );
};

export default Editor;
