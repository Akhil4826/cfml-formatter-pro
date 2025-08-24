
import React from 'react';
import { type FormatOptions } from '../types';

interface ConfigPanelProps {
  options: FormatOptions;
  setOptions: React.Dispatch<React.SetStateAction<FormatOptions>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ options, setOptions }) => {
  const handleOptionChange = <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  const handleCheckboxChange = (key: keyof FormatOptions, checked: boolean) => {
     setOptions(prev => ({ ...prev, [key]: checked }));
  }

  return (
    <div className="flex-grow grid grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap items-center gap-x-6 gap-y-4">
      <h3 className="text-base font-semibold text-slate-200 col-span-full xl:col-span-1">Formatting Options</h3>
      
      {/* General Options */}
      <div className="flex items-center gap-2">
        <label htmlFor="tabWidth" className="text-sm font-medium text-slate-400 whitespace-nowrap">Tab Width</label>
        <input
          type="number"
          id="tabWidth"
          min="1"
          max="16"
          value={options.tabWidth}
          onChange={(e) => handleOptionChange('tabWidth', parseInt(e.target.value, 10))}
          className="w-16 bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="quoteStyle" className="text-sm font-medium text-slate-400">Quotes</label>
        <select
          id="quoteStyle"
          value={options.quoteStyle}
          onChange={(e) => handleOptionChange('quoteStyle', e.target.value as 'double' | 'single')}
          className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-md pl-2 pr-8 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="double">Double</option>
          <option value="single">Single</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="attributeThreshold" className="text-sm font-medium text-slate-400 whitespace-nowrap">Attr Wrap</label>
        <input
          type="number"
          id="attributeThreshold"
          min="1"
          max="20"
          title="Break attributes to new lines if count exceeds this value"
          value={options.attributeThreshold}
          onChange={(e) => handleOptionChange('attributeThreshold', parseInt(e.target.value, 10))}
          className="w-16 bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Feature Toggles */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="formatSql" checked={options.formatSql} onChange={(e) => handleCheckboxChange('formatSql', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"/>
        <label htmlFor="formatSql" className="text-sm font-medium text-slate-400">Format SQL</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="pascalCase" checked={options.pascalCaseBuiltInFunctions} onChange={(e) => handleCheckboxChange('pascalCaseBuiltInFunctions', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"/>
        <label htmlFor="pascalCase" className="text-sm font-medium text-slate-400">PascalCase Functions</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="preferNew" checked={options.preferNewOverCreateObject} onChange={(e) => handleCheckboxChange('preferNewOverCreateObject', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500"/>
        <label htmlFor="preferNew" className="text-sm font-medium text-slate-400">Use `new`</label>
      </div>
    </div>
  );
};

export default ConfigPanel;
