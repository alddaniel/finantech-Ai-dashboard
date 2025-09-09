import React, { useMemo } from 'react';
import type { Project } from '../types';

const parseDate = (dateStr: string): Date => {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(NaN);
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

const stageStatusColors: Record<string, { bg: string; border: string }> = {
    'Pendente': { bg: 'bg-yellow-400/70', border: 'border-yellow-500' },
    'Aprovado Cliente': { bg: 'bg-blue-400/70', border: 'border-blue-500' },
    'Aprovado Órgão Público': { bg: 'bg-purple-400/70', border: 'border-purple-500' },
// FIX: Corrected typo from "Concluído" to "Concluido" to match type.
    'Concluído': { bg: 'bg-green-400/70', border: 'border-green-500' },
};

// --- Icons ---
const iconClass = "w-4 h-4 mr-1.5 flex-shrink-0";

const ClockIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ThumbsUpIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.734V11.5a2.5 2.5 0 012.5-2.5h1.118c.224 0 .43.09.584.242l1.328 1.328zM7 11.5V21M3 11.5h4" /></svg>;
const BuildingIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h.01M12 3h.01M12 7h.01M12 11h.01M12 15h.01" /></svg>;
const CheckIcon = () => <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

const StageStatusIcon: React.FC<{ status: Project['stages'][0]['status'] }> = ({ status }) => {
    switch (status) {
        case 'Pendente': return <ClockIcon />;
        case 'Aprovado Cliente': return <ThumbsUpIcon />;
        case 'Aprovado Órgão Público': return <BuildingIcon />;
// FIX: Corrected typo from "Concluído" to "Concluido" to match type.
        case 'Concluído': return <CheckIcon />;
        default: return null;
    }
};


export const ProjectTimeline: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const { timelineStart, timelineEnd, totalMonths, months } = useMemo(() => {
        let minDate: Date | null = null;
        let maxDate: Date | null = null;

        projects.forEach(p => {
            p.stages.forEach(s => {
                const date = parseDate(s.dueDate);
                if (isNaN(date.getTime())) return;
                if (!minDate || date < minDate) minDate = date;
                if (!maxDate || date > maxDate) maxDate = date;
            });
        });

        if (!minDate || !maxDate) {
            minDate = new Date();
            minDate.setDate(1);
            maxDate = new Date(minDate);
            maxDate.setMonth(maxDate.getMonth() + 5);
        }
        
        const timelineStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        const timelineEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

        const monthList: { year: number, month: number, label: string }[] = [];
        let currentMonth = new Date(timelineStart);
        while (currentMonth <= timelineEnd) {
            monthList.push({
                year: currentMonth.getFullYear(),
                month: currentMonth.getMonth(),
                label: currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
            });
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        return {
            timelineStart,
            timelineEnd,
            totalMonths: monthList.length,
            months: monthList,
        };
    }, [projects]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 overflow-x-auto">
            <div className="min-w-[1200px]">
                {/* Header */}
                <div className="grid gap-px" style={{ gridTemplateColumns: `250px repeat(${totalMonths}, 1fr)` }}>
                    <div className="sticky left-0 bg-white dark:bg-slate-900 z-10 pb-2">
                         <h3 className="font-semibold text-gray-700 dark:text-gray-300">Projetos</h3>
                    </div>
                    {months.map(month => (
                        <div key={`${month.year}-${month.month}`} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {month.label}
                        </div>
                    ))}
                </div>
                {/* Body */}
                <div className="mt-2 space-y-3">
                    {projects.map(project => {
                        const sortedStages = [...project.stages].sort((a,b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime());
                        const projectStartDate = sortedStages.length > 0 ? parseDate(sortedStages[0].dueDate) : new Date();

                        return (
                            <div key={project.id} className="grid items-center gap-px" style={{ gridTemplateColumns: `250px repeat(${totalMonths}, 1fr)` }}>
                                <div className="sticky left-0 bg-white dark:bg-slate-900 z-10 font-bold text-gray-800 dark:text-gray-200 pr-4 truncate" title={project.name}>
                                    {project.name}
                                </div>
                                <div className="col-span-full -ml-[250px] h-full" style={{ gridColumn: '2 / -1' }}>
                                    <div className="relative h-full w-full">
                                    {sortedStages.map((stage, index) => {
                                        const stageStart = index === 0 ? projectStartDate : parseDate(sortedStages[index-1].dueDate);
                                        const stageEnd = parseDate(stage.dueDate);

                                        if (isNaN(stageStart.getTime()) || isNaN(stageEnd.getTime()) || stageStart > stageEnd) return null;

                                        const startMonthIndex = (stageStart.getFullYear() - timelineStart.getFullYear()) * 12 + stageStart.getMonth() - timelineStart.getMonth();
                                        const startDay = stageStart.getDate();
                                        const daysInStartMonth = getDaysInMonth(stageStart.getFullYear(), stageStart.getMonth());
                                        const leftOffset = (startMonthIndex + (startDay / daysInStartMonth)) / totalMonths * 100;

                                        const endMonthIndex = (stageEnd.getFullYear() - timelineStart.getFullYear()) * 12 + stageEnd.getMonth() - timelineStart.getMonth();
                                        const endDay = stageEnd.getDate();
                                        const daysInEndMonth = getDaysInMonth(stageEnd.getFullYear(), stageEnd.getMonth());
                                        const rightOffset = (endMonthIndex + (endDay / daysInEndMonth)) / totalMonths * 100;
                                        
                                        const width = Math.max(0, rightOffset - leftOffset);
                                        
                                        const { bg, border } = stageStatusColors[stage.status] || stageStatusColors['Pendente'];

                                        return (
                                            <div
                                                key={stage.id}
                                                className={`absolute h-8 top-1/2 -translate-y-1/2 rounded-md ${bg} border ${border} flex items-center px-2 text-xs font-semibold text-black/80 overflow-hidden`}
                                                style={{ left: `${leftOffset}%`, width: `${width}%` }}
                                                title={`${stage.name} - Status: ${stage.status} - Prazo: ${formatDate(stage.dueDate)}`}
                                            >
                                                <StageStatusIcon status={stage.status} />
                                                <span className="truncate">{stage.name}</span>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                                {/* Grid lines */}
                                {months.map((_, index) => (
                                    <div key={index} className="h-12 border-r border-gray-200 dark:border-gray-800"></div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};