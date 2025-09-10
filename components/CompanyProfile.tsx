import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { CompanyModal } from './CompanyModal';
import type { Company, User, View } from '../types';
import { VIEWS } from '../constants';

interface CompanyProfileProps {
    company: Company | undefined;
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    currentUser: User;
    setActiveView: (view: View) => void;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ company, companies, setCompanies, currentUser, setActiveView }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const isCurrentUserAdmin = currentUser.role === 'Admin';

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil da Empresa</h1>
                </div>
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        Nenhuma empresa selecionada.
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSaveCompany = (companyData: Company) => {
        setCompanies(prevCompanies =>
            prevCompanies.map(c => c.id === companyData.id ? companyData : c)
        );
    };

    return (
        <>
            <div className="space-y-6">
                 <div>
                    <button
                        onClick={() => setActiveView(VIEWS.SETTINGS)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Voltar para Configurações
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfil da Empresa</h1>
                </div>
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{company.name}</h2>
                        {isCurrentUserAdmin && (
                            <button onClick={() => setModalOpen(true)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                Editar
                            </button>
                        )}
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem label="Razão Social" value={company.name} />
                        <InfoItem label="CNPJ" value={company.cnpj} />
                        <InfoItem label="Endereço" value={`${company.address.street}, ${company.address.number} - ${company.address.neighborhood}`} />
                        <InfoItem label="Cidade/UF" value={`${company.address.city}, ${company.address.state}`} />
                        <InfoItem label="CEP" value={company.address.zip} />
                        <InfoItem label="Plano" value={company.plan} />
                    </CardContent>
                </Card>
            </div>
            <CompanyModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                companyToEdit={company}
                onSave={handleSaveCompany}
                companies={companies}
                isSuperAdmin={false} // Company admin cannot change plan from this view
            />
        </>
    );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
        <p className="mt-1 text-gray-900 dark:text-white font-semibold">{value}</p>
    </div>
);