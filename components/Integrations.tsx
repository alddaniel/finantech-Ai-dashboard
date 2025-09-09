

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import type { View, Company } from '../types';
import { VIEWS } from '../constants';

const MOCK_BANKS_TO_CONNECT = [
    { name: 'Itaú', logo: 'https://logo.clearbit.com/itau.com.br', connected: true },
    { name: 'Bradesco', logo: 'https://logo.clearbit.com/bradesco.com.br', connected: false },
    { name: 'Banco do Brasil', logo: 'https://logo.clearbit.com/bb.com.br', connected: true },
    { name: 'Santander', logo: 'https://logo.clearbit.com/santander.com.br', connected: false },
    { name: 'Nubank', logo: 'https://logo.clearbit.com/nubank.com.br', connected: true },
    { name: 'Caixa', logo: 'https://logo.clearbit.com/caixa.gov.br', connected: false },
];

const MOCK_AGGREGATORS = [
    { name: 'Pluggy', logo: 'https://logo.clearbit.com/pluggy.ai', description: 'Conecte todas as suas contas com o especialista em Open Finance.' },
    { name: 'Belvo', logo: 'https://logo.clearbit.com/belvo.com', description: 'Acesse dados financeiros de toda a América Latina.' },
];

interface IntegrationsProps {
    isAccountantModuleEnabled: boolean;
    setIsAccountantModuleEnabled: (enabled: boolean) => void;
    setActiveView: (view: View) => void;
    company?: Company;
}

const UpgradeTeaser: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <Card>
        <CardContent className="text-center py-12">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full h-20 w-20 flex items-center justify-center mx-auto text-indigo-500">
                {icon}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 max-w-xl mx-auto text-slate-600 dark:text-slate-400">{description}</p>
            <p className="mt-4 text-sm text-slate-500">Faça um upgrade para um plano superior para habilitar este módulo.</p>
        </CardContent>
    </Card>
);

export const Integrations: React.FC<IntegrationsProps> = ({ isAccountantModuleEnabled, setIsAccountantModuleEnabled, setActiveView, company }) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setUploadedFile(event.target.files[0]);
        }
    };
    
    const handleUpload = () => {
        if(uploadedFile){
            alert(`Arquivo "${uploadedFile.name}" importado com sucesso! (Simulação)`);
            setUploadedFile(null);
        }
    }
    
    const isIntegrationsModuleEnabled = company?.enabledModules.includes('integrations');

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrações Bancárias</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Conecte suas contas ou importe extratos para automatizar sua conciliação.
            </p>

            {isIntegrationsModuleEnabled ? (
                <>
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <OpenFinanceIcon/> Conexão via Open Finance (Agregadores)
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Utilize os melhores provedores para conectar suas contas de forma segura. Recomendamos Pluggy ou Belvo.</p>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {MOCK_AGGREGATORS.map(aggregator => (
                                <div key={aggregator.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4">
                                    <img src={aggregator.logo} alt={aggregator.name} className="h-12 w-12 bg-white p-1 rounded-full flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{aggregator.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{aggregator.description}</p>
                                        <button className="w-full text-sm bg-indigo-600 text-white font-semibold py-1.5 rounded-md hover:bg-indigo-700 transition-colors">
                                            Conectar via {aggregator.name}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                               Bancos Suportados
                            </h2>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Exemplos de instituições que podem ser conectadas através dos agregadores.</p>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {MOCK_BANKS_TO_CONNECT.map(bank => (
                                    <div key={bank.name} className={`border rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-3 ${bank.connected ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <img src={bank.logo} alt={bank.name} className="h-12 w-12 bg-white p-1 rounded-full" />
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{bank.name}</span>
                                        {bank.connected ? (
                                            <div className="w-full text-sm bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 font-bold py-1.5 rounded-md flex items-center justify-center gap-1.5">
                                                <CheckIcon/> Conectado
                                            </div>
                                        ) : (
                                             <div className="w-full text-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 font-semibold py-1.5 rounded-md">
                                                Disponível
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <UpgradeTeaser 
                    title="Conexão Bancária Automática"
                    description="Conecte suas contas via Open Finance para uma conciliação automática e em tempo real. Este é um recurso de um plano superior."
                    icon={<OpenFinanceIcon />}
                />
            )}

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UploadIcon/> Importar Extrato (CNAB/OFX)
                    </h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Faça o upload do arquivo de extrato fornecido pelo seu banco. Disponível em todos os planos.</p>
                </CardHeader>
                <CardContent className="pt-4">
                   <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".cnab,.ofx,.txt"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                            Escolher Arquivo
                        </label>
                        {uploadedFile && (
                             <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Arquivo selecionado: <span className="text-indigo-600">{uploadedFile.name}</span>
                            </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Formatos suportados: CNAB 240/400, OFX</p>
                        <button 
                            onClick={handleUpload} 
                            disabled={!uploadedFile}
                            className="mt-6 bg-green-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Importar Agora
                        </button>
                   </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ModulesIcon /> Módulos Adicionais
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ative funcionalidades extras para expandir as capacidades do sistema.</p>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Painel do Contador</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cria uma área exclusiva para contadores acessarem dados e solicitarem documentos.</p>
                        </div>
                        <label htmlFor="accountant-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="accountant-toggle" 
                                className="sr-only peer" 
                                checked={isAccountantModuleEnabled}
                                onChange={e => setIsAccountantModuleEnabled(e.target.checked)}
                                aria-checked={isAccountantModuleEnabled}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isAccountantModuleEnabled ? 'Ativo' : 'Inativo'}</span>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const OpenFinanceIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const UploadIcon = () => <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const ModulesIcon = () => <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;