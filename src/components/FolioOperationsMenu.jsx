import React from 'react';
import './FolioOperationsMenu.css';

const FolioOperationsMenu = ({ onClose, onSelectOperation }) => {
    const handleOperation = (operation) => {
        console.log('Selected operation:', operation);
        onSelectOperation(operation);
    };

    return (
        <div className="folio-ops-menu-overlay" onClick={onClose}>
            <div className="folio-ops-menu-modal" onClick={(e) => e.stopPropagation()}>
                <div className="folio-ops-menu-header">
                    <button className="folio-ops-back-btn" onClick={onClose}>
                        ←
                    </button>
                    <h3>Folio Operations</h3>
                </div>

                <div className="folio-ops-menu-body">
                    <div 
                        className="folio-ops-menu-item" 
                        onClick={() => handleOperation('routing-operation')}
                    >
                        Folio Routing Operation
                    </div>
                    <div 
                        className="folio-ops-menu-item" 
                        onClick={() => handleOperation('routing')}
                    >
                        Folio Routing
                    </div>
                </div>

                <div className="folio-ops-menu-footer">
                    <button className="folio-ops-cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="folio-ops-save-btn" onClick={onClose}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FolioOperationsMenu;
