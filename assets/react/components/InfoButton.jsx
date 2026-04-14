import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InfoModal from './InfoModal';

function InfoButton({ slides }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className="info-btn"
                onClick={() => setOpen(true)}
                aria-label="Learn more"
            >
                ?
            </button>
            <InfoModal
                isOpen={open}
                slides={slides}
                onClose={() => setOpen(false)}
            />
        </>
    );
}

InfoButton.propTypes = {
    slides: PropTypes.arrayOf(PropTypes.shape({
        title:       PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        media:       PropTypes.string,
    })).isRequired,
};

export default InfoButton;
