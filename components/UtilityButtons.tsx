import React from 'react';
import { ImportIcon, ExportIcon } from '../constants';

interface UtilityButtonsProps {
    onImport: () => void;
    onExport: () => void;
}

const BrutalistButton = ({ children, onClick, className = '' }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 border-2 bg-black text-white hover:bg-white hover:text-black transition-colors duration-150 ${className}`}
    >
        {children}
    </button>
);

export default function UtilityButtons({ onImport, onExport }: UtilityButtonsProps) {
    return (
        <div className="flex flex-col items-center w-full mt-auto mb-4 space-y-4">
            <BrutalistButton onClick={onImport} className="w-full flex flex-col items-center justify-center">
                <ImportIcon className="w-7 h-7" />
                <span className="text-xs mt-1 font-bold">İÇE AKTAR</span>
            </BrutalistButton>
            <BrutalistButton onClick={onExport} className="w-full flex flex-col items-center justify-center">
                <ExportIcon className="w-7 h-7" />
                <span className="text-xs mt-1 font-bold">DIŞA AKTAR</span>
            </BrutalistButton>
        </div>
    );
}