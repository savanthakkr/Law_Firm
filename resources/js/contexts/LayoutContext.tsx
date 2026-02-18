import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type LayoutPosition = 'left' | 'right';

type LayoutContextType = {
    position: LayoutPosition;
    effectivePosition: LayoutPosition;
    updatePosition: (val: LayoutPosition) => void;
    isRtl: boolean;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [position, setPosition] = useState<LayoutPosition>('left');
    const [isRtl, setIsRtl] = useState<boolean>(false);

    useEffect(() => {
        const storedPosition = localStorage.getItem('layoutPosition') as LayoutPosition;

        if (storedPosition === 'left' || storedPosition === 'right') {
            setPosition(storedPosition);
        }
        
        // Check if the document is in RTL mode
        const checkRtl = () => {
            const rtl = document.documentElement.dir === 'rtl';
            setIsRtl(rtl);
        };
        
        // Initial check
        checkRtl();
        
        // Set up a mutation observer to detect changes to the dir attribute
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'dir') {
                    checkRtl();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        return () => observer.disconnect();
    }, []);

    const updatePosition = (val: LayoutPosition) => {
        setPosition(val);
        localStorage.setItem('layoutPosition', val);
    };
    
    // Calculate effective position based on RTL mode
    const effectivePosition: LayoutPosition = isRtl ? 
        (position === 'left' ? 'right' : 'left') : 
        position;

    return <LayoutContext.Provider value={{ position, effectivePosition, updatePosition, isRtl }}>{children}</LayoutContext.Provider>;
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) throw new Error('useLayout must be used within LayoutProvider');
    return context;
};
