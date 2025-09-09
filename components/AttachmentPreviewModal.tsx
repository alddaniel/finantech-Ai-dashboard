
import React, { useEffect, useState } from 'react';

interface Attachment {
    fileName: string;
    fileType: string;
    fileContent: string; // base64
}

interface AttachmentPreviewModalProps {
    attachment: Attachment;
    onClose: () => void;
}

const base64ToBlob = (base64: string, mimeType: string): Blob | null => {
    try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    } catch (e) {
        console.error("Error decoding base64 string. It might be malformed.", e);
        return null;
    }
};

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ attachment, onClose }) => {
    const [contentUrl, setContentUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!attachment) {
            setError("Anexo inválido.");
            return;
        }

        const blob = base64ToBlob(attachment.fileContent, attachment.fileType);

        if (!blob || blob.size === 0) {
            setError("Erro ao carregar o conteúdo do anexo. O arquivo pode estar corrompido ou o formato ser inválido.");
            return;
        }

        const url = URL.createObjectURL(blob);
        setContentUrl(url);

        // Cleanup function to revoke the object URL when the component unmounts or the attachment changes
        return () => {
            URL.revokeObjectURL(url);
            setContentUrl(null);
            setError(null);
        };
    }, [attachment]);

    const renderContent = () => {
        if (error) {
            return <p className="text-red-500">{error}</p>;
        }

        if (!contentUrl) {
            return <p className="text-slate-500">Carregando...</p>;
        }

        const { fileType, fileName } = attachment;

        if (fileType.startsWith('image/')) {
            return <img src={contentUrl} alt={fileName} className="max-w-full max-h-[70vh] object-contain" />;
        }
        
        if (fileType === 'text/plain') {
            return <iframe src={contentUrl} className="w-full h-[70vh] bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700" title={fileName}></iframe>;
        }

        return (
             <div className="text-center p-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">A visualização para este tipo de arquivo ({fileType}) não é suportada.</p>
                <button
                    onClick={() => {
                        const a = document.createElement('a');
                        a.href = contentUrl;
                        a.download = attachment.fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                    Baixar Arquivo
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-4xl flex flex-col my-8" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={attachment.fileName}>{attachment.fileName}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-4 overflow-auto flex items-center justify-center">
                    {renderContent()}
                </div>
                 <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                     <button
                        type="button"
                        onClick={onClose}
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-6 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                     >
                         Fechar
                     </button>
                </div>
            </div>
        </div>
    );
};
