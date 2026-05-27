import { useEffect, useRef } from 'react';

const useEscapeKey = (callback: () => void) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callbackRef.current();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []); // Empty deps — uses ref for latest callback
};

export default useEscapeKey;
