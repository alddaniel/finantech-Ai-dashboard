import React, { useState, useRef, useEffect } from 'react';

const PdfIcon = () => <svg className="w-5 h-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;

interface ExportMenuProps {
  onExportPdf: () => void;
  onExportCsv: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExportPdf, onExportCsv }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          Exportar
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onExportPdf(); setIsOpen(false); }}
              className="group flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              <PdfIcon />
              Salvar como PDF
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onExportCsv(); setIsOpen(false); }}
              className="group flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              <ExcelIcon />
              Exportar CSV (Excel)
            </a>
          </div>
        </div>
      )}
    </div>
  );
};