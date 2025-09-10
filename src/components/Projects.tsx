import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProjectTimeline } from './ProjectTimeline'; // Import the new component
import { downloadPdfFromElement } from '../services/pdfService';
import type { Project, Contact, Transaction, ToastMessage } from '../types';
import { parseDate } from '../services/apiService';
import type { GroupingType } from './Reports';
import { ConfirmationModal } from './ConfirmationModal';

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return '-';
    }
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
};

interface ProjectsProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    contacts: Contact[];
    payables: Transaction[];
    receivables: Transaction[];
    selectedCompany: string;
    onOpenProjectModal: (project: Project | null) => void;
    startDate?: string;
    endDate?: string;
    groupingType?: GroupingType;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

const ProjectCard: React.FC<{
    project: Project;
    clientName?: string;
    profitability: number;
    totalBudget: number;
    budgetVsActual: number;
    costAllocationResult: { label: string; value: string };
    onEdit: () => void;
    onDelete: () => void;
}> = ({ project, clientName, profitability, totalBudget, budgetVsActual, costAllocationResult, onEdit, onDelete }) => {
    const getStatusBadge = (status: Project['status']) => {
        switch (status) {
            case 'Planejamento': return <Badge color="blue">Planejamento</Badge>;
            case 'Em Execução': return <Badge color="yellow">Em Execução</Badge>;
            case 'Concluído': return <Badge color="green">Concluído</Badge>;
        }
    };
    
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.type}</p>
                    </div>
                    {getStatusBadge(project.status)}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Cliente</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{clientName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Centro de Custo</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{project.costCenterName}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lucratividade Real do Projeto</p>
                    <p className={`text-2xl font-bold ${profitability >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(profitability)}</p>
                </div>
                 <div className="grid grid-cols-2 gap-4 text-sm text-center border-t border-slate-200 dark:border-slate-800 pt-4">
                    <div>
                        <p className="text-gray-500">Orçamento Total</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Orçam. vs. Realizado</p>
                        <p className={`font-semibold ${budgetVsActual >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                            {formatCurrency(budgetVsActual)} {budgetVsActual >= 0 ? '(Abaixo)' : '(Acima)'}
                        </p>
                    </div>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-gray-500">{costAllocationResult.label}</p>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{costAllocationResult.value}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Próximas Etapas</h4>
                    <ul className="space-y-2">
                        {project.stages.filter(s => s.status !== 'Concluído').slice(0, 2).map(stage => (
                            <li key={stage.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{stage.name}</span>
                                <span className="font-medium text-gray-500 dark:text-gray-400">{formatDate(stage.dueDate)}</span>
                            </li>
                        ))}
                         {project.stages.filter(s => s.status !== 'Concluído').length === 0 && (
                            <li className="text-sm text-gray-500 italic">Todas as etapas concluídas.</li>
                        )}
                    </ul>
                </div>
            </CardContent>
             <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                    onClick={onEdit}
                    className="flex-1 text-center font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Ver / Editar Detalhes
                </button>
                <div className="border-l border-slate-200 dark:border-slate-700 h-6 mx-2"></div>
                <button
                    onClick={onDelete}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    title="Excluir projeto"
                >
                    <TrashIcon />
                </button>
            </div>
        </Card>
    );
};

const PdfIcon = () => <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ExcelIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;


export const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, contacts, payables, receivables, selectedCompany, onOpenProjectModal, startDate, endDate, groupingType = 'none', addToast }) => {
    const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const companyProjects = useMemo(() => {
        let projs = projects.filter(p => p.company === selectedCompany);

        if (startDate && endDate) {
            const start = parseDate(startDate);
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                projs = projs.filter(p =>
                    p.stages.some(stage => {
                        const stageDate = parseDate(stage.dueDate);
                        if (isNaN(stageDate.getTime())) return false;
                        return stageDate >= start && stageDate <= end;
                    })
                );
            }
        }
        return projs;
    }, [projects, selectedCompany, startDate, endDate]);
    
    const groupedProjects = useMemo(() => {
        if (groupingType === 'none' || viewMode === 'timeline') {
            return { 'all': companyProjects };
        }
        
        const groupKey = groupingType === 'status' ? 'status' : 'costCenterName';

        return companyProjects.reduce((acc, proj) => {
            const key = proj[groupKey] || 'Não categorizado';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(proj);
            return acc;
        }, {} as Record<string, Project[]>);
    }, [companyProjects, groupingType, viewMode]);

    const handleDeleteRequest = (project: Project) => {
        const linkedTransactions = [...payables, ...receivables].filter(t => t.projectId === project.id).length;
        if (linkedTransactions > 0) {
            addToast({
                type: 'warning',
                title: 'Exclusão Bloqueada',
                description: `Este projeto não pode ser excluído pois está vinculado a ${linkedTransactions} transação(ões).`,
            });
            return;
        }
        setProjectToDelete(project);
    };

    const handleConfirmDelete = () => {
        if (!projectToDelete) return;
        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        addToast({
            type: 'success',
            title: 'Projeto Excluído!',
            description: `O projeto "${projectToDelete.name}" foi removido com sucesso.`
        });
        setProjectToDelete(null);
    };

    const handleExportCsv = () => {
        const headers = ['Nome do Projeto', 'Cliente', 'Status', 'Orçamento Total', 'Custo Realizado', 'Receita Realizada', 'Lucratividade'];
        const rows = companyProjects.map(proj => {
            const client = contacts.find(c => c.id === proj.clientId);
            const projectReceivables = receivables.filter(r => r.projectId === proj.id && r.status === 'Pago').reduce((sum, r) => sum + r.amount, 0);
            const actualCost = payables.filter(p => p.projectId === proj.id && p.status === 'Pago').reduce((sum, p) => sum + p.amount, 0);
            const profitability = projectReceivables - actualCost;
            const totalBudget = proj.budget.reduce((sum, item) => sum + item.cost, 0);
            
            return [
                `"${proj.name.replace(/"/g, '""')}"`,
                `"${(client?.name || 'N/A').replace(/"/g, '""')}"`,
                proj.status,
                totalBudget.toFixed(2).replace('.', ','),
                actualCost.toFixed(2).replace('.', ','),
                projectReceivables.toFixed(2).replace('.', ','),
                profitability.toFixed(2).replace('.', ',')
            ].join(';');
        });
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(";") + "\n"
            + rows.join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `projetos_${selectedCompany}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Projetos</h1>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleExportCsv}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <ExcelIcon /> Exportar CSV
                    </button>
                    <button 
                        onClick={() => downloadPdfFromElement('projects-printable-area', `projetos_${selectedCompany}.pdf`)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <PdfIcon /> Salvar PDF
                    </button>
                    <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                        <button onClick={() => setViewMode('cards')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            Visão por Cartões
                        </button>
                        <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-700 text-indigo-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            Visão Timeline
                        </button>
                    </div>
                    <button
                        onClick={() => onOpenProjectModal(null)}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <PlusIcon />
                        <span className="ml-2">Adicionar Projeto</span>
                    </button>
                </div>
            </div>
            <div id="projects-printable-area" className="printable-area">
                 {companyProjects.length === 0 ? (
                     <Card>
                        <CardContent className="text-center py-20">
                             <div className="bg-gray-100 dark:bg-gray-800/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                 <ProjectsIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Nenhum Projeto Cadastrado</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Adicione seu primeiro projeto para começar a gerenciar.</p>
                             <button onClick={() => onOpenProjectModal(null)} className="mt-6 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm">
                                Adicionar Projeto
                            </button>
                        </CardContent>
                    </Card>
                ) : viewMode === 'cards' ? (
                     <div className="space-y-6">
                        {Object.entries(groupedProjects).map(([groupName, projectsInGroup]) => (
                            <div key={groupName}>
                                {groupingType !== 'none' && (
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b-2 border-slate-300 dark:border-slate-700">
                                        {groupingType === 'status' ? `Situação: ${groupName}` : `Centro de Custo: ${groupName}`}
                                    </h2>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projectsInGroup.map(proj => {
                                        const client = contacts.find(c => c.id === proj.clientId);
                                        const projectReceivables = receivables.filter(r => r.projectId === proj.id).reduce((sum, r) => sum + r.amount, 0);
                                        const actualCost = payables.filter(p => p.projectId === proj.id).reduce((sum, p) => sum + p.amount, 0);
                                        const profitability = projectReceivables - actualCost;
                                        const totalBudget = proj.budget.reduce((sum, item) => sum + item.cost, 0);
                                        const budgetVsActual = totalBudget - actualCost;
                                        
                                        let costAllocationResult = { label: 'Custo Rateado', value: 'N/A' };
                                        switch (proj.allocationMethod) {
                                            case 'totalArea':
                                                if (proj.totalArea && proj.totalArea > 0) {
                                                    const costPerSqM = actualCost / proj.totalArea;
                                                    costAllocationResult = { label: 'Custo por m² (Área Total)', value: `${formatCurrency(costPerSqM)}` };
                                                } else {
                                                    costAllocationResult = { label: 'Custo por m² (Área Total)', value: 'Área não informada' };
                                                }
                                                break;
                                            case 'builtArea':
                                                if (proj.builtArea && proj.builtArea > 0) {
                                                    const costPerSqM = actualCost / proj.builtArea;
                                                    costAllocationResult = { label: 'Custo por m² (Área Constr.)', value: `${formatCurrency(costPerSqM)}` };
                                                } else {
                                                     costAllocationResult = { label: 'Custo por m² (Área Constr.)', value: 'Área não informada' };
                                                }
                                                break;
                                            case 'stages':
                                                if (proj.stages && proj.stages.length > 0) {
                                                    const costPerStage = actualCost / proj.stages.length;
                                                    costAllocationResult = { label: `Custo por Etapa (${proj.stages.length})`, value: `${formatCurrency(costPerStage)}` };
                                                } else {
                                                    costAllocationResult = { label: 'Custo por Etapa', value: 'Nenhuma etapa' };
                                                }
                                                break;
                                            default:
                                                costAllocationResult = { label: 'Custo Rateado', value: 'Não configurado' };
                                        }

                                        return (
                                           <ProjectCard 
                                                key={proj.id}
                                                project={proj}
                                                clientName={client?.name}
                                                profitability={profitability}
                                                totalBudget={totalBudget}
                                                budgetVsActual={budgetVsActual}
                                                costAllocationResult={costAllocationResult}
                                                onEdit={() => onOpenProjectModal(proj)}
                                                onDelete={() => handleDeleteRequest(proj)}
                                           />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ProjectTimeline projects={companyProjects} />
                )}
            </div>
            <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Projeto"
            >
                Tem certeza que deseja excluir o projeto <strong className="text-slate-800 dark:text-slate-100">"{projectToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const ProjectsIcon = () => <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
