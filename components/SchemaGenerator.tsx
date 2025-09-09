

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { getSchemaModification } from '../services/geminiService';

type DbType = 'postgres' | 'mysql';

const generateBaseSchema = (dialect: DbType): string => {
    const pkType = dialect === 'postgres' ? 'SERIAL PRIMARY KEY' : 'INT AUTO_INCREMENT PRIMARY KEY';
    const textType = dialect === 'postgres' ? 'TEXT' : 'TEXT';
    const timestampType = dialect === 'postgres' ? 'TIMESTAMP WITH TIME ZONE' : 'DATETIME';
    const jsonType = dialect === 'postgres' ? 'JSONB' : 'JSON';

    const schema = `
-- Schema generated for ${dialect} by FinanTech AI

CREATE TABLE companies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10)
);

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    avatar_url ${textType},
    accessible_companies ${jsonType}
);

CREATE TABLE contacts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    document VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255) NOT NULL,
    tax_regime VARCHAR(50),
    bank_details ${jsonType}
);

CREATE TABLE properties (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    owner_id VARCHAR(255) REFERENCES contacts(id),
    rental_details ${jsonType},
    sale_details ${jsonType},
    company VARCHAR(255) NOT NULL
);

CREATE TABLE bank_accounts (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    agency VARCHAR(20),
    account VARCHAR(20),
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    company VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    description ${textType} NOT NULL,
    category VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE,
    payment_date DATE,
    status VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL,
    recurrence ${jsonType},
    company VARCHAR(255) NOT NULL,
    cost_center VARCHAR(255),
    bank_account_id VARCHAR(255) REFERENCES bank_accounts(id),
    contact_id VARCHAR(255) REFERENCES contacts(id),
    property_id VARCHAR(255) REFERENCES properties(id),
    created_at ${timestampType} DEFAULT CURRENT_TIMESTAMP
);
`;
    return schema.trim();
};


export const SchemaGenerator: React.FC = () => {
    const [dbType, setDbType] = useState<DbType>('postgres');
    const [userPrompt, setUserPrompt] = useState('');
    const [generatedSchema, setGeneratedSchema] = useState(() => generateBaseSchema('postgres'));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const baseSchema = useMemo(() => generateBaseSchema(dbType), [dbType]);

    const handleDialectChange = (newDialect: DbType) => {
        setDbType(newDialect);
        setGeneratedSchema(generateBaseSchema(newDialect));
        setUserPrompt('');
        setError('');
    };

    const handleReset = useCallback(() => {
        setGeneratedSchema(baseSchema);
        setUserPrompt('');
        setError('');
    }, [baseSchema]);

    const handleGenerate = async () => {
        if (!userPrompt.trim()) {
            setError('Por favor, descreva a alteração desejada.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const newSchema = await getSchemaModification(generatedSchema, userPrompt, dbType);
            setGeneratedSchema(newSchema);
        } catch (e) {
            console.error(e);
            setError('Ocorreu um erro ao gerar o schema. Por favor, verifique sua chave de API e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([generatedSchema], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finantech_schema_${dbType}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assistente de Schema de Banco de Dados</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    Use a IA para criar ou modificar o schema SQL do seu banco de dados usando linguagem natural.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">1. Selecione o Dialeto Base</label>
                        <div className="mt-2 flex items-center gap-2">
                             <button onClick={() => handleDialectChange('postgres')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${dbType === 'postgres' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>PostgreSQL</button>
                             <button onClick={() => handleDialectChange('mysql')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${dbType === 'mysql' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>MySQL</button>
                        </div>
                    </div>
                    <div>
                         <label htmlFor="user-prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300">2. Descreva sua Alteração</label>
                         <textarea
                            id="user-prompt"
                            rows={4}
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder="Descreva as alterações ou novas tabelas que você deseja. Ex: 'Adicione uma coluna `phone_number` à tabela de usuários' ou 'Crie uma tabela `invoices` com id, amount, due_date e status'"
                            className="mt-1 block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 text-slate-900 dark:text-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                        <div className="flex items-center gap-2">
                             <button onClick={handleReset} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ResetIcon /> Resetar para Padrão
                            </button>
                            <button onClick={handleDownload} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <DownloadIcon /> Baixar Script SQL
                            </button>
                        </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-wait"
                        >
                            <AIIcon />
                            {isLoading ? 'Gerando com Gemini...' : 'Gerar com IA'}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Schema Gerado ({dbType})</h2>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">Aguarde, a IA está modificando o schema...</p>
                        </div>
                    ) : (
                        <pre className="text-sm bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto max-h-[600px] font-mono">
                            <code>{generatedSchema}</code>
                        </pre>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const AIIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const ResetIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>;