import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import type { Company } from '../types';
import { getTaxRegimeComparison } from '../services/geminiService';
import { Spinner } from './ui/Spinner.tsx';

const inputStyle = "mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm";

// --- Currency Formatting Utilities ---
const formatCurrencyOnInput = (value: string): string => {
  if (!value) return '';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '';
  const numberValue = parseFloat(digitsOnly) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseFormattedCurrency = (value: string): number => {
    if (typeof value !== 'string' || !value) return 0;
    const cleanedValue = value.replace(/R\$\s?/, '').replace(/\./g, '');
    const numericString = cleanedValue.replace(',', '.');
    return parseFloat(numericString) || 0;
};
// --- End Currency Formatting Utilities ---

// --- New Types for structured results ---
type TaxDetail = { name: string; value: number };
type RegimeResult = {
    name: string;
    totalTax: number;
    aliquotEffective: number;
    taxes: TaxDetail[];
    pros: string[];
    cons: string[];
};
type ComparisonResult = {
    simples: RegimeResult;
    presumido: RegimeResult;
    real: RegimeResult;
    recommendation: string;
    bestRegime: string;
};
// --- End New Types ---

// --- Simplified Simples Nacional Anexo III table (Services) ---
const ANEXO_III_RANGES = [
    { limit: 180000, aliquot: 0.06, deduction: 0 },
    { limit: 360000, aliquot: 0.112, deduction: 9360 },
    { limit: 720000, aliquot: 0.135, deduction: 17640 },
    { limit: 1800000, aliquot: 0.16, deduction: 35640 },
    { limit: 3600000, aliquot: 0.21, deduction: 125640 },
    { limit: 4800000, aliquot: 0.33, deduction: 648000 },
];

const UpgradeTeaser: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <Card>
        <CardContent className="text-center py-12">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto text-indigo-500">
                {icon}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 max-w-xl mx-auto text-slate-600 dark:text-slate-400">{description}</p>
            <p className="mt-4 text-sm text-slate-500">Contate o administrador do sistema para habilitar este módulo.</p>
        </CardContent>
    </Card>
);

