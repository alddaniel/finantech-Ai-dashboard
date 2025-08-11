
import React, { useState } from 'react';
import type { Transaction } from '../types';
import { downloadPdfFromElement, generatePdfFromElement } from '../services/pdfService';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface InvoicePreviewModalProps {
    invoice: Transaction;
    onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, onClose }) => {
    const submission = invoice.invoiceDetails;
    const [isSharing, setIsSharing] = useState(false);
    if (!submission) return null;

    const handleEmail = () => {
        const subject = `Cobrança Ref: ${submission.customer}`;
        const body = `Olá,\n\nSegue a cobrança no valor de ${formatCurrency(submission.total)} com vencimento em ${submission.dueDate}.\n\nItens:\n${submission.items.map(item => `- ${item.description} (Qtde: ${item.quantity}, Valor: ${formatCurrency(parseFloat(item.price.replace(',', '.')) || 0)})`).join('\n')}\n\nAtenciosamente,\nFinanTech AI`;
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const handleWhatsApp = async () => {
        if (!navigator.share) {
            alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, salve o PDF e anexe manualmente.");
            return;
        }

        setIsSharing(true);
        try {
            const pdfBlob = await generatePdfFromElement('invoice-preview-content');
            const pdfFile = new File([pdfBlob], `fatura_${submission.customer.replace(/\s/g, '_')}.pdf`, {
                type: 'application/pdf',
            });

            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Fatura - ${submission.customer}`,
                    text: `Olá! Segue a fatura para ${submission.customer} no valor de ${formatCurrency(submission.total)} com vencimento em ${submission.dueDate}.`,
                });
            } else {
                alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, salve o PDF e envie-o manualmente.");
            }
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                console.error("Erro ao compartilhar:", error);
                alert("Ocorreu um erro ao tentar compartilhar a fatura.");
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center print-hide">
                    <h2 className="text-xl font-bold">Visualizar Fatura</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                        <CloseIcon />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 print:overflow-visible" id="invoice-preview-content">
                     <div className="printable-area">
                        <div className="text-left max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-lg border border-gray-200/50 dark:border-gray-800/50 print:border-none print:p-0">
                           <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FinanTech AI</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Rua da Tecnologia, 123 - Centro</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold uppercase text-slate-500 dark:text-slate-400">Fatura</h3>
                                    <p className="text-slate-500 dark:text-slate-400">#{invoice.id.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 my-8">
                                <div>
                                    <h4 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">COBRANÇA PARA</h4>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{submission.customer}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm text-slate-500 dark:text-slate-400 font-semibold">VENCIMENTO</h4>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{submission.dueDate}</p>
                                </div>
                            </div>

                            <table className="min-w-full mb-8">
                                <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-2 px-1 text-left font-semibold text-slate-600 dark:text-slate-300">Descrição</th>
                                        <th className="py-2 px-1 text-center font-semibold text-slate-600 dark:text-slate-300">Qtde.</th>
                                        <th className="py-2 px-1 text-right font-semibold text-slate-600 dark:text-slate-300">Valor Unit.</th>
                                        <th className="py-2 px-1 text-right font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submission.items.map(item => (
                                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-3 px-1 text-slate-800 dark:text-slate-200">{item.description}</td>
                                            <td className="py-3 px-1 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                            <td className="py-3 px-1 text-right text-slate-600 dark:text-slate-400">{formatCurrency(parseFloat(item.price.replace(',', '.')) || 0)}</td>
                                            <td className="py-3 px-1 text-right font-medium text-slate-800 dark:text-slate-200">{formatCurrency((parseFloat(item.price.replace(',', '.')) || 0) * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="py-4 px-1 text-right font-bold text-lg text-slate-800 dark:text-slate-200">TOTAL A PAGAR</td>
                                        <td className="py-4 px-1 text-right font-bold text-2xl text-indigo-600 dark:text-indigo-400">{formatCurrency(submission.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                         </div>
                    </div>
                </div>

                 <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-3 print-hide">
                    <ActionButton icon={<EmailIcon />} onClick={handleEmail}>
                        Enviar por E-mail
                    </ActionButton>
                    <ActionButton icon={<WhatsAppIcon />} onClick={handleWhatsApp} disabled={isSharing}>
                         {isSharing ? 'Gerando...' : 'Enviar por WhatsApp'}
                    </ActionButton>
                     <ActionButton icon={<DownloadIcon />} isSecondary onClick={() => downloadPdfFromElement('invoice-preview-content', `fatura_${invoice.invoiceDetails?.customer.replace(/\s/g, '_')}.pdf`)}>
                        Salvar como PDF
                    </ActionButton>
                </div>
            </div>
        </div>
    );
};

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const ActionButton: React.FC<{icon: React.ReactNode, children: React.ReactNode, onClick: () => void, isSecondary?: boolean, disabled?: boolean}> = ({icon, children, onClick, isSecondary, disabled}) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isSecondary 
            ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700' 
            : 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
    >
        {icon}
        <span className="ml-2">{children}</span>
    </button>
);
const EmailIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const WhatsAppIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
