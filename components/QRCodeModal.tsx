import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Transaction } from '../types';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Simplified BRCode (PIX Copy/Paste) generator for simulation purposes.
// NOTE: This does not generate a valid, scannable BRCode. A real implementation
// would require a proper library or an API call to a payment provider.
const generatePixCode = (transaction: Transaction): string => {
    const amount = transaction.amount.toFixed(2);
    const merchantName = "FinanTech AI".substring(0, 25);
    const merchantCity = "SAO PAULO".substring(0, 15);
    const txid = `***${transaction.id}`.slice(-25); // Must be alphanumeric, max 25 chars.
    
    // Static parts of a BRCode
    const payloadFormatIndicator = '000201';
    const merchantAccountInfo = '26580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000'; // Example static key
    const merchantCategoryCode = '52040000';
    const transactionCurrency = '5303986'; // BRL
    const countryCode = '5802BR';
    const crc16 = '6304'; // Placeholder for CRC16

    const amountField = `54${String(amount.length).padStart(2, '0')}${amount}`;
    const merchantNameField = `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;
    const merchantCityField = `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;
    const txidField = `62${String(txid.length + 4).padStart(2, '0')}05${String(txid.length).padStart(2, '0')}${txid}`;

    const payload = `${payloadFormatIndicator}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${amountField}${countryCode}${merchantNameField}${merchantCityField}${txidField}${crc16}`;

    // Simple checksum for placeholder
    const checksum = 'A1B2'; 
    return payload + checksum;
};

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, transaction }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pixCode, setPixCode] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (isOpen && transaction && canvasRef.current) {
            const code = generatePixCode(transaction);
            setPixCode(code);
            QRCode.toCanvas(canvasRef.current, code, { width: 256, errorCorrectionLevel: 'H' }, (error) => {
                if (error) console.error("QR Code Generation Error:", error);
            });
        }
    }, [isOpen, transaction]);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixCode).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-slate-900/5 dark:ring-white/10 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pagar com PIX</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                    <p className="text-center text-slate-600 dark:text-slate-300">
                        Abra o aplicativo do seu banco e escaneie o código QR para pagar <strong className="text-slate-800 dark:text-slate-100">{formatCurrency(transaction.amount)}</strong>.
                    </p>
                    <div className="p-4 bg-white rounded-lg shadow-inner">
                        <canvas ref={canvasRef} />
                    </div>
                    <div className="w-full">
                        <label htmlFor="pix-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ou use o PIX Copia e Cola:</label>
                        <div className="relative mt-1">
                            <textarea
                                id="pix-code"
                                readOnly
                                value={pixCode}
                                rows={3}
                                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 resize-none"
                            />
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                                {copySuccess ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const CopyIcon = () => <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>;
const CheckIcon = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;