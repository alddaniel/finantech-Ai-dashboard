
import React, { useState, Fragment } from 'react';
import type { InvoiceData } from '../types';
import { downloadPdfFromElement } from '../services/pdfService';
import { generatePdfFromElement } from '../services/pdfService';

interface BoletoPreviewModalProps {
    submission: InvoiceData;
    onClose: () => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00'); // Assume local timezone, not UTC
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
};

const generateLinhaDigitavel = (value: number) => {
    // This is a simplified, non-valid generator for visual purposes only.
    const valStr = Math.round(value * 100).toString().padStart(10, '0');
    const part1 = `23790.06309`;
    const part2 = `54139.201123`;
    const part3 = `45598.71000`;
    const part4 = `8`; // DV
    const part5 = `9798${valStr}`;
    return `${part1} ${part2} ${part3} ${part4} ${part5}`;
};

const Barcode: React.FC = () => (
    <svg height="50" width="100%" className="w-full">
        {Array.from({ length: 120 }).map((_, i) => (
            <rect 
                key={i}
                x={i * 3.5} 
                y="0" 
                width={Math.random() * 2 + 1} 
                height="50" 
                style={{ fill: '#000000' }} 
            />
        ))}
    </svg>
);


const BoletoField: React.FC<{ label: string; children: React.ReactNode; className?: string, borderTop?: boolean }> = ({ label, children, className, borderTop = false }) => (
    <div className={`border-l border-b border-gray-600 px-1.5 py-0.5 ${borderTop ? 'border-t' : ''} ${className}`}>
        <div className="text-[7px] text-gray-700 leading-tight">{label}</div>
        <div className="text-[9px] font-bold text-black leading-tight">{children}</div>
    </div>
);

const BANK_INFO: { [key: string]: { code: string; logoSlug: string } } = {
    'Banco do Brasil': { code: '001-9', logoSlug: 'bb.com.br' },
    'Itaú Unibanco': { code: '341-7', logoSlug: 'itau.com.br' },
    'Bradesco': { code: '237-2', logoSlug: 'bradesco.com.br' },
    'Caixa Econômica': { code: '104-0', logoSlug: 'caixa.gov.br' },
    'Santander': { code: '033-7', logoSlug: 'santander.com.br' },
};