const RegimeCard: React.FC<{ result: RegimeResult; isRecommended: boolean }> = ({ result, isRecommended }) => (
    <Card className={`flex flex-col ${isRecommended ? 'border-2 border-green-500 shadow-lg' : ''}`}>
        <CardHeader className="relative">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{result.name}</h3>
            {isRecommended && <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Recomendado</div>}
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Impostos Estimado</p>
                <p className="text-3xl font-bold text-red-500">{result.totalTax.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alíquota Efetiva: {(result.aliquotEffective * 100).toFixed(2)}%</p>
            </div>
            <div className="text-sm space-y-1">
                <h4 className="font-semibold mb-1">Detalhamento (Estimado):</h4>
                {result.taxes.map(tax => (
                    <div key={tax.name} className="flex justify-between">
                        <span>{tax.name}</span>
                        <span className="font-mono">{tax.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                ))}
            </div>
             <div className="text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-1 text-green-600 dark:text-green-400">Prós:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {result.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                </ul>
            </div>
             <div className="text-sm pt-2">
                <h4 className="font-semibold mb-1 text-red-600 dark:text-red-400">Contras:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {result.cons.map((con, i) => <li key={i}>{con}</li>)}
                </ul>
            </div>
        </CardContent>
    </Card>
);


interface FiscalModuleProps {
    company?: Company;
}

export const FiscalModule: React.FC<FiscalModuleProps> = ({ company }) => {
    const [monthlyRevenue, setMonthlyRevenue] = useState('');
    const [businessActivity, setBusinessActivity] = useState('');
    const [profitMargin, setProfitMargin] = useState('20');
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState('');
    
    const isModuleEnabled = company?.enabledModules.includes('fiscal');

    const handleAnalysis = () => {
        const revenue = parseFormattedCurrency(monthlyRevenue);
        if (isNaN(revenue) || revenue <= 0) {
            alert('Por favor, informe um valor de faturamento válido.');
            return;
        }
        const margin = parseFloat(profitMargin) || 20;

        // --- Simples Nacional Calculation (Anexo III - Serviços) ---
        const annualRevenue = revenue * 12;
        const range = ANEXO_III_RANGES.find(r => annualRevenue <= r.limit) || ANEXO_III_RANGES[ANEXO_III_RANGES.length - 1];
        const effectiveAliquotSimples = ((annualRevenue * range.aliquot) - range.deduction) / annualRevenue;
        const simplesTotalTax = revenue * effectiveAliquotSimples;
        const simples: RegimeResult = {
            name: "Simples Nacional",
            totalTax: simplesTotalTax,
            aliquotEffective: effectiveAliquotSimples,
            taxes: [{ name: "DAS (Guia Única)", value: simplesTotalTax }],
            pros: ["Burocracia reduzida", "Guia única de pagamento (DAS)", "Geralmente mais barato para PMEs no início"],
            cons: ["Limite de faturamento (R$ 4.8 milhões/ano)", "Não aproveita créditos de PIS/COFINS", "Pode ser mais caro se a margem de lucro for baixa"]
        };

        // --- Lucro Presumido Calculation (Serviços) ---
        const presumedProfitBase = revenue * 0.32;
        const irpjPresumido = presumedProfitBase * 0.15 + (presumedProfitBase > 20000 ? (presumedProfitBase - 20000) * 0.10 : 0);
        const csllPresumido = presumedProfitBase * 0.09;
        const pisPresumido = revenue * 0.0065;
        const cofinsPresumido = revenue * 0.03;
        const issPresumido = revenue * 0.05; // Standard 5%
        const presumidoTotalTax = irpjPresumido + csllPresumido + pisPresumido + cofinsPresumido + issPresumido;
        const presumido: RegimeResult = {
            name: "Lucro Presumido",
            totalTax: presumidoTotalTax,
            aliquotEffective: presumidoTotalTax / revenue,
            taxes: [
                { name: "IRPJ", value: irpjPresumido }, { name: "CSLL", value: csllPresumido },
                { name: "PIS", value: pisPresumido }, { name: "COFINS", value: cofinsPresumido },
                { name: "ISS", value: issPresumido }
            ],
            pros: ["Cálculo mais simples que o Lucro Real", "Pode ser muito vantajoso se a margem de lucro real for maior que a presumida (32%)"],
            cons: ["Paga imposto mesmo se tiver prejuízo", "Alíquotas de PIS/COFINS são menores, mas não geram crédito"]
        };
        
        // --- Lucro Real Calculation ---
        const actualProfit = revenue * (margin / 100);
        const irpjReal = actualProfit > 0 ? (actualProfit * 0.15 + (actualProfit > 20000 ? (actualProfit - 20000) * 0.10 : 0)) : 0;
        const csllReal = actualProfit > 0 ? actualProfit * 0.09 : 0;
        const pisReal = revenue * 0.0165; // Non-cumulative
        const cofinsReal = revenue * 0.076; // Non-cumulative
        const issReal = revenue * 0.05;
        const realTotalTax = irpjReal + csllReal + pisReal + cofinsReal + issReal;
        const real: RegimeResult = {
            name: "Lucro Real",
            totalTax: realTotalTax,
            aliquotEffective: realTotalTax / revenue,
            taxes: [
                { name: "IRPJ", value: irpjReal }, { name: "CSLL", value: csllReal },
                { name: "PIS", value: pisReal }, { name: "COFINS", value: cofinsReal },
                { name: "ISS", value: issReal }
            ],
            pros: ["Impostos calculados sobre o lucro real (não paga se tiver prejuízo)", "Permite aproveitar créditos de PIS/COFINS"],
            cons: ["Muito mais complexo e burocrático", "Exige controle contábil rigoroso", "Alíquotas de PIS/COFINS são maiores"]
        };
        
        // --- Recommendation ---
        const results = [simples, presumido, real];
        const best = results.reduce((prev, current) => (prev.totalTax < current.totalTax) ? prev : current);
        
        setComparisonResult({
            simples, presumido, real,
            bestRegime: best.name,
            recommendation: `Com base em um faturamento de ${revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} e uma margem de lucro de ${margin}%, o regime mais vantajoso é o ${best.name}.`
        });
    };

    const handleAiAnalysis = async () => {
        const revenue = parseFormattedCurrency(monthlyRevenue);
        if (isNaN(revenue) || revenue <= 0) {
            alert('Por favor, informe um valor de faturamento válido.');
            return;
        }
        
        setIsAiLoading(true);
        setAiAnalysisResult('');
        try {
            const result = await getTaxRegimeComparison(revenue, businessActivity);
            setAiAnalysisResult(result);
        } catch (error) {
            console.error(error);
            setAiAnalysisResult("Ocorreu um erro ao buscar a análise da IA. Verifique sua chave de API.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    // Recalculate when profit margin changes
    useMemo(() => {
        if(comparisonResult) {
            handleAnalysis();
        }
    }, [profitMargin]);

    const formattedAiResult = aiAnalysisResult
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Módulo Fiscal Inteligente</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Tome decisões tributárias mais inteligentes. Simule e compare regimes tributários com base no perfil da sua empresa.
            </p>
            
            {!isModuleEnabled ? (
                <UpgradeTeaser 
                    title="Módulo Fiscal Inteligente"
                    description="Tome decisões tributárias mais inteligentes com a ajuda da IA. Este é um recurso de um plano superior, como o Enterprise."
                    icon={<AIIcon />}
                />
            ) : (
                <>
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Simulador de Regimes Tributários</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Preencha os dados para analisar o melhor regime para sua empresa.</p>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Faturamento Mensal Estimado (R$)</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        id="monthlyRevenue"
                                        value={monthlyRevenue}
                                        onChange={e => setMonthlyRevenue(formatCurrencyOnInput(e.target.value))}
                                        placeholder="50.000,00"
                                        className={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="businessActivity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Atividade Principal (Opcional)</label>
                                    <input
                                        type="text"
                                        id="businessActivity"
                                        value={businessActivity}
                                        onChange={e => setBusinessActivity(e.target.value)}
                                        placeholder="Ex: Serviços de TI, Comércio varejista..."
                                        className={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={handleAnalysis}
                                    className="w-full bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CalculatorIcon />
                                    Análise Rápida (Cálculo Local)
                                </button>
                                <button
                                    onClick={handleAiAnalysis}
                                    disabled={isAiLoading}
                                    className="w-full bg-green-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-green-400 disabled:cursor-wait"
                                >
                                    {isAiLoading ? <Spinner /> : <AIIcon />}
                                    {isAiLoading ? 'Analisando...' : 'Análise com IA (Gemini)'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {comparisonResult && (
                        <div className="space-y-6">
                             <Card>
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div className="md:col-span-2">
                                        <label htmlFor="profitMargin" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ajustar Margem de Lucro Estimada (para Lucro Real)</label>
                                        <div className="relative mt-1">
                                            <input
                                                type="range"
                                                id="profitMargin"
                                                min="1"
                                                max="100"
                                                value={profitMargin}
                                                onChange={e => setProfitMargin(e.target.value)}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                            />
                                            <span className="absolute -top-1 -right-1 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded-md">
                                                {profitMargin}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 dark:bg-green-900/30 border-green-500">
                                <CardContent className="pt-6 text-center">
                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">Recomendação (Cálculo Rápido)</h3>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300">{comparisonResult.recommendation}</p>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <RegimeCard result={comparisonResult.simples} isRecommended={comparisonResult.bestRegime === "Simples Nacional"} />
                                <RegimeCard result={comparisonResult.presumido} isRecommended={comparisonResult.bestRegime === "Lucro Presumido"} />
                                <RegimeCard result={comparisonResult.real} isRecommended={comparisonResult.bestRegime === "Lucro Real"} />
                            </div>
                        </div>
                    )}
                    
                    {(isAiLoading || aiAnalysisResult) && (
                        <Card className="mt-8">
                            <CardHeader>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <AIIcon /> Análise Detalhada com IA (Gemini)
                                </h2>
                            </CardHeader>
                            <CardContent>
                                {isAiLoading ? (
                                    <div className="flex flex-col items-center justify-center p-8">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Analisando dados com Gemini...</p>
                                    </div>
                                ) : (
                                    <div 
                                        className="prose prose-lg dark:prose-invert max-w-none prose-li:my-1" 
                                        dangerouslySetInnerHTML={{ __html: formattedAiResult }}
                                    ></div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const CalculatorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-4m-3 4h.01M9 14h.01M5 7h.01M5 11h.01M5 15h.01M19 7h-.01M19 11h-.01M19 15h.01M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>;
