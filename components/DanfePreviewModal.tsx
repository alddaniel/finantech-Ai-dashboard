

import React from 'react';
import type { InvoiceData } from '../types';
import { downloadPdfFromElement } from '../services/pdfService';

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    // Use the local timezone, not UTC
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
};


const generateAccessKey = () => {
    let key = '';
    for (let i = 0; i < 11; i++) {
        key += Math.floor(Math.random() * 9000 + 1000).toString() + ' ';
    }
    return key.trim();
};

const Barcode: React.FC = () => (
    <svg height="50" width="100%" className="w-full">
        {Array.from({ length: 150 }).map((_, i) => (
            <rect 
                key={i}
                x={i * (100/150) + '%'} 
                y="0" 
                width={Math.random() * 1.5 + 0.8} 
                height="50" 
                style={{ fill: '#000000' }} 
            />
        ))}
    </svg>
);


const DanfeField: React.FC<{ label: string; children?: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }> = ({ label, children, className = '', align = 'left' }) => (
    <div className={`px-1 py-0.5 ${className}`}>
        <div className="text-[6px] text-gray-600 leading-tight uppercase">{label}</div>
        <div className={`text-[8px] font-bold text-black leading-tight break-words text-${align}`}>{children || <>&nbsp;</>}</div>
    </div>
);

const DanfeSection: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`border-x border-b border-black mt-[-1px] ${className}`}>
        <div className="font-bold text-center bg-gray-100 text-black text-[7px] uppercase border-b border-black py-0.5">{title}</div>
        {children}
    </div>
);


interface DanfePreviewModalProps {
    submission: InvoiceData;
    onClose: () => void;
}

