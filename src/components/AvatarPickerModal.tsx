import React, { useRef } from 'react';
import { IconPicker } from './ui/IconPicker';

interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarUrl: string) => void;
    avatars: string[];
    title: string;
    customAvatars: string[];
    setCustomAvatars: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    avatars,
    title,
    customAvatars,
    setCustomAvatars,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert('Formato de arquivo inválido. Por favor, selecione uma imagem JPG, PNG ou WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Arquivo muito grande. Selecione uma imagem com menos de 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                // Prepend to show the newest first
                setCustomAvatars(prev => [result, ...prev]); 
            }
        };
        reader.readAsDataURL(file);
    };


    const handleSelect = (avatarUrl: string) => {
        onSelect(avatarUrl);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-2xl flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2 text-sm"
                    >
                        <UploadIcon />
                        Adicionar Imagem
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4">
                     {customAvatars.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Suas Imagens</h4>
                            <IconPicker 
                                onChange={handleSelect}
                                avatars={customAvatars}
                            />
                        </div>
                    )}
                    <div>
                         <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Padrão</h4>
                         <IconPicker 
                            onChange={handleSelect}
                            avatars={avatars}
                        />
                    </div>
                </div>
                 <div className="px-4 py-3 flex justify-end border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const UploadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;
