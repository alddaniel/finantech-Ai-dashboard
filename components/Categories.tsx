import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { CategoryModal } from './CategoryModal';
import type { Category, View, ToastMessage } from '../types';
import { VIEWS } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoriesProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    selectedCompany: string;
    setActiveView: (view: View) => void;
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const CategoryList: React.FC<{
    title: string;
    items: Category[];
    onAdd: () => void;
    onEdit: (item: Category) => void;
    onDelete: (item: Category) => void;
}> = ({ title, items, onAdd, onEdit, onDelete }) => (
    <Card className="!p-0">
        <CardHeader className="p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <button onClick={onAdd} className="bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1">
                <PlusIcon /> Adicionar
            </button>
        </CardHeader>
        <CardContent className="p-0">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {items.map(item => (
                    <li key={item.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                        <div className="space-x-3">
                            <button onClick={() => onEdit(item)} className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm">Editar</button>
                            <button onClick={() => onDelete(item)} className="font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm">Excluir</button>
                        </div>
                    </li>
                ))}
                {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-gray-500">Nenhuma categoria cadastrada.</li>}
            </ul>
        </CardContent>
    </Card>
);

export const Categories: React.FC<CategoriesProps> = ({ categories, setCategories, selectedCompany, setActiveView, addToast }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [modalCategoryType, setModalCategoryType] = useState<'receita' | 'despesa'>('despesa');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const { expenseCategories, revenueCategories } = useMemo(() => {
        const companyCategories = categories.filter(c => c.company === selectedCompany);
        return {
            expenseCategories: companyCategories.filter(c => c.type === 'despesa').sort((a,b) => a.name.localeCompare(b.name)),
            revenueCategories: companyCategories.filter(c => c.type === 'receita').sort((a,b) => a.name.localeCompare(b.name)),
        };
    }, [categories, selectedCompany]);

    const handleOpenModal = (type: 'receita' | 'despesa', category: Category | null = null) => {
        setCategoryToEdit(category);
        setModalCategoryType(type);
        setModalOpen(true);
    };

    const handleSaveCategory = (data: { name: string }) => {
        if (categoryToEdit) {
            setCategories(categories.map(c => c.id === categoryToEdit.id ? { ...c, name: data.name } : c));
        } else {
            const newCategory: Category = {
                id: `cat${Date.now()}`,
                name: data.name,
                type: modalCategoryType,
                company: selectedCompany,
            };
            setCategories([...categories, newCategory]);
        }
    };

    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        addToast({
            type: 'success',
            title: 'Categoria Excluída!',
            description: `A categoria "${categoryToDelete.name}" foi removida.`
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <button
                    onClick={() => setActiveView(VIEWS.SETTINGS)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Voltar para Configurações
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Categorias</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <CategoryList
                    title="Categorias de Despesa"
                    items={expenseCategories}
                    onAdd={() => handleOpenModal('despesa')}
                    onEdit={(item) => handleOpenModal('despesa', item)}
                    onDelete={setCategoryToDelete}
                />
                <CategoryList
                    title="Categorias de Receita"
                    items={revenueCategories}
                    onAdd={() => handleOpenModal('receita')}
                    onEdit={(item) => handleOpenModal('receita', item)}
                    onDelete={setCategoryToDelete}
                />
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveCategory}
                categoryToEdit={categoryToEdit}
                categoryType={modalCategoryType}
            />

            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão de Categoria"
            >
                Tem certeza que deseja excluir a categoria <strong className="text-slate-800 dark:text-slate-100">"{categoryToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;