export const DanfePreviewModal: React.FC<DanfePreviewModalProps> = ({ submission, onClose }) => {
    const accessKey = generateAccessKey();
    const today = new Date().toLocaleDateString('pt-BR');
    const totalNota = submission.total;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 print-hide flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pré-visualização da DANFE (Formato A4)</h2>
                     <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Voltar
                        </button>
                        <button onClick={() => downloadPdfFromElement('danfe-content', `danfe_${submission.customer.replace(/\s/g, '_')}.pdf`)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <DownloadIcon /> Salvar PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 bg-gray-200 dark:bg-gray-800">
                    <div id="danfe-content" className="printable-area bg-white p-4 font-['Arial'] text-black mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
                        
                        {/* HEADER SECTION */}
                        <div className="flex border border-black">
                             <div className="w-[55%] p-2 text-center border-r border-black flex flex-col justify-center">
                                <p className="font-bold text-sm">FinanTech AI Soluções Financeiras Ltda.</p>
                                <p className="text-[9px]">Rua da Tecnologia, 123 - Centro, São Paulo/SP, CEP: 01000-000</p>
                                <p className="text-[9px]">Fone: (11) 99999-9999 / Email: contato@finantechai.com</p>
                            </div>
                            <div className="w-[45%] flex">
                                <div className="w-1/3 flex flex-col items-center justify-center p-1 border-r border-black">
                                    <p className="font-bold text-2xl">DANFE</p>
                                    <p className="text-[7px] font-semibold text-center leading-tight">Documento Auxiliar da Nota Fiscal Eletrônica</p>
                                    <p className="text-center text-[8px] mt-1 leading-tight">
                                        0 - ENTRADA <br /> 
                                        <span className="font-bold text-lg border border-black px-2 py-0.5">1</span> - SAÍDA
                                    </p>
                                </div>
                                <div className="w-2/3 p-2 text-center space-y-1">
                                    <p className="font-bold">Nº. 000.001.234</p>
                                    <p className="text-[9px]">SÉRIE: 1</p>
                                    <p className="text-[9px]">Página 1 de 1</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-x border-b border-black p-1">
                            <DanfeField label="CHAVE DE ACESSO">
                                <p className="font-mono tracking-wide text-sm text-center">{accessKey}</p>
                            </DanfeField>
                        </div>
                         <div className="border-x border-b border-black p-1 text-center text-[8px]">
                            Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
                        </div>

                        <div className="grid grid-cols-12 border-x border-b border-black">
                            <DanfeField label="NATUREZA DA OPERAÇÃO" className="col-span-8 border-r border-black">VENDA DE PRODUTO/SERVIÇO</DanfeField>
                            <DanfeField label="PROTOCOLO DE AUTORIZAÇÃO DE USO" className="col-span-4">123456789012345 - {new Date().toLocaleString('pt-BR')}</DanfeField>
                        </div>
                        <div className="grid grid-cols-12 border-x border-b border-black">
                            <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-4 border-r border-black">ISENTO</DanfeField>
                            <DanfeField label="INSC. EST. DO SUBST. TRIBUTÁRIO" className="col-span-4 border-r border-black"></DanfeField>
                            <DanfeField label="CNPJ" className="col-span-4 font-mono">12.345.678/0001-99</DanfeField>
                        </div>

                        <DanfeSection title="DESTINATÁRIO / REMETENTE">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="NOME / RAZÃO SOCIAL" className="col-span-7 border-r border-black">{submission.customer}</DanfeField>
                                <DanfeField label="CNPJ / CPF" className="col-span-3 border-r border-black">00.000.000/0000-00</DanfeField>
                                <DanfeField label="DATA DA EMISSÃO" className="col-span-2 text-center">{today}</DanfeField>
                            </div>
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="ENDEREÇO" className="col-span-7 border-r border-black">Rua Exemplo, 123</DanfeField>
                                <DanfeField label="BAIRRO / DISTRITO" className="col-span-3 border-r border-black">Centro</DanfeField>
                                <DanfeField label="CEP" className="col-span-2">01000-000</DanfeField>
                            </div>
                            <div className="grid grid-cols-12">
                                <DanfeField label="MUNICÍPIO" className="col-span-5 border-r border-black">São Paulo</DanfeField>
                                <DanfeField label="FONE / FAX" className="col-span-2 border-r border-black">(11) 99999-9999</DanfeField>
                                <DanfeField label="UF" className="col-span-1 border-r border-black text-center">SP</DanfeField>
                                <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-2 border-r border-black">ISENTO</DanfeField>
                                <DanfeField label="DATA DA SAÍDA" className="col-span-2 text-center">{today}</DanfeField>
                            </div>
                        </DanfeSection>

                        <DanfeSection title="FATURA / DUPLICATAS">
                            <div className="flex">
                               <DanfeField label="NÚM." className="w-1/12 border-r border-black text-center">001</DanfeField>
                               <DanfeField label="VENC." className="w-2/12 border-r border-black text-center">{formatDate(submission.dueDate)}</DanfeField>
                               <DanfeField label="VALOR" className="w-2/12 text-right">{formatCurrency(submission.total)}</DanfeField>
                            </div>
                        </DanfeSection>

                        <DanfeSection title="CÁLCULO DO IMPOSTO">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="BASE DE CÁLCULO DO ICMS" className="col-span-2 border-r border-black text-right">{formatCurrency(submission.total)}</DanfeField>
                                <DanfeField label="VALOR DO ICMS" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="BASE DE CÁLCULO ICMS ST" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="VALOR DO ICMS SUBST." className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="VALOR TOTAL DOS PRODUTOS" className="col-span-4 text-right">{formatCurrency(submission.total)}</DanfeField>
                            </div>
                            <div className="grid grid-cols-12">
                                <DanfeField label="VALOR DO FRETE" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="VALOR DO SEGURO" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="DESCONTO" className="col-span-1 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="OUTRAS DESPESAS" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="VALOR TOTAL IPI" className="col-span-2 border-r border-black text-right">{formatCurrency(0)}</DanfeField>
                                <DanfeField label="VALOR TOTAL DA NOTA" className="col-span-3 text-right font-extrabold">{formatCurrency(totalNota)}</DanfeField>
                            </div>
                        </DanfeSection>
                        
                        <DanfeSection title="TRANSPORTADOR / VOLUMES TRANSPORTADOS">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="RAZÃO SOCIAL" className="col-span-5 border-r border-black"></DanfeField>
                                <DanfeField label="FRETE POR CONTA" className="col-span-2 border-r border-black">9-Sem Frete</DanfeField>
                                <DanfeField label="CÓDIGO ANTT" className="col-span-2 border-r border-black"></DanfeField>
                                <DanfeField label="PLACA DO VEÍCULO" className="col-span-2 border-r border-black"></DanfeField>
                                <DanfeField label="UF" className="col-span-1"></DanfeField>
                            </div>
                             <div className="grid grid-cols-12">
                                <DanfeField label="ENDEREÇO" className="col-span-4 border-r border-black"></DanfeField>
                                <DanfeField label="MUNICÍPIO" className="col-span-3 border-r border-black"></DanfeField>
                                <DanfeField label="UF" className="col-span-1 border-r border-black"></DanfeField>
                                <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-4"></DanfeField>
                            </div>
                        </DanfeSection>

                        <DanfeSection title="DADOS DOS PRODUTOS / SERVIÇOS">
                             <table className="w-full text-[7px] font-bold text-center border-collapse">
                                <thead className="bg-gray-100">
                                    <tr className="border-b border-black">
                                        <th className="p-1 border-r border-black">CÓD. PROD</th>
                                        <th className="p-1 border-r border-black w-[40%] text-left">DESCRIÇÃO DO PRODUTO/SERVIÇO</th>
                                        <th className="p-1 border-r border-black">NCM/SH</th>
                                        <th className="p-1 border-r border-black">CFOP</th>
                                        <th className="p-1 border-r border-black">UN.</th>
                                        <th className="p-1 border-r border-black">QTD.</th>
                                        <th className="p-1 border-r border-black">V. UNIT.</th>
                                        <th className="p-1 border-r border-black">V. TOTAL</th>
                                        <th className="p-1 border-r border-black">B. CÁLC. ICMS</th>
                                        <th className="p-1">V. ICMS</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[8px] font-normal">
                                    {submission.items.map(item => {
                                        const price = parseFloat(item.price.replace(',', '.')) || 0;
                                        return (
                                            <tr key={item.id}>
                                                <td className="p-1 border-r border-black text-center">PROD-{item.id}</td>
                                                <td className="p-1 border-r border-black text-left font-semibold">{item.description}</td>
                                                <td className="p-1 border-r border-black text-center">22221100</td>
                                                <td className="p-1 border-r border-black text-center">5102</td>
                                                <td className="p-1 border-r border-black text-center">UN</td>
                                                <td className="p-1 border-r border-black text-right">{formatCurrency(item.quantity)}</td>
                                                <td className="p-1 border-r border-black text-right">{formatCurrency(price)}</td>
                                                <td className="p-1 border-r border-black text-right font-bold">{formatCurrency(price * item.quantity)}</td>
                                                <td className="p-1 border-r border-black text-right">{formatCurrency(price * item.quantity)}</td>
                                                <td className="p-1 text-right">{formatCurrency(0)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </DanfeSection>

                        <DanfeSection title="DADOS ADICIONAIS">
                             <div className="flex">
                                <div className="w-2/3 border-r border-black">
                                    <DanfeField label="INFORMAÇÕES COMPLEMENTARES">
                                        Documento emitido por sistema FinanTech AI. {submission.interestRate && `Juros de ${submission.interestRate}% podem ser aplicados.`}
                                    </DanfeField>
                                </div>
                                <div className="w-1/3">
                                    <DanfeField label="RESERVADO AO FISCO"></DanfeField>
                                </div>
                            </div>
                        </DanfeSection>

                        <div className="mt-4">
                            <Barcode />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;