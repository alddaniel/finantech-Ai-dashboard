import React, { useState, useEffect } from 'react';
import type { DashboardSettings, DashboardWidget } from '../types';

interface DashboardSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: DashboardSettings;
    onSave: (newSettings: DashboardSettings) => void;
}

const widgetLabels: Record<DashboardWidget, string> = {
    summaryCards: 'Resumo Financeiro (Cartões)',
    cashFlowChart: 'Gráfico de Fluxo de Caixa',
    bankBalances: 'Saldos Bancários',
    overduePayables: 'Contas a Pagar Vencidas',
    overdueReceivables: 'Contas a Receber em Atraso',
    latestPayables: 'Últimas Contas a Pagar',
    latestReceivables: 'Últimas Contas a Receber',
    aiInsight: 'Insight com IA',
    scheduledItems: 'Avisos Agendados',
    accountantRequests: 'Pendências Contábeis',
};

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState(currentSettings);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);

    const handleToggle = (widget: DashboardWidget) => {
        setSettings(prev => ({
            ...prev,
            [widget]: !prev[widget],
        }));
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personalizar Dashboard</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Selecione os widgets que você deseja exibir.</p>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {(Object.keys(widgetLabels) as DashboardWidget[]).map(widget => (
                        <label key={widget} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{widgetLabels[widget]}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[widget]}
                                    onChange={() => handleToggle(widget)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};
