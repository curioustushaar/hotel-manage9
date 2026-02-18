import React, { useState, useEffect } from 'react';
import API_URL_CONFIG from '../config/api';
import './OutletCurrentStatus.css';

const OutletCurrentStatus = () => {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000); // Auto-refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/guest-meal/analytics/outlet-status`);
            const data = await response.json();
            if (data.success) {
                setStatusData(data.data);
            }
        } catch (error) {
            console.error('Error fetching outlet status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !statusData) {
        return <div className="outlet-loading">Fetching live outlet status...</div>;
    }

    const { tables, kitchen } = statusData || {
        tables: { total: 0, occupied: 0, available: 0 },
        kitchen: { pending: 0, preparing: 0, ready: 0, avgPrepTime: 0, load: 'Low', staffLoad: 'Normal', delayRisk: 'Minimal' }
    };

    return (
        <div className="outlet-status-container">
            <div className="outlet-header">
                <div className="title-section">
                    <h1>Live Outlet Dashboard</h1>
                    <p>Real-time monitoring of restaurant floor and kitchen load</p>
                </div>
                <div className="live-indicator">
                    <span className="dot"></span>
                    LIVE
                </div>
            </div>

            <div className="outlet-grid">
                {/* SECTION 1: FLOOR STATUS */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <span className="icon">🪑</span>
                        <h3>Floor / Table Status</h3>
                    </div>
                    <div className="stats-row">
                        <div className="status-card highlight-blue">
                            <div className="status-value">{tables.total}</div>
                            <div className="status-label">Total Tables</div>
                        </div>
                        <div className="status-card highlight-red">
                            <div className="status-value">{tables.occupied}</div>
                            <div className="status-label">Occupied</div>
                        </div>
                        <div className="status-card highlight-green">
                            <div className="status-value">{tables.available}</div>
                            <div className="status-label">Available</div>
                        </div>
                    </div>
                    <div className="occupancy-meter">
                        <div className="meter-label">
                            <span>Occupancy Rate</span>
                            <span>{Math.round((tables.occupied / tables.total) * 100 || 0)}%</span>
                        </div>
                        <div className="meter-bg">
                            <div
                                className="meter-fill"
                                style={{ width: `${(tables.occupied / tables.total) * 100 || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: KITCHEN LOAD */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <span className="icon">👨‍🍳</span>
                        <h3>Kitchen Live Load</h3>
                    </div>
                    <div className="stats-row">
                        <div className="status-card highlight-orange">
                            <div className="status-value">{kitchen.pending}</div>
                            <div className="status-label">KOT Pending</div>
                        </div>
                        <div className="status-card highlight-yellow">
                            <div className="status-value">{kitchen.preparing}</div>
                            <div className="status-label">Preparing</div>
                        </div>
                        <div className="status-card highlight-green">
                            <div className="status-value">{kitchen.ready}</div>
                            <div className="status-label">Ready</div>
                        </div>
                    </div>
                    <div className="prep-time-metric">
                        <div className="metric-icon">⏱</div>
                        <div className="metric-details">
                            <span className="label">Avg. Prep Time</span>
                            <span className="value">{kitchen.avgPrepTime} mins</span>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: OPERATIONAL HEALTH */}
                <div className="dashboard-section full-width">
                    <div className="section-header">
                        <span className="icon">📈</span>
                        <h3>Operational Indicators</h3>
                    </div>
                    <div className="indicators-row">
                        <div className="indicator-col">
                            <div className="indicator-label">Kitchen Load</div>
                            <div className={`indicator-tag load-${kitchen.load.toLowerCase()}`}>
                                {kitchen.load}
                            </div>
                        </div>
                        <div className="indicator-col">
                            <div className="indicator-label">Staff Load</div>
                            <div className={`indicator-tag staff-${kitchen.staffLoad.toLowerCase()}`}>
                                {kitchen.staffLoad}
                            </div>
                        </div>
                        <div className="indicator-col">
                            <div className="indicator-label">Delay Risk</div>
                            <div className={`indicator-tag risk-${kitchen.delayRisk.toLowerCase()}`}>
                                {kitchen.delayRisk}
                            </div>
                        </div>
                    </div>
                    <div className="operational-tips">
                        <span className="tip-icon">💡</span>
                        <p>
                            {kitchen.delayRisk === 'High'
                                ? "Critical: Suggest inform guests about possible delays."
                                : kitchen.delayRisk === 'Moderate'
                                    ? "Notice: Kitchen is busy, monitor preparation timers."
                                    : "Healthy: Operations are running smoothly."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutletCurrentStatus;
