import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import type { Company, ModuleType, View } from '../types';
import { VIEWS } from '../constants';

interface PlanSubscriptionProps {
    company: Company | undefined;
    setActiveView: (view: View) => void;
}

const moduleLabels: Record<ModuleType, string> = {
    'properties': 'Gestão de Imóveis',
    'fiscal': 'Módulo Fiscal',
    'integrations': 'Integrações',
    'ai_advisor': 'Consultor IA',
    'projects': 'Projetos'
};

const planFeatures: Record<Company['plan'], string[]> = {
    'Basic': ['Funcionalidades Essenciais', 'Até 5 Usuários', 'Suporte Básico'],
    'Pro': ['Todas do Basic', 'Módulo de Imóveis', 'Relatórios Avançados', 'Suporte Prioritário'],
    'Enterprise': ['Todas do Pro', 'Módulo Fiscal e IA', 'Acesso Super Admin', 'Suporte Dedicado 24/7']
};

export const PlanSubscription: React.FC<PlanSubscriptionProps> = ({ company, setActiveView }) => {
    if (!company) {
        return (
            <div className="space-y-6">
                 <div>
                    <button
                        onClick={() => setActiveView(VIEWS.SETTINGS)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Voltar para Configurações
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plano & Assinatura</h1>
                </div>
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        Nenhuma empresa selecionada.
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => setActiveView(VIEWS.SETTINGS)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Voltar para Configurações
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plano & Assinatura</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Detalhes do seu plano atual para a empresa <span className="font-semibold text-indigo-500">{company.name}</span>.
            </p>
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Seu Plano Atual</p>
                        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mt-2">{company.plan}</h2>
                        <ul className="mt-6 space-y-2">
                            {(planFeatures[company.plan] || []).map(feature => (
                                <li key={feature} className="flex items-center gap-3">
                                    <CheckIcon />
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Módulos Ativos</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Funcionalidades extras habilitadas para este plano.</p>
                        <div className="mt-4 space-y-3">
                            {company.enabledModules.length > 0 ? company.enabledModules.map(module => (
                                <div key={module} className="flex items-center gap-2">
                                    <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                                        <CheckIcon className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{moduleLabels[module]}</span>
                                </div>
                            )) : <p className="text-sm text-gray-500 italic">Nenhum módulo adicional ativo.</p>}
                        </div>
                         <button className="mt-6 w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                            Gerenciar Assinatura
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const CheckIcon: React.FC<{className?: string}> = ({ className = 'w-5 h-5 text-indigo-500' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);