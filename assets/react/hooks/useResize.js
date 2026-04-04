import { useRef } from 'react';

const MIN_PANEL_WIDTH = 280;
const TOPBAR_WIDTH = 60;

export function useResize(sidebarWidth, setSidebarWidth) {
    const dragRef = useRef(null);

    const handleDragStart = (startX) => {
        dragRef.current = { startX, startWidth: sidebarWidth };
    };

    const handleDrag = (currentX) => {
        const delta = currentX - dragRef.current.startX;
        const maxWidth = window.innerWidth - TOPBAR_WIDTH - MIN_PANEL_WIDTH;
        const newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(dragRef.current.startWidth + delta, maxWidth));
        setSidebarWidth(newWidth);
    };

    return { handleDragStart, handleDrag };
}
