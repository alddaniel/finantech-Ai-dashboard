

import React from 'react';
import type { DanfeData } from '../types';
import { downloadPdfFromElement } from '../services/pdfService';

const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null || value === '') return '0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0,00';
    return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    // Handles both DD/MM/YYYY and YYYY-MM-DD, returns DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }
    return dateString;
};

const formatDateTime = (dateTimeString: string | undefined): { date: string, time: string } => {
    if (!dateTimeString) return { date: '-', time: '-' };
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return { date: '-', time: '-' };
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return {
            date: date.toLocaleDateString('pt-BR', dateOptions),
            time: date.toLocaleTimeString('pt-BR', timeOptions),
        };
    } catch {
        return { date: dateTimeString.split('T')[0], time: dateTimeString.split('T')[1] || '' };
    }
};

const formatAccessKey = (key: string) => {
    if (!key) return '';
    return key.replace(/(\d{4})/g, '$1 ').trim();
};

const getFretePorContaLabel = (code: string) => {
    switch(code) {
        case '0': return '0-Emitente';
        case '1': return '1-Destinatário';
        case '2': return '2-Terceiros';
        case '9': return '9-Sem Frete';
        default: return code;
    }
};

const Barcode: React.FC<{ accessKey: string }> = ({ accessKey }) => {
    // This is a visual representation, not a valid barcode generator.
    const seed = parseInt(accessKey.substring(0, 8), 10) || 12345678;
    const pseudoRandom = () => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    return (
        <svg height="50" width="100%" className="w-full">
            {Array.from({ length: 150 }).map((_, i) => (
                <rect
                    key={i}
                    x={`${(i / 150) * 100}%`}
                    y="0"
                    width={pseudoRandom() * 1.5 + 0.8}
                    height="50"
                    style={{ fill: '#000000' }}
                />
            ))}
        </svg>
    );
};

const DanfeField: React.FC<{ label: string; children?: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right'; bold?: boolean }> = ({ label, children, className = '', align = 'left', bold = true }) => (
    <div className={`px-1 py-0.5 ${className}`}>
        <div className="text-[6px] text-gray-600 leading-tight uppercase">{label}</div>
        <div className={`text-[8px] ${bold ? 'font-bold' : ''} text-black leading-tight break-words text-${align}`}>{children || <>&nbsp;</>}</div>
    </div>
);

const DanfeSection: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`border-x border-b border-black mt-[-1px] ${className}`}>
        <div className="font-bold text-center bg-gray-100 text-black text-[7px] uppercase border-b border-black py-0.5">{title}</div>
        {children}
    </div>
);


interface DanfePreviewModalProps {
    data: DanfeData;
    onClose: () => void;
}

