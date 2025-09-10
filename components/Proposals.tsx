import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import type { Proposal, Contact, Project, ToastMessage } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface ProposalsProps {
    proposals: Proposal[];
    setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
    contacts: Contact[];
    selectedCompany: string;
    onOpenProposalModal: (proposal?: Proposal | null) => void;
    onOpenProjectModal: (project: null, fromProposal: Proposal) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const getStatusColor = (status: Proposal['status']): 'green' | 'yellow' | 'red' | 'blue' => {
    switch (status) {
        case 'Aprovada': return 'green';
        case 'Enviada': return 'blue';
        case 'Rascunho': return 'yellow';
        case 'Recusada': return 'red';
    }
};

const PROPOSAL_STAGES: Proposal['status'][] = ['Rascunho', 'Enviada', 'Aprovada', 'Recusada'];

const stageColors: Record<Proposal['status'], string> = {
    'Rascunho': 'border-yellow-500',
    'Enviada': 'border-blue-500',
    'Aprovada': 'border-green-500',
    'Recusada': 'border-red-500',
};

const ProposalCard: React.FC<{ 
    proposal: Proposal; 
    clientName?: string; 
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onClick: () => void;
    onGenerateProject: () => void;
    onDelete: () => void;
}> = ({ proposal, clientName, onDragStart, onClick, onGenerateProject, onDelete }) => {
    const totalValue = proposal.items.reduce((sum, item) => sum + item.value, 0);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, proposal.id)}
            className="relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow border-l-4"
            style={{ borderColor: stageColors[proposal.status].replace('border-', '') }}
            aria-label={`Proposta ${proposal.name}`}
        >
            <div onClick={onClick} className="cursor-pointer">
                <p className="font-bold text-gray-800 dark:text-white pr-8">{proposal.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{clientName || 'Cliente não encontrado'}</p>
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-2">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Criada em: {formatDate(proposal.createdAt)}</p>
            </div>
            {proposal.status === 'Aprovada' && (
                <button 
                    onClick={onGenerateProject}
                    className="w-full mt-3 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                >
                    <ProjectIcon /> Gerar Projeto
                </button>
            )}
             <button onClick={onDelete} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <TrashIcon />
            </button>
        </div>
    );
};

export const Proposals: React.FC<ProposalsProps> = ({ proposals, setProposals, contacts, selectedCompany, onOpenProposalModal, onOpenProjectModal, addToast }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<Proposal['status'] | null>(null);
    const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);


    const companyProposals = useMemo(() => {
        return proposals.filter(p => p.company === selectedCompany);
    }, [proposals, selectedCompany]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: Proposal['status']) => {
        e.preventDefault();
        setDragOverColumn(stage);
    };
    
    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Proposal['status']) => {
        e.preventDefault();
        if (draggedItemId) {
            setProposals(prevProposals =>
                prevProposals.map(p =>
                    p.id === draggedItemId ? { ...p, status: newStatus } : p
                )
            );
        }
        setDraggedItemId(null);
        setDragOverColumn(null);
    };

    const handleConfirmDelete = () => {
        if (!proposalToDelete) return;
        setProposals(prev => prev.filter(p => p.id !== proposalToDelete.id));
        addToast({
            type: 'success',
            title: 'Proposta Excluída!',
            description: `A proposta "${proposalToDelete.name}" foi removida com sucesso.`
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Funil de Propostas (CRM Comercial)</h1>
                <button
                    onClick={() => onOpenProposalModal(null)}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-center"
                >
                    <PlusIcon /> Adicionar Proposta
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {PROPOSAL_STAGES.map(stage => (
                    <div
                        key={stage}
                        onDragOver={(e) => handleDragOver(e, stage)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stage)}
                        className={`bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4 transition-colors ${dragOverColumn === stage ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}
                    >
                        <h2 className={`text-lg font-bold text-gray-700 dark:text-gray-200 pb-2 mb-4 border-b-2 ${stageColors[stage]}`}>{stage}</h2>
                        <div className="space-y-4 min-h-[200px]">
                            {companyProposals
                                .filter(p => p.status === stage)
                                .map(proposal => {
                                    const client = contacts.find(c => c.id === proposal.clientId);
                                    return (
                                        <ProposalCard 
                                            key={proposal.id} 
                                            proposal={proposal} 
                                            clientName={client?.name}
                                            onDragStart={handleDragStart} 
                                            onClick={() => onOpenProposalModal(proposal)}
                                            onGenerateProject={() => onOpenProjectModal(null, proposal)}
                                            onDelete={() => setProposalToDelete(proposal)}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={!!proposalToDelete}
                onClose={() => setProposalToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Proposta"
            >
                Tem certeza que deseja excluir a proposta <strong className="text-slate-800 dark:text-slate-100">"{proposalToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const ProjectIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;