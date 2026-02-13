import React from 'react';
import './MoreOptionsMenu.css';

/**
 * MoreOptionsMenu - Now just a static "More Options" button with no functionality.
 * As per request to remove dropdown feature entirely but keep the button visible.
 */
const MoreOptionsMenu = ({ buttonLabel = "More Options", buttonClassName = "" }) => {
    return (
        <div className="more-options-menu-container">
            <button
                className={`more-options-btn ${buttonClassName}`}
                type="button"
                aria-disabled="true"
            >
                {buttonLabel}
            </button>
        </div>
    );
};

export default MoreOptionsMenu;