export const DanfePreviewModal: React.FC<DanfePreviewModalProps> = ({ data, onClose }) => {
    
    const { date: dataEmissao } = formatDateTime(data.dataEmissao);
    const { date: dataSaida, time: horaSaida } = formatDateTime(data.dataSaidaEntrada);
    const { date: dataProtocolo, time: horaProtocolo } = formatDateTime(data.protocolo?.data);


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-5xl my-8 flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 print-hide flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pré-visualização da DANFE (Formato A4)</h2>
                     <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                            Voltar
                        </button>
                        <button onClick={() => downloadPdfFromElement('danfe-content', `danfe_${data.destinatario.nome.replace(/\s/g, '_')}.pdf`)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <DownloadIcon /> Salvar PDF
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-8 md:p-12 bg-gray-200 dark:bg-gray-800 overflow-y-auto">
                    <div id="danfe-content" className="printable-area bg-white p-4 font-['Arial'] text-black mx-auto shadow-lg" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
                        
                        <div className="flex border border-black">
                            <div className="w-[55%] p-2 text-center border-r border-black flex flex-col justify-center">
                                <p className="font-bold text-sm">{data.emitente.nome}</p>
                                <p className="text-[9px]">{data.emitente.endereco}</p>
                                <p className="text-[9px]">{data.emitente.municipio}/{data.emitente.uf}, CEP: {data.emitente.cep}</p>
                                <p className="text-[9px]">Fone: {data.emitente.telefone}</p>
                            </div>
                            <div className="w-[45%] flex">
                                <div className="w-1/3 flex flex-col items-center justify-center p-1 border-r border-black">
                                    <p className="font-bold text-2xl">DANFE</p>
                                    <p className="text-[7px] font-semibold text-center leading-tight">Documento Auxiliar da Nota Fiscal Eletrônica</p>
                                    <p className="text-center text-[8px] mt-1 leading-tight">
                                        {data.tipoOperacao === '0' ? <><span className="font-bold text-lg border border-black px-2 py-0.5">0</span> - ENTRADA<br/>1 - SAÍDA</> : <>0 - ENTRADA<br/><span className="font-bold text-lg border border-black px-2 py-0.5">1</span> - SAÍDA</>}
                                    </p>
                                </div>
                                <div className="w-2/3 p-2 text-center space-y-1">
                                    <p className="font-bold">Nº. {data.numeroNota}</p>
                                    <p className="text-[9px]">SÉRIE: {data.serie}</p>
                                    <p className="text-[9px]">Página 1 de 1</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-x border-b border-black p-1">
                            <DanfeField label="CHAVE DE ACESSO">
                                <p className="font-mono tracking-wide text-sm text-center">{formatAccessKey(data.chaveAcesso)}</p>
                            </DanfeField>
                        </div>
                         <div className="border-x border-b border-black p-1 text-center text-[8px]">
                            Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
                        </div>

                        <div className="grid grid-cols-12 border-x border-b border-black">
                            <DanfeField label="NATUREZA DA OPERAÇÃO" className="col-span-8 border-r border-black">{data.naturezaOperacao}</DanfeField>
                            <DanfeField label="PROTOCOLO DE AUTORIZAÇÃO DE USO" className="col-span-4">{data.protocolo?.codigo && `${data.protocolo.codigo} - ${dataProtocolo} ${horaProtocolo}`}</DanfeField>
                        </div>
                        <div className="grid grid-cols-12 border-x border-b border-black">
                            <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-4 border-r border-black">{data.emitente.ie}</DanfeField>
                            <DanfeField label="INSC. EST. DO SUBST. TRIBUTÁRIO" className="col-span-4 border-r border-black"></DanfeField>
                            <DanfeField label="CNPJ" className="col-span-4 font-mono">{data.emitente.cnpjCpf}</DanfeField>
                        </div>

                        <DanfeSection title="DESTINATÁRIO / REMETENTE">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="NOME / RAZÃO SOCIAL" className="col-span-7 border-r border-black">{data.destinatario.nome}</DanfeField>
                                <DanfeField label="CNPJ / CPF" className="col-span-3 border-r border-black">{data.destinatario.cnpjCpf}</DanfeField>
                                <DanfeField label="DATA DA EMISSÃO" className="col-span-2 text-center">{dataEmissao}</DanfeField>
                            </div>
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="ENDEREÇO" className="col-span-7 border-r border-black">{data.destinatario.endereco}</DanfeField>
                                <DanfeField label="BAIRRO / DISTRITO" className="col-span-3 border-r border-black">{data.destinatario.bairro}</DanfeField>
                                <DanfeField label="CEP" className="col-span-2">{data.destinatario.cep}</DanfeField>
                            </div>
                            <div className="grid grid-cols-12">
                                <DanfeField label="MUNICÍPIO" className="col-span-5 border-r border-black">{data.destinatario.municipio}</DanfeField>
                                <DanfeField label="FONE / FAX" className="col-span-2 border-r border-black">{data.destinatario.telefone}</DanfeField>
                                <DanfeField label="UF" className="col-span-1 border-r border-black text-center">{data.destinatario.uf}</DanfeField>
                                <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-2 border-r border-black">{data.destinatario.ie}</DanfeField>
                                <DanfeField label="DATA DA SAÍDA" className="col-span-2 text-center">{dataSaida}</DanfeField>
                            </div>
                        </DanfeSection>

                        <DanfeSection title="FATURA / DUPLICATAS">
                            <div className="flex">
                                {data.faturas.map((fatura, idx) => (
                                    <DanfeField key={idx} label={`NÚM. ${fatura.numero} | VENC. ${formatDate(fatura.vencimento)} | VALOR ${formatCurrency(fatura.valor)}`} className="flex-1 text-center"></DanfeField>
                                ))}
                                {data.faturas.length === 0 && <div className="p-2">&nbsp;</div>}
                            </div>
                        </DanfeSection>

                        <DanfeSection title="CÁLCULO DO IMPOSTO">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="BASE DE CÁLCULO DO ICMS" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.baseCalculoIcms)}</DanfeField>
                                <DanfeField label="VALOR DO ICMS" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.valorIcms)}</DanfeField>
                                <DanfeField label="BASE DE CÁLCULO ICMS ST" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.baseCalculoIcmsSt)}</DanfeField>
                                <DanfeField label="VALOR DO ICMS SUBST." className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.valorIcmsSt)}</DanfeField>
                                <DanfeField label="VALOR TOTAL DOS PRODUTOS" className="col-span-4 text-right">{formatCurrency(data.totais.valorTotalProdutos)}</DanfeField>
                            </div>
                            <div className="grid grid-cols-12">
                                <DanfeField label="VALOR DO FRETE" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.valorFrete)}</DanfeField>
                                <DanfeField label="VALOR DO SEGURO" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.valorSeguro)}</DanfeField>
                                <DanfeField label="DESCONTO" className="col-span-1 border-r border-black text-right">{formatCurrency(data.totais.desconto)}</DanfeField>
                                <DanfeField label="OUTRAS DESPESAS" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.outrasDespesas)}</DanfeField>
                                <DanfeField label="VALOR TOTAL IPI" className="col-span-2 border-r border-black text-right">{formatCurrency(data.totais.valorTotalIpi)}</DanfeField>
                                <DanfeField label="VALOR TOTAL DA NOTA" className="col-span-3 text-right font-extrabold">{formatCurrency(data.totais.valorTotalNota)}</DanfeField>
                            </div>
                        </DanfeSection>
                        
                        <DanfeSection title="TRANSPORTADOR / VOLUMES TRANSPORTADOS">
                             <div className="grid grid-cols-12 border-b border-black">
                                <DanfeField label="RAZÃO SOCIAL" className="col-span-5 border-r border-black">{data.transportador.nome}</DanfeField>
                                <DanfeField label="FRETE POR CONTA" className="col-span-2 border-r border-black">{getFretePorContaLabel(data.transportador.fretePorConta)}</DanfeField>
                                <DanfeField label="CÓDIGO ANTT" className="col-span-2 border-r border-black">{data.transportador.codigoAntt}</DanfeField>
                                <DanfeField label="PLACA DO VEÍCULO" className="col-span-2 border-r border-black">{data.transportador.placaVeiculo}</DanfeField>
                                <DanfeField label="UF" className="col-span-1">{data.transportador.ufVeiculo}</DanfeField>
                            </div>
                             <div className="grid grid-cols-12">
                                <DanfeField label="ENDEREÇO" className="col-span-4 border-r border-black">{data.transportador.endereco}</DanfeField>
                                <DanfeField label="MUNICÍPIO" className="col-span-3 border-r border-black">{data.transportador.municipio}</DanfeField>
                                <DanfeField label="UF" className="col-span-1 border-r border-black">{data.transportador.uf}</DanfeField>
                                <DanfeField label="INSCRIÇÃO ESTADUAL" className="col-span-4">{data.transportador.ie}</DanfeField>
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
                                    {data.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-1 border-r border-black text-center">{item.codigo}</td>
                                            <td className="p-1 border-r border-black text-left font-semibold">{item.descricao}</td>
                                            <td className="p-1 border-r border-black text-center">{item.ncm}</td>
                                            <td className="p-1 border-r border-black text-center">{item.cfop}</td>
                                            <td className="p-1 border-r border-black text-center">{item.unidade}</td>
                                            <td className="p-1 border-r border-black text-right">{formatCurrency(item.quantidade)}</td>
                                            <td className="p-1 border-r border-black text-right">{formatCurrency(item.valorUnitario)}</td>
                                            <td className="p-1 border-r border-black text-right font-bold">{formatCurrency(item.valorTotal)}</td>
                                            <td className="p-1 border-r border-black text-right">{formatCurrency(item.baseCalculoIcms)}</td>
                                            <td className="p-1 text-right">{formatCurrency(item.valorIcms)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DanfeSection>

                        <DanfeSection title="DADOS ADICIONAIS">
                             <div className="flex">
                                <div className="w-2/3 border-r border-black">
                                    <DanfeField label="INFORMAÇÕES COMPLEMENTARES" bold={false}>
                                        {data.infoAdicionais}
                                    </DanfeField>
                                </div>
                                <div className="w-1/3">
                                    <DanfeField label="RESERVADO AO FISCO"></DanfeField>
                                </div>
                            </div>
                        </DanfeSection>

                        <div className="mt-4">
                            <Barcode accessKey={data.chaveAcesso}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;