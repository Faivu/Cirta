import React from 'react';
import PropTypes from 'prop-types';

function ResizeHandle({ onDragStart, onDrag }) {
    const handleMouseDown = (e) => {
        e.preventDefault();
        onDragStart(e.clientX);

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMove = (moveEvent) => onDrag(moveEvent.clientX);

        const onUp = () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    return <div className="panel-resize-handle" onMouseDown={handleMouseDown} />;
}

ResizeHandle.propTypes = {
    onDragStart: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
};

export default ResizeHandle;
