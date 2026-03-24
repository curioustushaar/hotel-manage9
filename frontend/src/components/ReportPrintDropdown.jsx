import React, { useEffect, useRef, useState } from 'react';

const PRINT_FORMATS = [
    { key: 'a4', label: 'A4', icon: '📄', pageSize: '210mm 297mm', bodyWidth: '190mm' },
    { key: 'a5', label: 'A5', icon: '📃', pageSize: '148mm 210mm', bodyWidth: '130mm' },
    { key: 'thermal', label: 'Thermal', icon: '🧾', pageSize: '80mm auto', bodyWidth: '72mm' },
    { key: 'dotmatrix', label: 'Dot Matrix', icon: '🖨️', pageSize: '210mm auto', bodyWidth: '190mm' },
    { key: '3inch', label: '3 inch', icon: '📜', pageSize: '76mm auto', bodyWidth: '68mm' },
    { key: '2inch', label: '2 inch', icon: '🔖', pageSize: '58mm auto', bodyWidth: '50mm' },
];

const ensureStyleInjected = () => {
    if (document.getElementById('report-print-shared-css')) return;
    const style = document.createElement('style');
    style.id = 'report-print-shared-css';
    style.textContent = `
        .report-print-wrapper { position: relative; display: inline-block; }
        .report-print-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff;
            color: #1f2937;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 8px 12px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.18s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        .report-print-btn:hover { border-color: #cbd5e1; box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
        .report-print-btn.open { border-color: #e11d48; color: #e11d48; box-shadow: 0 4px 12px rgba(225,29,72,0.12); }
        .report-print-menu {
            position: absolute;
            top: calc(100% + 6px);
            right: 0;
            min-width: 180px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            padding: 10px;
            z-index: 20;
            max-height: 220px;
            overflow-y: auto;
        }
        .report-print-menu.align-left { left: 0; right: auto; }
        .rpm-header { font-size: 12px; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
        .rpm-option {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid transparent;
            border-radius: 8px;
            padding: 8px 10px;
            background: #f8fafc;
            color: #0f172a;
            cursor: pointer;
            font-weight: 700;
            text-align: left;
            transition: all 0.15s ease;
        }
        .rpm-option + .rpm-option { margin-top: 6px; }
        .rpm-option:hover { border-color: #e11d48; box-shadow: 0 6px 16px rgba(225,29,72,0.14); }
        .rpm-icon { font-size: 16px; }
        .rpm-label { font-size: 13px; }
    `;
    document.head.appendChild(style);
};

const ReportPrintDropdown = ({ buttonClass = '', label = 'Print', align = 'right', onPrint }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => { ensureStyleInjected(); }, []);

    useEffect(() => {
        const onClickAway = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickAway);
        return () => document.removeEventListener('mousedown', onClickAway);
    }, []);

    const applyFormatStyle = (fmt) => {
        const styleId = 'report-print-format-style';
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `@page { size: ${fmt.pageSize}; margin: 10mm; }\n@media print { body { width: ${fmt.bodyWidth}; margin: 0 auto; } }`;
        document.head.appendChild(style);
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    };

    const handlePrint = (formatKey) => {
        const fmt = PRINT_FORMATS.find(f => f.key === formatKey) || PRINT_FORMATS[0];
        const cleanup = applyFormatStyle(fmt);
        setOpen(false);
        setTimeout(() => {
            window.print();
            setTimeout(cleanup, 400);
            if (onPrint) onPrint(formatKey);
        }, 10);
    };

    return (
        <div className="report-print-wrapper" ref={wrapperRef}>
            <button
                className={`report-print-btn ${open ? 'open' : ''} ${buttonClass}`.trim()}
                onClick={() => setOpen(prev => !prev)}
            >
                🖨️ {label} {open ? '▲' : '▼'}
            </button>
            {open && (
                <div className={`report-print-menu ${align === 'left' ? 'align-left' : ''}`}>
                    <div className="rpm-header">Select Print Format</div>
                    {PRINT_FORMATS.map(fmt => (
                        <button key={fmt.key} className="rpm-option" onClick={() => handlePrint(fmt.key)}>
                            <span className="rpm-icon">{fmt.icon}</span>
                            <span className="rpm-label">{fmt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportPrintDropdown;
export { PRINT_FORMATS };
