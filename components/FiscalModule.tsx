

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { getTaxRegimeComparison } from '../services/geminiService';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

type TaxRegime = 'simples' | 'presumido' | 'real';
interface TaxResult {
    total: number;
    breakdown: { name: string; value: number }[];
}

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";
const selectStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 pl-3 pr-10 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

export const FiscalModule: React.FC = () => {
    // State for Tax Calculator
    const [revenue, setRevenue] = useState<number>(50000);
    const [regime, setRegime] = useState<TaxRegime>('simples');
    const [taxResult, setTaxResult] = useState<TaxResult | null>(null);

    // State for AI Comparison
    const [businessActivity, setBusinessActivity] = useState('Serviços de consultoria em tecnologia');
    const [isLoading, setIsLoading] = useState(false);
    const [comparisonResult, setComparisonResult] = useState('');

    const handleCalculateTaxes = () => {
        let result: TaxResult;
        switch (regime) {
            case 'simples':
                const simpleTax = revenue * 0.06; // Simplified rate
                result = { total: simpleTax, breakdown: [{ name: 'DAS (Simples Nacional)', value: simpleTax }] };
                break;
            case 'presumido':
                const pis = revenue * 0.0065;
                const cofins = revenue * 0.03;
                const iss = revenue * 0.05; // Assuming 5%
                result = { total: pis + cofins + iss, breakdown: [{name: 'PIS', value: pis}, {name: 'COFINS', value: cofins}, {name: 'ISS', value: iss}] };
                break;
            case 'real':
                const pisReal = revenue * 0.0165;
                const cofinsReal = revenue * 0.076;
                const issReal = revenue * 0.05;
                result = { total: pisReal + cofinsReal + issReal, breakdown: [{name: 'PIS', value: pisReal}, {name: 'COFINS', value: cofinsReal}, {name: 'ISS', value: issReal}] };
                break;
        }
        setTaxResult(result);
    };

    const handleCompareRegimes = async () => {
        setIsLoading(true);
        setComparisonResult('');
        try {
            const result = await getTaxRegimeComparison(revenue, businessActivity);
            setComparisonResult(result);
        } catch (error) {
            setComparisonResult("Ocorreu um erro ao conectar com o serviço de IA. Verifique sua chave de API e tente novamente.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formattedComparisonResult = comparisonResult
        .replace(/## (.*)/g, '<h3 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/\n/g, '<br />');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Módulo Fiscal Avançado</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Calcule impostos e compare regimes tributários para tomar as melhores decisões.
            </p>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
                <div className="p-6 border-b border-slate-900/5 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calculadora de Impostos (Simulação)</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Faturamento Mensal (R$)</label>
                            <input type="number" id="revenue" name="revenue" value={revenue} onChange={e => setRevenue(parseFloat(e.target.value) || 0)} className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="tax-regime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Regime Tributário</label>
                            <select id="tax-regime" value={regime} onChange={e => setRegime(e.target.value as TaxRegime)} className={selectStyle}>
                                <option value="simples">Simples Nacional</option>
                                <option value="presumido">Lucro Presumido</option>
                                <option value="real">Lucro Real</option>
                            </select>
                        </div>
                    </div>
                    {taxResult && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultado da Simulação:</h3>
                             <div className="space-y-2 mt-2">
                                {taxResult.breakdown.map(item => (
                                    <div key={item.name} className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-lg border-t border-dashed pt-2 mt-2">
                                    <span className="text-gray-800 dark:text-gray-200">Total de Impostos:</span>
                                    <span className="text-indigo-500">{formatCurrency(taxResult.total)}</span>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-xl px-6 py-4 flex justify-end border-t border-slate-900/5 dark:border-white/10">
                    <button onClick={handleCalculateTaxes} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                        Calcular Impostos
                    </button>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
                <div className="p-6 border-b border-slate-900/5 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comparativo de Regimes Tributários com IA</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="business-activity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Atividade Principal da Empresa</label>
                        <input type="text" id="business-activity" name="businessActivity" value={businessActivity} onChange={e => setBusinessActivity(e.target.value)} className={inputStyle} />
                        <p className="text-xs text-gray-500 mt-1">O faturamento mensal informado na calculadora acima será usado para a análise.</p>
                    </div>

                    {(isLoading || comparisonResult) && (
                         <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">Gemini está analisando os regimes para você...</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedComparisonResult }}></div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-xl px-6 py-4 flex justify-end border-t border-slate-900/5 dark:border-white/10">
                    <button onClick={handleCompareRegimes} disabled={isLoading} className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-wait flex items-center gap-2">
                        {isLoading ? 'Analisando...' : 'Comparar com Gemini'}
                        <AIIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;