
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700">
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3.50414L3.50414 8L8 12.4959L12.4959 8L8 3.50414Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 3.50414L11.5041 8L16 12.4959L20.4959 8L16 3.50414Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
          <path d="M8 11.5041L3.50414 16L8 20.4959L12.4959 16L8 11.5041Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
          <path d="M16 11.5041L11.5041 16L16 20.4959L20.4959 16L16 11.5041Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <h1 className="text-xl font-bold text-slate-200">CFML Formatter Pro</h1>
      </div>
      <div className="text-sm text-slate-400">
        AST-Based Code Formatting
      </div>
    </header>
  );
};

export default Header;
