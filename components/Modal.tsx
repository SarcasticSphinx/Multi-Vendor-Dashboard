import React from 'react';

interface ModalProps {
    icon: React.ReactNode;
    color: string; 
    heading: string;
    description: string;
    detail?: string;
    buttonName: string;
    onCancel: () => void;
    onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({
    icon,
    color,
    heading,
    description,
    detail,
    buttonName,
    onCancel,
    onConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-sm shadow-xl w-full max-w-md p-8 flex flex-col items-center relative">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 ${color}`}>
                    {icon}
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-center">{heading}</h2>
                <p className="text-gray-500 text-center mb-1">{description}</p>
                {detail && (
                    <div className="text-lg font-medium text-center mt-2 mb-6">{detail}</div>
                )}
                <div className="flex gap-4 mt-4">
                    <button
                        className="flex items-center px-6 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-100 transition"
                        onClick={onCancel}
                        type="button"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                    <button
                        className="flex items-center px-6 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition"
                        onClick={onConfirm}
                        type="button"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2z" />
                        </svg>
                        {buttonName}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;