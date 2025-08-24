
import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import ConfigPanel from './components/ConfigPanel';
import { DEFAULT_CFML_CODE, DEFAULT_OPTIONS } from './constants';
import { type FormatOptions } from './types';
import { formatCfml } from './services/formatter';
import { SparklesIcon, ExclamationTriangleIcon } from './components/Icons';

const App: React.FC = () => {
  const [options, setOptions] = useState<FormatOptions>(DEFAULT_OPTIONS);
  const [inputCode, setInputCode] = useState<string>(DEFAULT_CFML_CODE);
  const [outputCode, setOutputCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormat = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Use a timeout to allow the loading state to render before the potentially blocking format operation
    setTimeout(() => {
        try {
            const formatted = formatCfml(inputCode, options);
            setOutputCode(formatted);
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(`Failed to format: ${e.message}`);
            } else {
                setError('An unknown error occurred during formatting.');
            }
            setOutputCode('');
        } finally {
            setIsLoading(false);
        }
    }, 50);
  }, [inputCode, options]);
  
  // Auto-format on initial load and when options change
  useEffect(() => {
    handleFormat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <Header />
      <main className="flex-grow flex flex-col p-4 gap-4">
        <div className="flex flex-col xl:flex-row gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <ConfigPanel options={options} setOptions={setOptions} />
          <div className="flex-grow flex items-center justify-end">
            <button
              onClick={handleFormat}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full xl:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SparklesIcon className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Formatting...' : 'Format Code'}</span>
            </button>
          </div>
        </div>

        {error && (
            <div className="flex items-center gap-3 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0"/>
                <span className="font-mono text-sm">{error}</span>
            </div>
        )}

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <Editor
            title="Source CFML"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            language="cfml"
          />
          <Editor
            title="Formatted Output"
            value={outputCode}
            isReadOnly
            language="cfml"
          />
        </div>
      </main>
    </div>
  );
};

export default App;
