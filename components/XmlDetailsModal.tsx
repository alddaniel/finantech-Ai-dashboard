
import React from 'react';
import type { ParsedNFeData } from '../types';

interface XmlDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ParsedNFeData | null;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const DetailItem: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{value || '-'}</p>
    </div>
);

export const XmlDetailsModal: React.FC<XmlDetailsModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const { supplier, items, totalAmount } = data;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes da NF-e Importada</h2>
                </div>
                <div className="p-6 space-y-6">
                    <fieldset className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <legend className="px-2 text-lg font-semibold text-slate-800 dark:text-slate-200">Fornecedor (Emitente)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <DetailItem label="Razão Social" value={supplier.name} />
                            <DetailItem label="CNPJ" value={supplier.cnpj} />
                            <DetailItem label="Endereço" value={`${supplier.address.street}, ${supplier.address.number}`} />
                            <DetailItem label="Cidade" value={`${supplier.address.city} - ${supplier.address.state.toUpperCase()}`} />
                        </div>
                    </fieldset>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Itens da Nota</h3>
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descrição</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qtde.</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vlr. Unit.</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vlr. Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.description}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">{formatCurrency(item.totalPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <td colSpan={3} className="px-4 py-2 text-right font-bold text-gray-700 dark:text-gray-300">TOTAL DA NOTA</td>
                                        <td className="px-4 py-2 text-right font-bold text-lg text-indigo-600 dark:text-indigo-400">{formatCurrency(totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                        Fechar e Continuar
                    </button>
                </div>
            </div>
        </div>
    );
};
