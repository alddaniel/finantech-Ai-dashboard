


import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { getFinancialAnalysis, getCostCuttingSuggestions } from '../services/geminiService';
import { MOCK_CASH_FLOW_DATA } from '../constants';
import type { Transaction } from '../types';

type AnalysisType = 'none' | 'predictive' | 'cost_cutting';

interface AIFinancialAdvisorProps {
    payables: Transaction[];
    receivables: Transaction[];
    selectedCompany: string;
}

export const AIFinancialAdvisor: React.FC<AIFinancialAdvisorProps> = ({ payables, receivables, selectedCompany }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType>('none');

    const handleAnalysis = async (type: AnalysisType) => {
        setIsLoading(true);
        setActiveAnalysis(type);
        setAnalysisResult('');
        let result = '';
        try {
            const companyPayables = payables.filter(p => p.company === selectedCompany);
            const companyReceivables = receivables.filter(r => r.company === selectedCompany);

            if (type === 'predictive') {
                if (companyReceivables.length === 0 && companyPayables.length === 0) {
                    result = "Não há dados financeiros suficientes para a análise preditiva. Por favor, adicione transações para a empresa selecionada.";
                } else {
                    result = await getFinancialAnalysis(MOCK_CASH_FLOW_DATA, companyReceivables, companyPayables);
                }
            } else if (type === 'cost_cutting') {
                 if (companyPayables.length === 0) {
                    result = "Não há despesas registradas para analisar. Adicione contas a pagar para obter sugestões de corte de custos.";
                } else {
                    result = await getCostCuttingSuggestions(companyPayables);
                }
            }
        } catch (error) {
            result = "Ocorreu um erro ao conectar com o serviço de IA. Verifique sua chave de API e tente novamente.";
            console.error(error);
        } finally {
            setAnalysisResult(result);
            setIsLoading(false);
        }
    };

    const formattedResult = analysisResult
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^- (.*)/gm, '<li class="ml-5 list-disc">$1</li>');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                <span className="text-indigo-500">Consultor Financeiro IA</span> com Gemini
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Obtenha insights e previsões inteligentes para otimizar a saúde financeira da sua empresa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnalysisCard
                    title="Análise Preditiva de Fluxo de Caixa"
                    description="Use IA para prever seu fluxo de caixa futuro, identificar tendências e se preparar para os próximos meses."
                    buttonText="Analisar Fluxo de Caixa"
                    icon={<TrendingUpIcon />}
                    onClick={() => handleAnalysis('predictive')}
                    isLoading={isLoading && activeAnalysis === 'predictive'}
                />
                <AnalysisCard
                    title="Sugestões para Corte de Custos"
                    description="Receba recomendações personalizadas para reduzir despesas sem comprometer sua operação."
                    buttonText="Sugerir Cortes de Custo"
                    icon={<ScissorsIcon />}
                    onClick={() => handleAnalysis('cost_cutting')}
                    isLoading={isLoading && activeAnalysis === 'cost_cutting'}
                />
            </div>
            
            {(isLoading || analysisResult) && (
                 <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {activeAnalysis === 'predictive' ? 'Análise Preditiva' : 'Sugestões de Corte de Custo'}
                        </h2>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Analisando dados com Gemini...</p>
                            </div>
                        ) : (
                            <div className="prose prose-lg dark:prose-invert max-w-none prose-li:my-1" dangerouslySetInnerHTML={{ __html: formattedResult }}></div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

interface AnalysisCardProps {
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, description, buttonText, icon, onClick, isLoading }) => (
    <Card className="flex flex-col">
        <CardContent className="flex-1">
            <div className="mb-4 text-indigo-500">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </CardContent>
        <div className="p-6 pt-0">
             <button
                onClick={onClick}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-wait"
            >
                {isLoading ? 'Processando...' : buttonText}
            </button>
        </div>
    </Card>
);

const TrendingUpIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;
const ScissorsIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.828 2.828a2 2 0 01-2.828 0L3 12m2.828-2.828a2 2 0 010 2.828L7.05 13.243m1.414-1.414L10 10.5m0 0l-1.586-1.586a2 2 0 010-2.828L10 4.5m0 6a2 2 0 002 2h3.5a2 2 0 002-2v-3.5a2 2 0 00-2-2h-3.5a2 2 0 00-2 2v3.5z"></path></svg>;