export const BoletoPreviewModal: React.FC<BoletoPreviewModalProps> = ({ submission, onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const bankInfo = BANK_INFO[submission.bank] || BANK_INFO['Bradesco'];
    const bankLogoUrl = `https://logo.clearbit.com/${bankInfo.logoSlug}`;

    const handleDownload = () => {
        downloadPdfFromElement('boleto-content', `boleto_${submission.customer.replace(/\s/g, '_')}.pdf`);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Falhou!');
            console.error('Could not copy text: ', err);
        });
    };

    const handleWhatsAppShare = async () => {
        if (!navigator.share) {
            alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, salve o PDF e anexe manualmente.");
            return;
        }
    
        setIsSharing(true);
        try {
            const pdfBlob = await generatePdfFromElement('boleto-content');
            const pdfFile = new File([pdfBlob], `boleto_${submission.customer.replace(/\s/g, '_')}.pdf`, {
                type: 'application/pdf',
            });
            
            const linhaDigitavel = generateLinhaDigitavel(submission.total).replace(/\s|\./g, '');
            
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Boleto - ${submission.customer}`,
                    text: `Olá! Segue o boleto para ${submission.customer}.\n\nPara facilitar, você também pode copiar e colar a linha digitável: ${linhaDigitavel}`,
                });
            } else {
                 await navigator.share({
                     title: `Boleto - ${submission.customer}`,
                     text: `Olá! Segue o boleto para ${submission.customer}.\n\nPara facilitar, você também pode copiar e colar a linha digitável: ${linhaDigitavel}`,
                });
                alert("Seu navegador não suporta o compartilhamento de arquivos. O texto com a linha digitável foi compartilhado.");
            }
    
        } catch (error) {
            // Log error, unless it's an AbortError which happens when the user cancels the share dialog
            if ((error as DOMException).name !== 'AbortError') {
                console.error("Erro ao compartilhar via WhatsApp:", error);
                alert("Não foi possível compartilhar o boleto. Tente salvar o PDF e enviá-lo manualmente.");
            }
        } finally {
            setIsSharing(false);
        }
    };

    const linhaDigitavel = generateLinhaDigitavel(submission.total);
    const linhaDigitavelSemEspacos = linhaDigitavel.replace(/\s|\./g, '');

    const instructions = [];
    if (submission.interestRate && submission.interestType) {
        const type = submission.interestType === 'daily' ? 'ao dia' : 'ao mês';
        instructions.push(`- Juros de ${submission.interestRate.toFixed(2).replace('.', ',')}% ${type} em caso de atraso.`);
    }
    if (submission.fineRate) {
        instructions.push(`- Multa de ${submission.fineRate.toFixed(2).replace('.', ',')}% após o vencimento.`);
    }
    instructions.push(...submission.items.map(item => `- ${item.description} (x${item.quantity})`));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 print-hide">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Visualização do Boleto</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6">
                    <div id="boleto-content" className="printable-area bg-white p-2 font-['Arial'] text-xs mx-auto" style={{width: '660px'}}>
                        {/* --- Recibo do Sacado --- */}
                        <div className="border-b border-dashed border-gray-600 pb-2 mb-2">
                             <div className="flex items-center border-b border-gray-600 pb-1 mb-1">
                                <img src={bankLogoUrl} alt="Logo Banco" className="h-5 mr-4" />
                                <div className="border-l border-r border-gray-600 px-2 text-center">
                                    <span className="text-base font-bold">{bankInfo.code}</span>
                                </div>
                                <div className="ml-auto text-base font-mono font-bold tracking-wider">{linhaDigitavel.split(' ')[0]}</div>
                            </div>
                            <div className="grid grid-cols-5">
                                <BoletoField label="Cedente">FinanTech AI</BoletoField>
                                <BoletoField label="Agência/Código Cedente">1234-5 / 1234567-8</BoletoField>
                                <BoletoField label="Nosso Número">123456789-0</BoletoField>
                                <BoletoField label="Vencimento">{formatDate(submission.dueDate)}</BoletoField>
                                <BoletoField label="Valor do Documento" className="text-right">{formatCurrency(submission.total)}</BoletoField>
                            </div>
                             <div className="grid grid-cols-1">
                                <BoletoField label="Sacado">{submission.customer}</BoletoField>
                            </div>
                        </div>

                        {/* --- Ficha de Compensação --- */}
                        <div>
                            <div className="flex items-center border-b-2 border-black pb-1 mb-1">
                                <img src={bankLogoUrl} alt="Logo Banco" className="h-6 mr-4" />
                                <div className="border-l-2 border-r-2 border-black px-4 text-center">
                                    <span className="text-xl font-bold">{bankInfo.code}</span>
                                </div>
                                <div className="ml-auto text-lg font-mono font-bold tracking-wider relative flex items-center">
                                    <span>{linhaDigitavel}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 border-t border-l border-r border-gray-600">
                                <div className="col-span-9 border-r border-gray-600 p-1.5">
                                    <div className="text-[7px] text-gray-700">Local de Pagamento</div>
                                    <div className="text-[9px] font-bold text-black">PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.</div>
                                </div>
                                <BoletoField label="Vencimento" className="col-span-3 text-right">{formatDate(submission.dueDate)}</BoletoField>
                            </div>
                            
                            <div className="grid grid-cols-12 border-t border-l border-r border-gray-600">
                                <div className="col-span-9 border-r border-gray-600 p-1.5">
                                    <div className="text-[7px] text-gray-700">Cedente</div>
                                    <div className="text-[9px] font-bold text-black">FinanTech AI Soluções Financeiras Ltda.</div>
                                </div>
                                <BoletoField label="Agência/Código Cedente" className="col-span-3 text-right">1234-5 / 1234567-8</BoletoField>
                            </div>

                            <div className="grid grid-cols-12 border-t border-l border-r border-gray-600">
                                <BoletoField label="Data Documento" className="col-span-2">{new Date().toLocaleDateString('pt-BR')}</BoletoField>
                                <BoletoField label="Nº Documento" className="col-span-3">INV-{Date.now().toString().slice(-6)}</BoletoField>
                                <BoletoField label="Espécie Doc." className="col-span-2">DM</BoletoField>
                                <BoletoField label="Aceite" className="col-span-2">N</BoletoField>
                                <BoletoField label="Data Process." className="col-span-3">{new Date().toLocaleDateString('pt-BR')}</BoletoField>
                            </div>
                            
                            <div className="grid grid-cols-12 border-t border-l border-r border-gray-600">
                                <div className="col-span-9 row-span-5 border-r border-gray-600 p-1.5">
                                    <div className="text-[7px] text-gray-700">Instruções (Texto de Responsabilidade do Cedente)</div>
                                    <div className="text-[8px] font-semibold text-black mt-1 space-y-0.5">
                                        {instructions.map((inst, idx) => <Fragment key={idx}>{inst}<br/></Fragment>)}
                                    </div>
                                </div>
                                <BoletoField label="Valor do Documento" className="col-span-3 text-right">{formatCurrency(submission.total)}</BoletoField>
                            </div>
                            <div className="grid grid-cols-12 border-l border-r border-gray-600">
                                <BoletoField label="(-) Desconto / Abatimento" className="col-span-3 text-right" borderTop>&nbsp;</BoletoField>
                            </div>
                            <div className="grid grid-cols-12 border-l border-r border-gray-600">
                                <BoletoField label="(-) Outras Deduções" className="col-span-3 text-right" borderTop>&nbsp;</BoletoField>
                            </div>
                            <div className="grid grid-cols-12 border-l border-r border-gray-600">
                                <BoletoField label="(+) Mora / Multa" className="col-span-3 text-right" borderTop>&nbsp;</BoletoField>
                            </div>
                            <div className="grid grid-cols-12 border-l border-r border-gray-600">
                                <BoletoField label="(+) Outros Acréscimos" className="col-span-3 text-right" borderTop>&nbsp;</BoletoField>
                            </div>
                            <div className="grid grid-cols-12 border-t border-l border-r border-gray-600">
                                <div className="col-span-9 border-r border-gray-600"></div>
                                <BoletoField label="(=) Valor Cobrado" className="col-span-3 text-right" borderTop>{formatCurrency(submission.total)}</BoletoField>
                            </div>
                            
                            <div className="grid grid-cols-1 border-t border-l border-r border-b border-gray-600">
                                <div className="p-1.5">
                                    <div className="text-[7px] text-gray-700">Sacado</div>
                                    <div className="text-[9px] font-bold text-black">{submission.customer}</div>
                                    {/* Add address if available */}
                                </div>
                            </div>
                            <div className="flex justify-end text-[7px] mt-0.5">
                                <span>Autenticação Mecânica - Ficha de Compensação</span>
                            </div>
                            
                            <div className="mt-4">
                                <Barcode />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-end gap-3 print-hide">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            readOnly
                            value={linhaDigitavelSemEspacos}
                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 pr-10"
                        />
                        <button onClick={() => handleCopy(linhaDigitavelSemEspacos)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                           {copySuccess ? <CheckIcon/> : <CopyIcon />}
                        </button>
                    </div>
                    <button onClick={handleWhatsAppShare} disabled={isSharing} className="bg-[#25D366] text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-[#128C7E] transition-colors flex items-center gap-2">
                        <WhatsAppIcon /> {isSharing ? 'Gerando...' : 'WhatsApp'}
                    </button>
                    <button onClick={handleDownload} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <DownloadIcon /> Salvar PDF
                    </button>
                </div>

            </div>
        </div>
    );
};


const CopyIcon = () => <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const CheckIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const WhatsAppIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>;
