import React, { useState, useEffect, useMemo } from 'react';
import './UniversalReport.css';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import soundManager from '../../utils/soundManager';
import axios from 'axios';
import { io } from 'socket.io-client';
import API_URL from '../../config/api';
import ReportPrintDropdown, { PRINT_FORMATS } from '../../components/ReportPrintDropdown';

const ROOM_SECTION_DEFAULT_STATUSES = ['Available', 'Booked', 'Occupied', 'Under Maintenance'];

const parseDateLike = (value) => {
    if (value === null || value === undefined) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
        return value.getTime();
    }

    const raw = String(value).trim();
    if (!raw) return null;

    const normalized = raw.replace(/\s+/g, ' ');
    const direct = Date.parse(normalized);
    if (!isNaN(direct)) return direct;

    const dmy = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (dmy) {
        const dd = Number(dmy[1]);
        const mm = Number(dmy[2]) - 1;
        const yyyy = Number(dmy[3]);
        const hh = Number(dmy[4] || 0);
        const min = Number(dmy[5] || 0);
        const ss = Number(dmy[6] || 0);
        const ts = new Date(yyyy, mm, dd, hh, min, ss).getTime();
        return isNaN(ts) ? null : ts;
    }

    return null;
};

const getRowTimestamp = (row) => {
    if (!row || typeof row !== 'object') return null;

    const directKeys = ['_sortDate', 'createdAt', 'updatedAt', 'date'];
    for (const key of directKeys) {
        const ts = parseDateLike(row[key]);
        if (ts !== null) return ts;
    }

    for (let i = 1; i <= 12; i += 1) {
        const ts = parseDateLike(row[`val${i}`]);
        if (ts !== null) return ts;
    }

    return null;
};

const sortRowsLatestFirst = (rows) => {
    if (!Array.isArray(rows) || rows.length <= 1) return rows || [];

    return rows
        .map((row, index) => ({ row, index, ts: getRowTimestamp(row) }))
        .sort((a, b) => {
            const aHasTs = a.ts !== null;
            const bHasTs = b.ts !== null;
            if (aHasTs && bHasTs && a.ts !== b.ts) return b.ts - a.ts;
            if (aHasTs && !bHasTs) return -1;
            if (!aHasTs && bHasTs) return 1;
            return a.index - b.index;
        })
        .map(entry => entry.row);
};

const UniversalReport = ({ type }) => {
    const { user } = useAuth();
    const { settings, getCurrencySymbol, formatDate } = useSettings();
    const cs = getCurrencySymbol();
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({});
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
    const [rowPrintMenu, setRowPrintMenu] = useState(null);

    // Report configurations
    const reportConfig = {
        'reports-sales': {
            title: 'SALES REPORTS',
            tabs: ['Dine-In Orders', 'Room Service Orders', 'Take-Away Orders', 'Online Orders'],
            filters: ['Category', 'Item'],
            columns: ['Bill No', 'Date', 'Outlet', 'Table/Room', 'Guest', 'Item', 'Category', 'Qty', 'Rate', 'Amount', 'Tax', 'Net', 'Payment', 'Status']
        },
        'reports-payments': {
            title: 'PAYMENT REPORTS',
            tabs: ['Settled Bills', 'Discount'],
            filters: ['Cashier', 'Payment Mode', 'Shift'],
            columns: ['Bill No', 'Cashier', 'Mode', 'Amount', 'Status']
        },
        'reports-rooms': {
            title: 'ROOM REPORTS',
            tabs: ['Room Occupancy', 'Check-In / Check-Out', 'Room Revenue', 'Reservation', 'Cancellation'],
            filters: ['Room Type', 'Floor', 'Status'],
            columns: ['Room No', 'Guest', 'Check-In', 'Check-Out', 'Nights', 'Amount']
        },
        'reports-kitchen': {
            title: 'KITCHEN REPORTS',
            tabs: ['KOT Pending Time', 'Kitchen Delay', 'Preparation Time', 'Ready vs Delivered', 'Kitchen Load'],
            filters: ['Category', 'Order Type'],
            columns: ['KOT No', 'Item', 'Category', 'Start Time', 'Ready Time', 'Delay']
        },
        'reports-gst': {
            title: 'GST & TAX REPORTS',
            tabs: ['GST Summary', 'GST Item Wise', 'CGST / SGST / IGST', 'Taxable vs Non-Taxable'],
            filters: ['Tax Type'],
            columns: ['HSN', 'Description', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax']
        },
        'reports-staff': {
            title: 'STAFF REPORTS',
            tabs: ['Staff Order Count', 'Waiter Performance', 'Kitchen Staff Load', 'Service Time'],
            filters: ['Department', 'Staff Role'],
            columns: ['Staff', 'Orders', 'Amount', 'Avg Time']
        },
        'reports-billing': {
            title: 'BILLING REPORTS',
            tabs: ['Overview', 'Detailed Bills', 'Top Items'],
            filters: ['Order Type', 'Payment Method'],
            columns: ['Bill No', 'Date', 'Table / Room', 'Items', 'Amt', 'Tax', 'Disc', 'Total', 'Payment', 'Staff']
        },
        'reports-reservations': {
            title: 'RESERVATION REPORTS',
            tabs: ['Upcoming', 'Today', 'Completed', 'Guest History', 'Repeat Guests'],
            filters: ['Source', 'Table Type'],
            columns: ['Guest', 'Table / Area', 'Date', 'Time / Duration', 'Persons', 'Source', 'Status', 'Cancel Charge']
        },
        'reports-analytics': {
            title: 'ANALYTICS REPORTS',
            tabs: ['Overview'],
            filters: ['Metric'],
            columns: ['Metric', 'Value', 'Growth', 'Trend']
        }
    };

    const [activeTab, setActiveTab] = useState((reportConfig[type] || reportConfig['reports-sales']).tabs[0]);

    const getFilterOptionList = (filterName) => {
        const optionList = [];

        if (filterName !== 'Metric') {
            optionList.push({
                value: 'All',
                label: filterName === 'Status' ? 'All Status' : `All ${filterName}s`
            });
        }

        getOptionsForFilter(filterName).forEach((opt) => {
            if (typeof opt === 'object' && opt?.value !== undefined) {
                optionList.push({ value: opt.value, label: opt.label || String(opt.value) });
                return;
            }

            if (opt === 'All') return;
            optionList.push({ value: opt, label: String(opt) });
        });

        return optionList;
    };

    const getDynamicConfig = () => {
        let base = reportConfig[type] || reportConfig['reports-sales'];
        if (type === 'reports-billing') {
            if (activeTab === 'Top Items') {
                return { ...base, columns: ['#', 'Item Name', 'Category', 'Quantity Sold', 'Revenue'] };
            } else if (activeTab === 'Cancelled Bills') {
                return { ...base, columns: ['Bill No', 'Amount', 'Reason', 'Date'] };
            } else if (activeTab === 'Overview') {
                return { ...base, columns: [] }; // Hide table in overview
            }
        } else if (type === 'reports-payments' && activeTab === 'Discount') {
            return {
                ...base,
                columns: ['Bill No', 'Section', 'Cashier', 'Mode', 'Food GST', 'Service Charge', 'Discounted Items', 'Items', 'Discount', 'Net Payable', 'Paid']
            };
        } else if (type === 'reports-kitchen') {
            if (activeTab === 'KOT Pending Time') {
                return { ...base, columns: ['KOT No', 'Item', 'Category', 'Order Type', 'Start Time', 'Pending Time', 'Status'] };
            }
            if (activeTab === 'Kitchen Delay') {
                return { ...base, columns: ['KOT No', 'Item', 'Category', 'Order Type', 'Delay (Min)', 'Delay (HH:MM)', 'Status'] };
            }
            if (activeTab === 'Preparation Time') {
                return { ...base, columns: ['KOT No', 'Item', 'Category', 'Order Type', 'Start Time', 'Ready/Done', 'Prep Time'] };
            }
            if (activeTab === 'Ready vs Delivered') {
                return { ...base, columns: ['KOT No', 'Item', 'Category', 'Ready Time', 'Delivered Time', 'Gap', 'Stage'] };
            }
            if (activeTab === 'Kitchen Load') {
                return { ...base, columns: ['Station', 'Orders', 'Pending', 'Delayed', 'Avg Prep (Min)', 'Load Ratio %'] };
            }
        } else if (type === 'reports-gst') {
            if (activeTab === 'GST Summary') {
                return { ...base, columns: ['Tax Name', 'Applies To', 'Transactions', 'Taxable Value', 'Tax Rate', 'Tax Amount', 'Sources'] };
            }
            if (activeTab === 'GST Item Wise') {
                return { ...base, columns: ['Date', 'Source', 'Reference', 'Section', 'Tax Name', 'Rate', 'Taxable Value', 'Tax Amount'] };
            }
            if (activeTab === 'CGST / SGST / IGST') {
                return { ...base, columns: ['Date', 'Source', 'Reference', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax'] };
            }
            if (activeTab === 'Taxable vs Non-Taxable') {
                return { ...base, columns: ['Category', 'Transactions', 'Taxable Value', 'Tax Amount', 'Percentage'] };
            }
        }
        return base;
    };

    const config = getDynamicConfig();

    // Reset active tab when type changes
    useEffect(() => {
        setActiveTab(config.tabs[0]);
        setOpenFilterDropdown(null);
    }, [type]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const insideFilter = event.target.closest('.control-group-header.responsive-filter-group');
            if (!insideFilter) setOpenFilterDropdown(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (type === 'reports-kitchen') {
            const today = new Date();
            const from = new Date();
            from.setDate(today.getDate() - 30);
            setDateRange({
                from: from.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            });
        }
    }, [type]);

    const [roomOptions, setRoomOptions] = useState({ types: [], floors: [], statuses: [] });
    const [roomStatusOptions, setRoomStatusOptions] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [kitchenCategories, setKitchenCategories] = useState([]);
    const [tableTypes, setTableTypes] = useState(['General', 'AC', 'Non-AC', 'Garden']);
    const [billingSummary, setBillingSummary] = useState({ breakdowns: {}, topSelling: [], cancelledBills: [], summary: {} });
    const [resSummary, setResSummary] = useState({ summary: {}, distributions: {}, reservationList: [] });
    const [summaryStats, setSummaryStats] = useState({
        totalCollections: 0,
        totalPayouts: 0,
        netCashFlow: 0,
        openingBalance: 0,
        paymentsReceived: 0,
        paymentsCount: 0,
        paymentMethods: { cash: 0, card: 0, upi: 0, bankTransfer: 0 }
    });
    const [paymentInsights, setPaymentInsights] = useState({
        sectionSummary: [],
        totals: {
            totalDiscount: 0,
            totalRoomCharge: 0,
            totalRoomGst: 0,
            totalServiceCharge: 0,
            totalFood: 0,
            totalBeverage: 0,
            totalNetPayable: 0,
            totalPaid: 0
        }
    });
    const [kitchenInsights, setKitchenInsights] = useState({
        summary: {
            totalOrders: 0,
            kotPending: 0,
            preparingCount: 0,
            ordersReady: 0,
            deliveredCount: 0,
            avgPrepTime: 0,
            delayedCount: 0,
            kitchenLoadRatio: 0,
            readyVsDeliveredRatio: 0,
            kitchenLoadLabel: 'Low',
            staffLoadLabel: 'Normal',
            delayRiskLabel: 'Minimal'
        },
        tableStatus: { total: 0, occupied: 0, available: 0 },
        hourlyData: [],
        graphData: [],
        loadStations: []
    });
    const [gstInsights, setGstInsights] = useState({
        options: ['All', 'Room GST', 'Food GST', 'Service Charge'],
        totals: { taxableValue: 0, totalTax: 0, cgst: 0, sgst: 0, igst: 0 },
        sourceBreakdown: []
    });
    const [analyticsSummary, setAnalyticsSummary] = useState({
        totalMetrics: 0,
        upTrends: 0,
        downTrends: 0,
        stableTrends: 0
    });

    const getLocalConfiguredTaxes = () => {
        try {
            const raw = localStorage.getItem('taxes');
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(t => t && t.name)
                .map(t => ({
                    name: String(t.name),
                    value: Number(t.value) || 0,
                    type: String(t.type || 'PERCENTAGE'),
                    appliesTo: String(t.appliesTo || 'BILL'),
                    status: String(t.status || 'ACTIVE')
                }));
        } catch {
            return [];
        }
    };

    const isNoShowStatus = (statusValue) => {
        const normalized = String(statusValue || '')
            .trim()
            .toLowerCase()
            .replace(/[_\s-]+/g, '');
        return normalized === 'noshow';
    };

    const normalizeRoomStatus = (statusValue) => {
        const value = String(statusValue || '').trim();
        const lower = value.toLowerCase();

        if (!value) return '';
        if (isNoShowStatus(value)) return '';
        if (lower === 'booked' || lower === 'reserved') return 'Booked';
        if (lower.includes('maint')) return 'Under Maintenance';
        if (lower === 'occupied' || lower === 'in house' || lower === 'in_house') return 'Occupied';
        if (lower === 'available') return 'Available';

        return value;
    };

    const getEntityName = (entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (!entry || typeof entry !== 'object') return '';
        return String(entry.name || entry.roomType || entry.type || '').trim();
    };

    const dedupeTextList = (values = []) => {
        const seen = new Set();
        const out = [];

        values.forEach((value) => {
            const text = String(value || '').trim();
            if (!text) return;
            const key = text.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            out.push(text);
        });

        return out;
    };

    const createRoomStatusOptions = (statuses = []) => {
        const options = [];
        const seen = new Set();

        statuses.forEach((status) => {
            const raw = String(status || '').trim();
            const normalized = normalizeRoomStatus(raw);
            if (!normalized) return;

            if (isNoShowStatus(normalized)) return;

            const lowerNormalized = normalized.toLowerCase();
            if (!seen.has(lowerNormalized)) {
                seen.add(lowerNormalized);
                options.push({
                    label: normalized,
                    value: normalized
                });
            }
        });

        const preferredOrder = ['Available', 'Booked', 'Occupied', 'Under Maintenance'];
        options.sort((a, b) => {
            const ia = preferredOrder.indexOf(a.label);
            const ib = preferredOrder.indexOf(b.label);
            if (ia !== -1 || ib !== -1) {
                if (ia === -1) return 1;
                if (ib === -1) return -1;
                return ia - ib;
            }
            return a.label.localeCompare(b.label);
        });

        return options;
    };

    const loadRoomFilterOptions = async () => {
        try {
            const [optionsData, facilityTypesData, floorsData, roomsData] = await Promise.all([
                fetch(`${API_URL}/api/reports/rooms/options`).then(res => res.json()).catch(() => ({ success: false, data: {} })),
                fetch(`${API_URL}/api/facility-types/list`).then(res => res.json()).catch(() => ({ success: false, data: [] })),
                fetch(`${API_URL}/api/floors/list`).then(res => res.json()).catch(() => ({ success: false, data: [] })),
                fetch(`${API_URL}/api/rooms/list`).then(res => res.json()).catch(() => ({ success: false, data: [] }))
            ]);

            const roomTypeNames = dedupeTextList([
                ...((facilityTypesData.success ? facilityTypesData.data : []).map(getEntityName)),
                ...((optionsData.success ? optionsData.data?.types : []).map(getEntityName)),
                ...((roomsData.success ? roomsData.data : []).map(room => room?.roomType))
            ]);

            const floorNames = dedupeTextList([
                ...((floorsData.success ? floorsData.data : []).map(getEntityName)),
                ...((optionsData.success ? optionsData.data?.floors : []).map(getEntityName)),
                ...((roomsData.success ? roomsData.data : []).map(room => room?.floor))
            ]);

            const mergedStatuses = [
                ...ROOM_SECTION_DEFAULT_STATUSES,
                ...((optionsData.success ? optionsData.data?.statuses : []) || []),
                ...((roomsData.success ? roomsData.data : []).map(room => room?.status))
            ];

            const normalizedStatuses = dedupeTextList(
                mergedStatuses
                    .map(normalizeRoomStatus)
                    .filter(status => status && !isNoShowStatus(status))
            );

            setRoomOptions({
                types: roomTypeNames,
                floors: floorNames,
                statuses: normalizedStatuses
            });

            setRoomStatusOptions(createRoomStatusOptions(normalizedStatuses));
        } catch (err) {
            console.error('Error fetching room options:', err);
        }
    };

    // Fetch dynamic options based on report type
    useEffect(() => {
        if (type === 'reports-sales') {
            fetch(`${API_URL}/api/menu/list`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMenuItems(data.data);
                    }
                })
                .catch(err => console.error("Error fetching menu:", err));
        } else if (type === 'reports-rooms') {
            loadRoomFilterOptions();

            const intervalId = setInterval(() => {
                loadRoomFilterOptions();
            }, 30000);

            const onVisible = () => {
                if (!document.hidden) loadRoomFilterOptions();
            };
            document.addEventListener('visibilitychange', onVisible);

            return () => {
                clearInterval(intervalId);
                document.removeEventListener('visibilitychange', onVisible);
            };
        } else if (type === 'reports-reservations') {
            fetch(`${API_URL}/api/guest-meal/tables`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const defaults = ['General', 'AC', 'Non-AC', 'Garden'];
                        const fromDB = data.data
                            .map(t => (t.type || '').trim())
                            .filter(t => t.length > 1 && !t.toLowerCase().includes('burr'));
                        const merged = [...new Set([...defaults, ...fromDB])];
                        setTableTypes(merged);
                    }
                })
                .catch(err => console.error("Error fetching table types:", err));
        }
    }, [type]);

    // Derived dynamic items
    const selectedCategory = filters['Category'] || 'All';
    const dynamicCategories = ['Starters', 'Main Course', 'Breakfast', 'Rice', 'Desserts', 'Beverages', 'Chinese', 'Continental'];

    const getOptionsForFilter = (filterName) => {
        if (type === 'reports-analytics' && filterName === 'Metric') {
            return ['All Metrics', 'Revenue', 'Profit', 'Orders Count', 'Avg Bill Size', 'Orders per Hour', 'Table Turnover Rate', 'Table Utilization', 'Top Selling Items', 'Customer Count', 'Repeat Customer Rate'];
        }

        if (type === 'reports-rooms') {
            if (filterName === 'Room Type') return roomOptions.types || [];
            if (filterName === 'Floor') return roomOptions.floors || [];
            if (filterName === 'Status') {
                if (roomStatusOptions.length > 0) return roomStatusOptions;
                return createRoomStatusOptions(roomOptions.statuses || []);
            }
            return [];
        }

        if (type === 'reports-kitchen') {
            if (filterName === 'Category') return kitchenCategories;
            if (filterName === 'Order Type') return ['Dine-In', 'Room Order', 'Take Away', 'Online Order'];
            return [];
        }

        if (type === 'reports-gst') {
            if (filterName === 'Tax Type') return gstInsights.options || ['All', 'Room GST', 'Food GST', 'Service Charge'];
            return [];
        }

        if (type === 'reports-payments') {
            if (filterName === 'Payment Mode') return ['Cash', 'UPI', 'Card', 'Bank Transfer'];
            if (filterName === 'Shift') return ['Morning', 'Evening', 'Night'];
            if (filterName === 'Cashier') return ['Dine-In', 'Room', 'Take Away', 'Online Order'];
            return [];
        }

        if (type === 'reports-billing') {
            if (filterName === 'Order Type') return ['Dine-In', 'Take Away', 'Room Service', 'Delivery', 'Online'];
            if (filterName === 'Payment Method') return ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Add to Room'];
            if (filterName === 'Bill Status') return ['Paid', 'Pending', 'Cancelled'];
            return [];
        }

        if (type === 'reports-sales') {
            if (filterName === 'Category') return dynamicCategories;
            if (filterName === 'Item') {
                if (!menuItems.length) return ['No Items Loaded'];
                const filtered = selectedCategory === 'All'
                    ? menuItems
                    : menuItems.filter(i => i.category === selectedCategory);
                return filtered.map(item => item.itemName);
            }
        }

        if (type === 'reports-reservations') {
            if (filterName === 'Source') return [
                { label: 'All', value: 'All' },
                { label: 'Walk In', value: 'Walk-In' },
                { label: 'Phone Number', value: 'Phone' },
                { label: 'Online', value: 'Online' }
            ];
            if (filterName === 'Table Type') return tableTypes.filter(t => t && t.trim().length > 1 && !t.toLowerCase().includes('burr'));
        }

        return [];
    };

    const fetchSalesReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                outlet: activeTab === 'Dine-In Orders' ? 'Dine-In' : activeTab === 'Room Service Orders' ? 'Room Service' : activeTab === 'Take-Away Orders' ? 'Take Away' : activeTab === 'Online Orders' ? 'Online' : 'All',
                category: filters['Category'] || 'All',
                item: filters['Item'] || 'All',
                startDate: dateRange.from,
                endDate: dateRange.to
            };

            const res = await axios.get(`${API_URL}/api/sales-report`, { params: queryParams });
            if (res.data.success) {
                const mappedData = res.data.data.map((tx, idx) => ({
                    id: tx.id || idx,
                    val1: tx.billNo,
                    val2: tx.date ? new Date(tx.date).toLocaleString('en-GB') : '-',
                    val3: tx.outlet || '-',
                    val4: tx.roomNumber && tx.roomNumber !== '-' ? `Room ${tx.roomNumber}` : `Table ${tx.tableNumber || '-'}`,
                    val5: tx.guestName || '-',
                    val6: tx.itemName,
                    val7: tx.category || '-',
                    val8: tx.qty,
                    val9: `${cs}${parseFloat(tx.price || 0).toFixed(2)}`,
                    val10: `${cs}${parseFloat(tx.subtotal || 0).toFixed(2)}`,
                    val11: `${cs}${parseFloat(tx.tax || 0).toFixed(2)}`,
                    val12: `${cs}${parseFloat(tx.net || 0).toFixed(2)}`,
                    val13: `${tx.paymentMethod || '-'} (${tx.paymentStatus || '-'})`,
                    val14: tx.status || '-',
                    rawSubtotal: tx.subtotal,
                    paymentMethod: tx.paymentMethod || 'Cash'
                }));
                setReportData(mappedData);

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
                }
            }
        } catch (error) {
            console.error("Error fetching sales report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchPaymentReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                cashier: filters['Cashier'] || 'All',
                paymentMode: filters['Payment Mode'] || 'All',
                shift: filters['Shift'] || 'All',
                includeAllHistory: activeTab === 'Discount' ? 'true' : 'false'
            };

            const res = await axios.get(`${API_URL}/api/payment-report`, { params: queryParams });
            if (res.data.success) {
                if (activeTab === 'Discount') {
                    const discountPayload = res.data.discountReport || {};
                    const discountRows = discountPayload.rows || [];

                    const mappedDiscountData = discountRows.map((d, index) => ({
                        id: d.id || index,
                        val1: d.billNo,
                        val2: d.section,
                        val3: d.cashier,
                        val4: d.paymentMode,
                        val5: `${cs}${parseFloat(d.foodGst || 0).toFixed(2)}`,
                        val6: `${cs}${parseFloat(d.serviceCharge || 0).toFixed(2)}`,
                        val7: parseInt(d.discountedItemsCount || 0, 10),
                        val8: d.itemList || '-',
                        val9: `${cs}${parseFloat(d.discountAmount || 0).toFixed(2)}`,
                        val10: `${cs}${parseFloat(d.netPayable || 0).toFixed(2)}`,
                        val11: `${cs}${parseFloat(d.totalPaid || 0).toFixed(2)}`
                    }));

                    setReportData(mappedDiscountData);
                    setPaymentInsights({
                        sectionSummary: discountPayload.sectionSummary || [],
                        totals: discountPayload.totals || {
                            totalDiscount: 0,
                            totalRoomCharge: 0,
                            totalRoomGst: 0,
                            totalServiceCharge: 0,
                            serviceChargeBillsCount: 0,
                            totalFood: 0,
                            totalBeverage: 0,
                            totalFoodGst: 0,
                            totalDiscountedItems: 0,
                            totalNetPayable: 0,
                            totalPaid: 0
                        }
                    });

                    if (isManual && mappedDiscountData.length > 0) {
                        downloadCSV(mappedDiscountData, `Payment_Discount_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    }

                    return {
                        ...res.data,
                        totalTransactions: mappedDiscountData.length
                    };
                }

                if (activeTab === 'Refund') {
                    const refundRows = res.data.refundReport?.rows || [];
                    const mappedRefundData = refundRows.map((d, index) => ({
                        id: d.id || index,
                        val1: d.billNo,
                        val2: d.cashier,
                        val3: d.paymentMode,
                        val4: `${cs}${parseFloat(d.amount || 0).toFixed(2)}`,
                        val5: d.status || 'Refunded'
                    }));

                    setReportData(mappedRefundData);
                    setPaymentInsights(prev => ({ ...prev, sectionSummary: [] }));

                    if (isManual && mappedRefundData.length > 0) {
                        downloadCSV(mappedRefundData, `Payment_Refund_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    }

                    return {
                        ...res.data,
                        totalTransactions: mappedRefundData.length
                    };
                }

                const rawData = res.data.transactions || [];
                let filteredData = rawData;
                if (activeTab === 'Settled Bills') {
                    filteredData = rawData.filter(d => d.status === 'Completed' || d.status === 'Settled' || d.status === 'Closed');
                } else if (activeTab === 'Pending Bills') {
                    filteredData = rawData.filter(d => d.status === 'Pending' || d.status === 'Active');
                }

                const mappedData = filteredData.map((d, index) => ({
                    id: d.id || index,
                    val1: d.billNo,
                    val2: d.cashier,
                    val3: d.paymentMode,
                    val4: `${cs}${parseFloat(d.amount).toFixed(2)}`,
                    val5: d.status
                }));
                setReportData(mappedData);
                setPaymentInsights(prev => ({ ...prev, sectionSummary: [] }));

                const collectionTotal = filteredData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
                const paymentMethods = filteredData.reduce((acc, row) => {
                    const mode = String(row.paymentMode || '').toLowerCase();
                    const amount = parseFloat(row.amount) || 0;
                    if (mode.includes('cash')) acc.cash += amount;
                    else if (mode.includes('upi')) acc.upi += amount;
                    else if (mode.includes('card')) acc.card += amount;
                    else acc.bankTransfer += amount;
                    return acc;
                }, { cash: 0, card: 0, upi: 0, bankTransfer: 0 });

                setSummaryStats(prev => ({
                    ...prev,
                    totalCollections: collectionTotal,
                    netCashFlow: collectionTotal,
                    paymentsReceived: collectionTotal,
                    paymentsCount: filteredData.length,
                    paymentMethods
                }));

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`);
                }
                return res.data;
            }
        } catch (error) {
            console.error("Error fetching payment report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchAnalyticsReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const metricFilter = filters['Metric'] || 'All Metrics';
            const res = await axios.get(`${API_URL}/api/analytics-report`, {
                params: {
                    metric: metricFilter,
                    startDate: dateRange.from,
                    endDate: dateRange.to
                }
            });

            if (res.data.success) {
                const sourceRows = Array.isArray(res.data.data) ? res.data.data : [];
                const mappedData = sourceRows.map((item, idx) => ({
                    id: idx,
                    val1: item.metric,
                    val2: item.value,
                    val3: item.growth,
                    val4: item.trend
                }));
                setReportData(mappedData);

                const upTrends = sourceRows.filter(row => String(row.trend || '').toLowerCase() === 'up').length;
                const downTrends = sourceRows.filter(row => String(row.trend || '').toLowerCase() === 'down').length;
                const stableTrends = sourceRows.filter(row => String(row.trend || '').toLowerCase() === 'stable').length;
                setAnalyticsSummary({
                    totalMetrics: sourceRows.length,
                    upTrends,
                    downTrends,
                    stableTrends
                });

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Analytics_${metricFilter.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }
            }
        } catch (error) {
            console.error("Error fetching analytics report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchGstReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const customTaxes = getLocalConfiguredTaxes();
            const queryParams = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                taxType: filters['Tax Type'] || 'All',
                customTaxes: JSON.stringify(customTaxes)
            };

            const res = await axios.get(`${API_URL}/api/reports/gst`, { params: queryParams });
            if (res.data.success) {
                const options = ['All', 'Room GST', 'Food GST', 'Service Charge', ...(res.data.taxTypeOptions || [])];
                setGstInsights({
                    options: Array.from(new Set(options)),
                    totals: res.data.summaryTotals || { taxableValue: 0, totalTax: 0, cgst: 0, sgst: 0, igst: 0 },
                    sourceBreakdown: res.data.sourceBreakdown || []
                });

                let sourceRows = [];
                if (activeTab === 'GST Summary') sourceRows = res.data.gstSummary || [];
                else if (activeTab === 'GST Item Wise') sourceRows = res.data.gstItemWise || [];
                else if (activeTab === 'CGST / SGST / IGST') sourceRows = res.data.cgstSgstIgst || [];
                else if (activeTab === 'Taxable vs Non-Taxable') sourceRows = res.data.taxableVsNonTaxable || [];

                const mappedData = sourceRows.map((row, idx) => {
                    if (activeTab === 'GST Summary') {
                        return {
                            id: idx,
                            val1: row.taxName,
                            val2: row.appliesTo,
                            val3: row.transactions,
                            val4: `${cs}${(row.taxableValue || 0).toFixed(2)}`,
                            val5: `${(row.taxRate || 0).toFixed(2)}%`,
                            val6: `${cs}${(row.taxAmount || 0).toFixed(2)}`,
                            val7: row.sources || '-'
                        };
                    }
                    if (activeTab === 'GST Item Wise') {
                        return {
                            id: idx,
                            val1: row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-',
                            val2: row.source,
                            val3: row.reference,
                            val4: row.section,
                            val5: row.taxName,
                            val6: `${(row.rate || 0).toFixed(2)}%`,
                            val7: `${cs}${(row.taxableValue || 0).toFixed(2)}`,
                            val8: `${cs}${(row.taxAmount || 0).toFixed(2)}`
                        };
                    }
                    if (activeTab === 'CGST / SGST / IGST') {
                        return {
                            id: idx,
                            val1: row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-',
                            val2: row.source,
                            val3: row.reference,
                            val4: `${cs}${(row.taxableValue || 0).toFixed(2)}`,
                            val5: `${cs}${(row.cgst || 0).toFixed(2)}`,
                            val6: `${cs}${(row.sgst || 0).toFixed(2)}`,
                            val7: `${cs}${(row.igst || 0).toFixed(2)}`,
                            val8: `${cs}${(row.totalTax || 0).toFixed(2)}`
                        };
                    }

                    return {
                        id: idx,
                        val1: row.category,
                        val2: row.transactions,
                        val3: `${cs}${(row.taxableValue || 0).toFixed(2)}`,
                        val4: `${cs}${(row.taxAmount || 0).toFixed(2)}`,
                        val5: `${(row.percentage || 0).toFixed(1)}%`
                    };
                });

                setReportData(mappedData);
                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `GST_Report_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }
            }
        } catch (error) {
            console.error('Error fetching GST report:', error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchRoomReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                tab: activeTab,
                roomType: filters['Room Type'] || 'All',
                floor: filters['Floor'] || 'All',
                status: filters['Status'] || 'All',
                startDate: dateRange.from,
                endDate: dateRange.to
            };

            const res = await axios.get(`${API_URL}/api/reports/rooms`, { params: queryParams });
            if (res.data.success) {
                const mappedData = res.data.data.map((item, idx) => ({
                    id: idx,
                    val1: item.roomNo,
                    val2: item.guestName,
                    val3: item.checkIn,
                    val4: item.checkOut,
                    val5: item.nights,
                    val6: `${cs}${parseFloat(item.amount).toFixed(2)}`,
                    rawAmount: item.amount,
                    printPayload: {
                        billNo: item.roomNo ? `Room ${item.roomNo}` : 'Room Receipt',
                        guest: item.guestName || 'Guest',
                        orderType: 'Room Stay',
                        roomNumber: item.roomNo,
                        items: [],
                        subtotal: Number(item.amount || 0),
                        tax: 0,
                        serviceCharge: 0,
                        discount: 0,
                        finalAmount: Number(item.amount || 0),
                        netPayable: Number(item.amount || 0),
                        notes: `Nights: ${item.nights || 0}`
                    }
                }));
                setReportData(mappedData);

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Room_Report_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }

                if (activeTab === 'Room Revenue' || activeTab === 'Room Occupancy') {
                    let collections = 0;
                    mappedData.forEach(item => collections += (item.rawAmount || 0));
                    setSummaryStats(prev => ({
                        ...prev,
                        totalCollections: collections,
                        netCashFlow: collections,
                        paymentsReceived: collections,
                        paymentsCount: mappedData.length
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching room report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchKitchenReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                tab: activeTab,
                category: filters['Category'] || 'All',
                orderType: filters['Order Type'] || 'All',
                startDate: dateRange.from,
                endDate: dateRange.to
            };

            const res = await axios.get(`${API_URL}/api/reports/kitchen`, { params: queryParams });

            if (res.data.success) {
                if (res.data.categories && res.data.categories.length > 0) {
                    setKitchenCategories(res.data.categories);
                }

                const formatDuration = (mins) => {
                    const total = Math.max(0, Math.floor(Number(mins) || 0));
                    const h = Math.floor(total / 60);
                    const m = total % 60;
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                };

                let sourceRows = [];
                if (activeTab === 'KOT Pending Time') {
                    sourceRows = res.data.pendingItems || [];
                } else if (activeTab === 'Kitchen Delay') {
                    sourceRows = res.data.delayItems || [];
                } else if (activeTab === 'Preparation Time') {
                    sourceRows = res.data.prepItems || [];
                } else if (activeTab === 'Ready vs Delivered') {
                    sourceRows = res.data.readyVsDelivered?.rows || [];
                } else if (activeTab === 'Kitchen Load') {
                    sourceRows = res.data.kitchenLoad?.stations || [];
                }

                const mappedData = sourceRows.map((item, idx) => {
                    if (activeTab === 'KOT Pending Time') {
                        return {
                            id: idx,
                            val1: item.kotNo,
                            val2: item.itemName,
                            val3: item.category || '-',
                            val4: item.orderType,
                            val5: item.startTime,
                            val6: formatDuration(item.pendingMinutes),
                            val7: item.status
                        };
                    }
                    if (activeTab === 'Kitchen Delay') {
                        return {
                            id: idx,
                            val1: item.kotNo,
                            val2: item.itemName,
                            val3: item.category || '-',
                            val4: item.orderType,
                            val5: item.delayMinutes,
                            val6: formatDuration(item.delayMinutes),
                            val7: item.status
                        };
                    }
                    if (activeTab === 'Preparation Time') {
                        return {
                            id: idx,
                            val1: item.kotNo,
                            val2: item.itemName,
                            val3: item.category || '-',
                            val4: item.orderType,
                            val5: item.startTime,
                            val6: item.deliveredTime || item.readyTime,
                            val7: formatDuration(item.prepMinutes)
                        };
                    }
                    if (activeTab === 'Ready vs Delivered') {
                        return {
                            id: idx,
                            val1: item.kotNo,
                            val2: item.itemName,
                            val3: item.category || '-',
                            val4: item.readyTime,
                            val5: item.deliveredTime,
                            val6: item.deliveryGapLabel,
                            val7: item.stage
                        };
                    }
                    return {
                        id: idx,
                        val1: item.station,
                        val2: item.total,
                        val3: item.pending,
                        val4: item.delayed,
                        val5: item.avgPrep,
                        val6: item.loadRatio
                    };
                });

                setReportData(mappedData);

                setKitchenInsights({
                    summary: res.data.summary || {
                        totalOrders: 0,
                        kotPending: 0,
                        preparingCount: 0,
                        ordersReady: 0,
                        deliveredCount: 0,
                        avgPrepTime: 0,
                        delayedCount: 0,
                        kitchenLoadRatio: 0,
                        readyVsDeliveredRatio: 0,
                        kitchenLoadLabel: 'Low',
                        staffLoadLabel: 'Normal',
                        delayRiskLabel: 'Minimal'
                    },
                    tableStatus: res.data.tableStatus || { total: 0, occupied: 0, available: 0 },
                    hourlyData: res.data.hourlyData || [],
                    graphData: (activeTab === 'Ready vs Delivered' ? (res.data.readyVsDelivered?.graph || []) : (res.data.hourlyData || [])),
                    loadStations: res.data.kitchenLoad?.stations || []
                });

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Kitchen_Report_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }
            }
        } catch (error) {
            console.error("Error fetching kitchen report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchBillingReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                orderType: filters['Order Type'] || 'All',
                paymentMethod: filters['Payment Method'] || 'All',
                cashier: filters['Cashier'] || 'All',
                status: filters['Bill Status'] || 'All'
            };

            const res = await axios.get(`${API_URL}/api/reports/billing`, { params: queryParams });
            if (res.data.success) {
                const { summary, breakdowns, tableData, topSelling, cancelledBills } = res.data;
                let mappedData = [];
                if (activeTab === 'Top Items') {
                    mappedData = topSelling.map((item, idx) => ({
                        id: idx,
                        val1: idx + 1,
                        val2: item.name || item.itemName || 'Item',
                        val3: item.category || '-',
                        val4: item.qty || item.quantity || 0,
                        val5: `${cs}${(item.revenue || 0).toFixed(2)}`
                    }));
                } else if (activeTab === 'Cancelled Bills') {
                    mappedData = cancelledBills.map((item, idx) => ({
                        id: idx,
                        val1: item.billNo,
                        val2: `${cs}${(item.amount || 0).toFixed(2)}`,
                        val3: item.reason || 'Cancelled',
                        val4: item.date || new Date().toLocaleDateString()
                    }));
                } else {
                    mappedData = tableData.map((item, idx) => ({
                        id: item.orderId || idx,
                        val1: item.billNo,
                        val2: item.date,
                        val3: item.tableNo,
                        val4: item.items,
                        val5: `${cs}${Number(item.amount || 0).toFixed(2)}`,
                        val6: `${cs}${Number(item.tax || 0).toFixed(2)}`,
                        val7: `${cs}${Number(item.discount || 0).toFixed(2)}`,
                        val8: `${cs}${Number(item.total || 0).toFixed(2)}`,
                        val9: item.payment,
                        val10: item.staff,
                        printPayload: item.printData || null
                    }));
                }

                if (activeTab === 'Overview') {
                    setReportData([]);
                } else {
                    setReportData(mappedData);
                }
                setBillingSummary({ summary, breakdowns, topSelling, cancelledBills });

                setSummaryStats(prev => ({
                    ...prev,
                    totalCollections: summary.totalRevenue || 0,
                    netCashFlow: (summary.totalRevenue || 0) - (summary.totalPayouts || 0),
                    paymentsReceived: summary.totalRevenue || 0,
                    paymentsCount: summary.totalBills || 0
                }));

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Billing_Report_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }
            }
        } catch (error) {
            console.error("Error fetching billing report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchReservationReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                source: filters['Source'] || 'All',
                tableType: filters['Table Type'] || 'All',
                tab: activeTab
            };

            const res = await axios.get(`${API_URL}/api/reservation-report`, { params: queryParams });
            if (res.data.success) {
                const { summary, distributions, reservationList } = res.data;
                const mappedData = reservationList.map((item, idx) => ({
                    id: idx,
                    val1: item.guestName,
                    val2: item.tableName || item.table,
                    val3: item.date,
                    val4: `${item.startTime || ''} ${item.endTime ? '- ' + item.endTime : ''}`,
                    val5: item.guests,
                    val6: item.source === 'Phone' ? 'Phone Number' : item.source === 'Walk-In' ? 'Walk In' : (item.source || 'Phone'),
                    val7: item.status,
                    val8: `${cs}${(Number(item.cancellationCharge) || 0).toFixed(2)}`
                }));

                setReportData(mappedData);
                setResSummary({ summary, distributions, reservationList });
                setSummaryStats(prev => ({
                    ...prev,
                    totalCollections: Number(summary?.cancellationRevenue || 0),
                    netCashFlow: Number(summary?.cancellationRevenue || 0),
                    paymentsReceived: Number(summary?.cancellationRevenue || 0),
                    paymentsCount: Number(summary?.cancelledCount || 0)
                }));
            }
        } catch (error) {
            console.error("Error fetching reservation report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const downloadCSV = (data, filename) => {
        const headers = config.columns.join(',');
        const rows = data.map(row => config.columns.map((_, i) => `"${row[`val${i + 1}`] || ''}"`).join(','));
        const csvString = [headers, ...rows].join('\n');
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const fetchCurrentTab = async (isManual = false) => {
        if (type === 'reports-sales') return fetchSalesReport(isManual);
        if (type === 'reports-payments') return fetchPaymentReport(isManual);
        if (type === 'reports-analytics') return fetchAnalyticsReport(isManual);
        if (type === 'reports-gst') return fetchGstReport(isManual);
        if (type === 'reports-rooms') return fetchRoomReport(isManual);
        if (type === 'reports-kitchen') return fetchKitchenReport(isManual);
        if (type === 'reports-billing') return fetchBillingReport(isManual);
        if (type === 'reports-reservations') return fetchReservationReport(isManual);
        return null;
    };

    const handleGenerate = async () => {
        soundManager.play('click');
        await fetchCurrentTab(true);
    };

    const handleExport = async (format) => {
        soundManager.play('success');

        // Ensure current tab data is loaded for the selected date range before exporting/printing
        if (!sortedReportData || sortedReportData.length === 0) {
            await fetchCurrentTab(false);
        }

        if (format === 'Excel') {
            if (!sortedReportData || sortedReportData.length === 0) {
                alert("No data available to export for the selected dates.");
                return;
            }
            downloadCSV(sortedReportData, `${config.title.replace(/\s+/g, '_')}_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        } else if (format === 'PDF') {
            window.print();
        }
    };

    const showRowActions = (type === 'reports-billing' && activeTab === 'Detailed Bills') || type === 'reports-rooms';

    const getRowPrintPayload = (row) => {
        if (!row || typeof row !== 'object') return null;
        if (row.printPayload) return row.printPayload;
        if (row.printData) return row.printData;
        return null;
    };

    const openBillPrintWindow = (payload, formatKey) => {
        const fmt = PRINT_FORMATS.find(f => f.key === formatKey) || PRINT_FORMATS[0];
        const isNarrow = ['thermal', '3inch', '2inch'].includes(fmt.key);
        const fontSize = fmt.key === '2inch' ? '9px' : fmt.key === '3inch' ? '10px' : '11px';
        const logoSize = isNarrow ? '16px' : '24px';
        const windowWidth = isNarrow ? 360 : 760;

        const billNo = payload.billNo || payload.orderId || 'Bill';
        const guest = payload.guest || payload.guestName || 'Guest';
        const source = payload.tableNumber
            ? `Table ${payload.tableNumber}`
            : payload.roomNumber
                ? `Room ${payload.roomNumber}`
                : payload.orderType || 'Billing';

        const itemList = Array.isArray(payload.items) && payload.items.length > 0
            ? payload.items
            : [{ name: 'Item', qty: 1, amount: Number(payload.netPayable || payload.finalAmount || payload.total || 0) }];

        const subtotal = Number(payload.subtotal ?? 0);
        const taxAmount = Number(payload.tax ?? payload.taxAmount ?? 0);
        const serviceCharge = Number(
            payload.serviceCharge
            ?? payload.serviceChargeAmount
            ?? payload.billing?.serviceCharge
            ?? payload.billing?.serviceChargeAmount
            ?? 0
        );
        const discountAmount = Number(payload.discount ?? payload.discountAmount ?? 0);
        const taxRate = Number(payload.taxRate ?? settings?.foodGst ?? 0);
        const serviceRate = Number(settings?.serviceCharge ?? payload.serviceChargeRate ?? 0);
        const grandTotal = Number(payload.finalAmount ?? payload.total ?? (subtotal + taxAmount + serviceCharge));
        const netPayable = Number(payload.netPayable ?? grandTotal - discountAmount);
        const discountMeta = payload.discountMeta || {};
        const discountType = String(discountMeta.type || discountMeta.kind || payload.discountType || 'PERCENTAGE').toUpperCase();
        const discountValue = Number(discountMeta.value || payload.discountValue || discountAmount || 0);
        const discountLabel = discountType === 'PERCENTAGE'
            ? `${discountValue.toFixed(0)}%`
            : `${cs}${discountValue.toFixed(2)}`;
        const discountSource = discountMeta.source || payload.discountSource || '';

        const printedDate = formatDate ? formatDate(new Date().toISOString()) : new Date().toLocaleDateString();
        const printedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const companyAddress = [settings?.address, settings?.city, settings?.state, settings?.pin]
            .filter(Boolean)
            .join(', ');

        const logoNode = settings?.logoUrl
            ? `<img src="${settings.logoUrl}" alt="logo" style="max-height: ${logoSize}; object-fit: contain; margin-bottom: 6px;" />`
            : `<div class="logo-area">${settings?.name || 'Hotel'}</div>`;

        const itemRows = itemList.map(item => {
            const qty = Number(item.qty || item.quantity || 1);
            const amount = Number(item.amount || item.total || item.subtotal || 0);
            return `
                <tr>
                    <td class="col-item">${item.name || item.itemName || 'Item'}</td>
                    <td class="col-qty">${qty}</td>
                    <td class="col-amt">${cs} ${amount.toFixed(2)}</td>
                </tr>`;
        }).join('');

        const html = `<!DOCTYPE html>
        <html>
            <head>
                <title>Invoice ${billNo}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
                <style>
                    @page { size: ${fmt.pageSize}; margin: ${isNarrow ? '0' : '10mm'}; }
                    body {
                        font-family: ${fmt.key === 'dotmatrix' ? "'Courier New', monospace" : "'Inter', sans-serif"};
                        width: ${fmt.bodyWidth};
                        margin: ${isNarrow ? '4mm' : '10mm'} auto;
                        background: white;
                        color: #000;
                        font-size: ${fontSize};
                        line-height: 1.4;
                    }
                    .header { text-align: center; margin-bottom: 12px; }
                    .logo-area { font-size: ${logoSize}; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 2px; }
                    .subtitle { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #444; margin-bottom: 8px; }
                    .contact-info { font-size: 9px; color: #666; line-height: 1.2; }
                    .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
                    .bill-info { margin-bottom: 10px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .info-label { color: #666; }
                    .info-value { font-weight: 700; }
                    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                    th { text-align: left; border-bottom: 1.5px solid #000; padding: 6px 0; font-size: 10px; text-transform: uppercase; }
                    td { padding: 8px 0; vertical-align: top; border-bottom: 0.5px solid #eee; }
                    .col-qty { text-align: center; width: 10%; }
                    .col-amt { text-align: right; width: 30%; }
                    .col-item { width: 60%; font-weight: 500; }
                    .totals { margin-top: 8px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px; }
                    .grand-total {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 8px;
                        padding: 10px 0;
                        border-top: 2px solid #000;
                        border-bottom: 2.5px double #000;
                        font-size: 15px;
                        font-weight: 800;
                    }
                    .footer { margin-top: 20px; text-align: center; }
                    .thanks { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
                    .visit-again { font-size: 9px; color: #666; }
                    .barcode {
                        text-align: center;
                        margin-top: 15px;
                        font-family: 'Libre Barcode 39 Text', cursive;
                        font-size: 32px;
                        opacity: 0.8;
                    }
                    .timestamp { font-size: 8px; color: #999; margin-top: 15px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    ${logoNode}
                    <div class="subtitle">Premium Hospitality</div>
                    <div class="contact-info">
                        ${companyAddress || 'Hotel Address'}<br>
                        ${settings?.phone ? 'Ph: ' + settings.phone + ' | ' : ''}GSTIN: ${settings?.gstNumber || 'N/A'}
                    </div>
                </div>
                <div class="divider"></div>
                <div class="bill-info">
                    <div class="info-row">
                        <span class="info-label">Bill No:</span>
                        <span class="info-value">${billNo}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Guest:</span>
                        <span class="info-value">${guest}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Source:</span>
                        <span class="info-value">${source}</span>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="col-item">Item Description</th>
                            <th class="col-qty">Qty</th>
                            <th class="col-amt">Amount</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>${cs} ${subtotal.toFixed(2)}</span>
                    </div>
                    ${taxAmount > 0 ? `<div class="total-row">
                        <span>Food GST (${taxRate.toFixed(0)}%)</span>
                        <span>${cs} ${taxAmount.toFixed(2)}</span>
                    </div>` : ''}
                    ${serviceCharge > 0 ? `<div class="total-row">
                        <span>Service Charge (${serviceRate.toFixed(0)}%)</span>
                        <span>${cs} ${serviceCharge.toFixed(2)}</span>
                    </div>` : ''}
                    <div class="total-row">
                        <span>Grand Total</span>
                        <span>${cs} ${grandTotal.toFixed(2)}</span>
                    </div>
                    ${discountAmount > 0 ? `<div class="total-row">
                        <span>Discount${discountSource ? ` (${discountSource} - ${discountLabel})` : ` (${discountLabel})`}</span>
                        <span>- ${cs} ${discountAmount.toFixed(2)}</span>
                    </div>` : ''}
                    <div class="grand-total">
                        <span>NET PAYABLE</span>
                        <span>${cs} ${netPayable.toFixed(2)}</span>
                    </div>
                </div>
                ${payload.notes ? `
                <div class="divider"></div>
                <div style="font-style: italic; background: #f8f9fa; padding: 5px; border-left: 3px solid #000; font-size: 10px; margin-top: 10px;">
                    <strong>Note:</strong> ${payload.notes}
                </div>` : ''}
                <div class="footer">
                    <div class="thanks">${settings?.thankYouMessage || 'Thank You!'}</div>
                    <div class="visit-again">We hope to see you again soon.</div>
                    <div class="barcode">${String(billNo).replace('#', '')}</div>
                </div>
                <div class="timestamp">
                    Printed on: ${printedDate} ${printedTime}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
        </html>`;

        const printWindow = window.open('', '_blank', `height=600,width=${windowWidth}`);
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleRowPrint = (row, formatKey) => {
        setRowPrintMenu(null);
        const payload = getRowPrintPayload(row);
        if (!payload) {
            alert('Print data unavailable for this row. Please regenerate the report.');
            return;
        }
        openBillPrintWindow(payload, formatKey);
    };

    const sortedReportData = useMemo(() => sortRowsLatestFirst(reportData), [reportData]);

    const kitchenStatusPanel = useMemo(() => {
        const status = kitchenInsights.tableStatus || {};
        const typeStats = status.statusByType || {};
        const selectedType = filters['Order Type'] || 'All';

        if (selectedType === 'Dine-In') {
            const s = typeStats.dineIn || {};
            return {
                title: 'Floor / Table Status',
                columns: 6,
                cards: [
                    { label: 'Total Tables', value: status.totalTables || 0 },
                    { label: 'Occupied Tables', value: status.occupiedTables || 0 },
                    { label: 'Available Tables', value: status.availableTables || 0 },
                    { label: 'KOT Pending', value: s.pending || 0 },
                    { label: 'Preparing', value: s.preparing || 0 },
                    { label: 'Ready', value: s.ready || 0 }
                ]
            };
        }

        if (selectedType === 'Room Order') {
            const s = typeStats.roomOrder || {};
            return {
                title: 'Room Status',
                columns: 6,
                cards: [
                    { label: 'Total Rooms', value: status.totalRooms || 0 },
                    { label: 'Occupied Rooms', value: status.occupiedRooms || 0 },
                    { label: 'Available Rooms', value: status.availableRooms || 0 },
                    { label: 'KOT Pending', value: s.pending || 0 },
                    { label: 'Preparing', value: s.preparing || 0 },
                    { label: 'Ready', value: s.ready || 0 }
                ]
            };
        }

        if (selectedType === 'Take Away') {
            const s = typeStats.takeAway || {};
            return {
                title: 'Take Away Status',
                columns: 4,
                cards: [
                    { label: 'Total Orders', value: s.total || 0 },
                    { label: 'KOT Pending', value: s.pending || 0 },
                    { label: 'Preparing', value: s.preparing || 0 },
                    { label: 'Ready', value: s.ready || 0 }
                ]
            };
        }

        if (selectedType === 'Online Order') {
            const s = typeStats.onlineOrder || {};
            return {
                title: 'Online Order Status',
                columns: 4,
                cards: [
                    { label: 'Total Orders', value: s.total || 0 },
                    { label: 'KOT Pending', value: s.pending || 0 },
                    { label: 'Preparing', value: s.preparing || 0 },
                    { label: 'Ready', value: s.ready || 0 }
                ]
            };
        }

        return {
            title: 'All Status',
            columns: 7,
            cards: [
                { label: 'Total Tables', value: status.totalTables || 0 },
                { label: 'Total Rooms', value: status.totalRooms || 0 },
                { label: 'Dine-In', value: status.dineInOrders || 0 },
                { label: 'Take Away', value: status.takeAwayOrders || 0 },
                { label: 'Online Order', value: status.onlineOrders || 0 },
                { label: 'Occupied', value: status.occupied || 0 },
                { label: 'Available', value: status.available || 0 }
            ]
        };
    }, [filters, kitchenInsights.tableStatus]);

    const getKitchenToneClass = (label = '') => {
        const key = String(label || '').toLowerCase().trim();

        if (key.includes('available')) return 'tone-blue';
        if (key.includes('occupied')) return 'tone-slate';
        if (key.includes('dine')) return 'tone-orange';
        if (key.includes('take away')) return 'tone-amber';
        if (key.includes('online')) return 'tone-indigo';
        if (key.includes('pending')) return 'tone-red';
        if (key.includes('preparing')) return 'tone-rose';
        if (key.includes('ready')) return 'tone-green';
        if (key.includes('avg prep')) return 'tone-orange';
        if (key.includes('staff load')) return 'tone-purple';
        if (key.includes('delay risk')) return 'tone-red';
        if (key.includes('kitchen load ratio')) return 'tone-red';
        if (key.includes('total tables')) return 'tone-blue';
        if (key.includes('total rooms')) return 'tone-slate';
        if (key.includes('total orders')) return 'tone-orange';

        return 'tone-red';
    };

    useEffect(() => {
        const triggers = [type, activeTab, filters, dateRange.from, dateRange.to];
        if (type === 'reports-sales') fetchSalesReport();
        else if (type === 'reports-analytics') fetchAnalyticsReport();
        else if (type === 'reports-gst') fetchGstReport();
        else if (type === 'reports-rooms') fetchRoomReport();
        else if (type === 'reports-kitchen') fetchKitchenReport();
        else if (type === 'reports-billing') fetchBillingReport();
        else if (type === 'reports-reservations') fetchReservationReport();
        else if (type === 'reports-payments') {
            fetchPaymentReport(false).then(data => {
                if (data && data.success && activeTab === 'Settled Bills') {
                    setSummaryStats(prev => ({
                        ...prev,
                        totalCollections: data.totals?.totalAmount || 0,
                        netCashFlow: data.totals?.totalAmount || 0,
                        paymentsReceived: data.totals?.totalAmount || 0,
                        paymentsCount: data.totalTransactions || 0,
                        paymentMethods: {
                            cash: data.totals?.totalCash || 0,
                            card: data.totals?.totalCard || 0,
                            upi: data.totals?.totalUPI || 0,
                            bankTransfer: data.totals?.totalOther || 0
                        }
                    }));
                } else if (data && data.success && activeTab === 'Discount') {
                    const totals = data.discountReport?.totals || paymentInsights.totals;
                    setSummaryStats(prev => ({
                        ...prev,
                        totalCollections: totals?.totalNetPayable || 0,
                        netCashFlow: totals?.totalNetPayable || 0,
                        paymentsReceived: totals?.totalPaid || 0,
                        paymentsCount: data.totalTransactions || 0
                    }));
                }
            });
        }

        const socket = io(API_URL || window.location.origin);
        socket.on("salesUpdated", () => {
            if (type === 'reports-sales') fetchSalesReport();
            else if (type === 'reports-analytics') fetchAnalyticsReport();
            else if (type === 'reports-rooms') fetchRoomReport();
            else if (type === 'reports-kitchen') fetchKitchenReport();
            else if (type === 'reports-billing') fetchBillingReport();
            else if (type === 'reports-reservations') fetchReservationReport();
        });
        return () => socket.disconnect();
    }, [type, activeTab, filters, dateRange.from, dateRange.to]);

    // Summary processing for sales
    useEffect(() => {
        if (type === 'reports-sales' && reportData.length > 0) {
            let collections = 0;
            let pm = { cash: 0, card: 0, upi: 0, bankTransfer: 0 };
            reportData.forEach(item => {
                const amount = item.rawSubtotal || 0;
                collections += amount;
                const method = (item.paymentMethod || 'cash').toLowerCase();
                if (method.includes('card')) pm.card += amount;
                else if (method.includes('upi')) pm.upi += amount;
                else if (method.includes('bank') || method.includes('transfer')) pm.bankTransfer += amount;
                else pm.cash += amount;
            });
            setSummaryStats(prev => ({
                ...prev,
                totalCollections: collections,
                netCashFlow: collections,
                paymentsReceived: collections,
                paymentsCount: reportData.length,
                paymentMethods: pm
            }));
        }
    }, [reportData, type]);

    return (
        <div className="report-container">
            <header className="report-header">
                <div className="header-top">
                    <h1>{config.title}</h1>
                    <button className="btn-generate-top" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                <div className="header-filters-row">
                    <div className="date-filter-group">
                        <div className="filter-item">
                            <label>START DATE</label>
                            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
                        </div>
                        <div className="filter-item">
                            <label>END DATE</label>
                            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
                        </div>
                    </div>

                    {config.filters.map(filter => (
                        <div className="control-group-header" key={filter}>
                            <label>{filter}</label>
                            <div className={`control-group-header responsive-filter-group ${openFilterDropdown === filter ? 'open' : ''}`} data-filter={filter}>
                                {(() => {
                                    const selectedValue = filters[filter] || (type === 'reports-analytics' && filter === 'Metric' ? 'All Metrics' : 'All');
                                    const options = getFilterOptionList(filter);
                                    const selectedOption = options.find(opt => String(opt.value) === String(selectedValue));
                                    const selectedLabel = selectedOption?.label || String(selectedValue || 'Select');
                                    const isOpen = openFilterDropdown === filter;

                                    return (
                                        <>
                                            <button
                                                type="button"
                                                className={`responsive-select-trigger ${isOpen ? 'open' : ''}`}
                                                onClick={() => setOpenFilterDropdown(isOpen ? null : filter)}
                                                aria-expanded={isOpen}
                                                aria-label={`${filter} options`}
                                            >
                                                <span>{selectedLabel}</span>
                                                <span className="responsive-select-caret">▾</span>
                                            </button>

                                            {isOpen && (
                                                <div className="responsive-select-menu" role="listbox" aria-label={`${filter} list`}>
                                                    {options.map((opt) => {
                                                        const isActive = String(selectedValue) === String(opt.value);
                                                        return (
                                                            <button
                                                                key={`${filter}-${opt.value}`}
                                                                type="button"
                                                                className={`responsive-select-option ${isActive ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setFilters({ ...filters, [filter]: opt.value });
                                                                    setOpenFilterDropdown(null);
                                                                }}
                                                                role="option"
                                                                aria-selected={isActive}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="header-tabs">
                    {config.tabs.map(tab => (
                        <button key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="report-content">
                {type === 'reports-reservations' && (
                    <div className="reservation-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0px', marginBottom: '30px' }}>
                        <div className="summary-stat-card report-tone-blue">
                            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>📅</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.totalReservations || 0}</span>
                                <span className="stat-label">Total Reservations</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-green">
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>🕒</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.todayCount || 0}</span>
                                <span className="stat-label">Today's Reservations</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-amber">
                            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>👎</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.noShowCount || 0}</span>
                                <span className="stat-label">No Shows</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-red">
                            <div className="stat-icon" style={{ background: '#fee2e2', color: '#E31E24' }}>❌</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.cancelledCount || 0}</span>
                                <span className="stat-label">Cancellations</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-rose">
                            <div className="stat-icon" style={{ background: '#ffe4e6', color: '#be123c' }}>💸</div>
                            <div className="stat-info">
                                <span className="stat-value">{cs}{(resSummary.summary?.cancellationRevenue || 0).toFixed(2)}</span>
                                <span className="stat-label">Cancellation Revenue</span>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-reservations' && (
                    <div className="report-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px', marginBottom: '30px' }}>
                        <div className="overview-container-card">
                            <h3>⏰ Reservation Time Slots</h3>
                            <div className="breakdown-items" style={{ padding: '20px' }}>
                                {Object.entries(resSummary.distributions?.time || {}).map(([key, val]) => (
                                    <div key={key} className="breakdown-item received" style={{ marginBottom: '10px' }}>
                                        <span className="item-label">{key}</span>
                                        <div style={{ flex: 1, height: '10px', background: '#f1f5f9', margin: '0 15px', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#4f46e5', width: `${resSummary.summary?.totalReservations > 0 ? (val / resSummary.summary?.totalReservations * 100) : 0}%` }}></div>
                                        </div>
                                        <span className="item-value">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="overview-container-card">
                            <h3>📊 Reservations by Source</h3>
                            <div className="breakdown-items" style={{ padding: '20px' }}>
                                {Object.entries(resSummary.distributions?.source || {}).map(([key, val]) => {
                                    const label = key === 'Phone' ? 'Phone Number' : key === 'Walk-In' ? 'Walk In' : key;
                                    return (
                                        <div key={key} className="breakdown-item received" style={{ marginBottom: '10px' }}>
                                            <div style={{ width: '12px', height: '12px', background: key === 'Walk-In' ? '#ff3b3b' : '#3b82f6', borderRadius: '2px', marginRight: '8px' }}></div>
                                            <span className="item-label">{label}</span>
                                            <span className="item-value">{val} ({resSummary.summary?.totalReservations > 0 ? ((val / resSummary.summary?.totalReservations) * 100).toFixed(0) : 0}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-analytics' && (
                    <div className="analytics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0px', marginBottom: '24px' }}>
                        <div className="summary-stat-card report-tone-blue">
                            <div className="stat-info">
                                <span className="stat-value">{analyticsSummary.totalMetrics}</span>
                                <span className="stat-label">Total Metrics</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-green">
                            <div className="stat-info">
                                <span className="stat-value">{analyticsSummary.upTrends}</span>
                                <span className="stat-label">Up Trends</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-red">
                            <div className="stat-info">
                                <span className="stat-value">{analyticsSummary.downTrends}</span>
                                <span className="stat-label">Down Trends</span>
                            </div>
                        </div>
                        <div className="summary-stat-card report-tone-purple">
                            <div className="stat-info">
                                <span className="stat-value">{analyticsSummary.stableTrends}</span>
                                <span className="stat-label">Stable Trends</span>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-billing' && (
                    <>
                        {/* Summary Cards */}
                        <div className="billing-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0px', marginBottom: '24px' }}>
                            <div className="summary-stat-card billing-summary-card billing-summary-card-1">
                                <div className="stat-icon billing-summary-icon">🧾</div>
                                <div className="stat-info">
                                    <span className="stat-value">{billingSummary.summary?.totalBills || 0}</span>
                                    <span className="stat-label">Total Bills</span>
                                </div>
                            </div>
                            <div className="summary-stat-card billing-summary-card billing-summary-card-2">
                                <div className="stat-icon billing-summary-icon">💰</div>
                                <div className="stat-info">
                                    <span className="stat-value">{cs}{(billingSummary.summary?.totalRevenue || 0).toFixed(0)}</span>
                                    <span className="stat-label">Total Revenue</span>
                                </div>
                            </div>
                            <div className="summary-stat-card billing-summary-card billing-summary-card-3">
                                <div className="stat-icon billing-summary-icon">📊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{cs}{billingSummary.summary?.totalBills > 0 ? ((billingSummary.summary?.totalRevenue || 0) / billingSummary.summary?.totalBills).toFixed(0) : 0}</span>
                                    <span className="stat-label">Avg Bill Value</span>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'Overview' && (
                            <>
                        {/* Payment Method + Order Type Breakdown */}
                        <div className="billing-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px', marginBottom: '24px' }}>
                            <div className="overview-container-card">
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#e0e7ff', borderRadius: '8px', padding: '4px 8px' }}>💳</span> Payment Method
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px' }}>
                                    {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Add to Room'].map(method => {
                                        const val = billingSummary.breakdowns?.payment?.[method] || 0;
                                        const total = billingSummary.summary?.totalRevenue || 1;
                                        const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                                        const colors = { 'Cash': '#22c55e', 'UPI': '#3b82f6', 'Card': '#8b5cf6', 'Bank Transfer': '#f59e0b', 'Add to Room': '#ef4444' };
                                        return (
                                            <div key={method} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{method}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: colors[method], background: colors[method] + '20', padding: '2px 6px', borderRadius: '4px' }}>{pct}%</span>
                                                </div>
                                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{cs}{val.toFixed(0)}</span>
                                                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: colors[method], width: `${pct}%`, transition: 'width 0.5s ease' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="overview-container-card">
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#dcfce7', borderRadius: '8px', padding: '4px 8px' }}>🍽️</span> Order Type Revenue
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {['Dine-In', 'Take Away', 'Room Service', 'Delivery', 'Online'].map(otype => {
                                        const val = billingSummary.breakdowns?.orderType?.[otype] || 0;
                                        const total = billingSummary.summary?.totalRevenue || 1;
                                        const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                                        const colors = { 'Dine-In': '#6366f1', 'Take Away': '#f59e0b', 'Room Service': '#ec4899', 'Delivery': '#10b981', 'Online': '#3b82f6' };
                                        return (
                                            <div key={otype} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: colors[otype] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[otype] }}></div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{otype}</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: colors[otype] }}>{cs}{val.toFixed(0)}</span>
                                                    </div>
                                                    <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', background: colors[otype], width: `${pct}%`, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '11px', color: '#9ca3af', width: '30px', textAlign: 'right' }}>{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Items Mini Section (Visible only in Overview) */}
                        {(billingSummary.topSelling || []).length > 0 && (
                            <div className="overview-container-card" style={{ marginBottom: '24px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#fef3c7', borderRadius: '8px', padding: '4px 8px' }}>🏆</span> Top Selling Items Overview
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>#</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Item</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Category</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Qty Sold</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(billingSummary.topSelling || []).slice(0, 8).map((item, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                    <td style={{ padding: '10px 14px', color: i < 3 ? '#f59e0b' : '#94a3b8', fontWeight: 700 }}>
                                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                    </td>
                                                    <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 600 }}>{item.name || item.itemName || 'Item'}</td>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.category || '-'}</span>
                                                    </td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#1e293b', fontWeight: 600 }}>{item.qty || item.quantity || 0}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#22c55e', fontWeight: 700 }}>{cs}{(item.revenue || 0).toFixed(0)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                    </>
                )}

                {['reports-sales', 'reports-rooms'].includes(type)
                    || (type === 'reports-payments' && activeTab === 'Settled Bills') ? (
                    <div className="summary-overview-section">
                        <h2 className="section-title">SUMMARY OVERVIEW</h2>
                        <div className="overview-container-card">
                            <div className="overview-sub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0px' }}>
                                <div className="overview-sub-card report-tone-green">
                                    <div className="overview-icon-box green-icon">💰</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Total Collections</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.totalCollections.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="overview-sub-card report-tone-rose">
                                    <div className="overview-icon-box pink-icon">💸</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Payments Received</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.paymentsReceived.toFixed(2)}</span>
                                        <span className="overview-count">{summaryStats.paymentsCount} payments</span>
                                    </div>
                                </div>
                                <div className="overview-sub-card report-tone-blue">
                                    <div className="overview-icon-box blue-icon">💳</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Net Cash Flow</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.netCashFlow.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {type === 'reports-kitchen' && (
                    <div className="summary-overview-section kitchen-compact-section" style={{ marginBottom: '20px' }}>
                        <h2 className="section-title">KITCHEN LIVE SNAPSHOT</h2>

                        <div className="kitchen-snapshot-top-grid">
                            <div className="overview-container-card">
                                <h3 style={{ margin: 0, marginBottom: '12px', color: '#334155' }}>{kitchenStatusPanel.title}</h3>
                                <div className="kitchen-metric-grid" style={{ gridTemplateColumns: `repeat(${kitchenStatusPanel.columns}, minmax(110px, 1fr))` }}>
                                    {kitchenStatusPanel.cards.map((card, index) => (
                                        <div key={index} className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass(card.label)}`}>
                                            <div className="stat-info">
                                                <span className="stat-label">{card.label}</span>
                                                <span className="stat-value">{card.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="overview-container-card">
                                <h3 style={{ margin: 0, marginBottom: '12px', color: '#334155' }}>Kitchen Live Load</h3>
                                <div className="kitchen-metric-grid">
                                    <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('KOT Pending')}`}><div className="stat-info"><span className="stat-label">KOT Pending</span><span className="stat-value">{kitchenInsights.summary?.kotPending || 0}</span></div></div>
                                    <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Preparing')}`}><div className="stat-info"><span className="stat-label">Preparing</span><span className="stat-value">{kitchenInsights.summary?.preparingCount || 0}</span></div></div>
                                    <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Ready')}`}><div className="stat-info"><span className="stat-label">Ready</span><span className="stat-value">{kitchenInsights.summary?.ordersReady || 0}</span></div></div>
                                    <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Avg Prep')}`}><div className="stat-info"><span className="stat-label">Avg Prep</span><span className="stat-value">{kitchenInsights.summary?.avgPrepTime || 0}m</span></div></div>
                                </div>
                            </div>
                        </div>

                        <div className="overview-container-card" style={{ marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, marginBottom: '12px', color: '#334155' }}>Operational Indicators</h3>
                            <div className="kitchen-metric-grid kitchen-metric-grid-3">
                                <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Kitchen Load Ratio')}`}><div className="stat-info"><span className="stat-label">Kitchen Load Ratio</span><span className="stat-value">{kitchenInsights.summary?.kitchenLoadRatio || 0}% ({kitchenInsights.summary?.kitchenLoadLabel || 'Low'})</span></div></div>
                                <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Staff Load')}`}><div className="stat-info"><span className="stat-label">Staff Load</span><span className="stat-value">{kitchenInsights.summary?.staffLoadLabel || 'Normal'}</span></div></div>
                                <div className={`summary-stat-card kitchen-metric-card ${getKitchenToneClass('Delay Risk')}`}><div className="stat-info"><span className="stat-label">Delay Risk</span><span className="stat-value">{kitchenInsights.summary?.delayRiskLabel || 'Minimal'}</span></div></div>
                            </div>
                        </div>

                        <div className="overview-container-card">
                            <h3 style={{ margin: 0, marginBottom: '12px', color: '#334155' }}>
                                {activeTab === 'Ready vs Delivered' ? 'Ready vs Delivered Trend' : `${activeTab} Trend`}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(() => {
                                    const rows = (kitchenInsights.graphData || []).slice(0, 12);
                                    const max = rows.reduce((m, p) => Math.max(m, p.ready || 0, p.delivered || 0, p.pending || 0, p.delayed || 0), 1);
                                    return rows.map((point, index) => {
                                    const a = activeTab === 'Ready vs Delivered' ? (point.ready || 0) : (point.pending || 0);
                                    const b = activeTab === 'Ready vs Delivered' ? (point.delivered || 0) : (point.delayed || 0);
                                    return (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{point.hour}</span>
                                            <div style={{ background: '#eef2ff', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(a / max) * 100}%`, height: '100%', background: '#3b82f6' }}></div>
                                            </div>
                                            <div style={{ background: '#fee2e2', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(b / max) * 100}%`, height: '100%', background: '#ef4444' }}></div>
                                            </div>
                                        </div>
                                    );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-payments' && activeTab === 'Discount' && (
                    <div className="summary-overview-section" style={{ marginTop: '24px' }}>
                        <h2 className="section-title">DISCOUNT BREAKDOWN</h2>

                        <div className="discount-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0px', marginBottom: '18px' }}>
                            <div className="summary-stat-card report-tone-rose">
                                <div className="stat-info">
                                    <span className="stat-label">Total Discount</span>
                                    <span className="stat-value">{cs}{(paymentInsights.totals?.totalDiscount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="summary-stat-card report-tone-blue">
                                <div className="stat-info">
                                    <span className="stat-label">Discounted Items</span>
                                    <span className="stat-value">{parseInt(paymentInsights.totals?.totalDiscountedItems || 0, 10)}</span>
                                </div>
                            </div>
                            <div className="summary-stat-card report-tone-amber">
                                <div className="stat-info">
                                    <span className="stat-label">Food GST</span>
                                    <span className="stat-value">{cs}{(paymentInsights.totals?.totalFoodGst || 0).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="summary-stat-card report-tone-red">
                                <div className="stat-info">
                                    <span className="stat-label">Service Charge</span>
                                    <span className="stat-value">{cs}{(paymentInsights.totals?.totalServiceCharge || 0).toFixed(2)}</span>
                                    <span className="stat-label" style={{ marginTop: '4px', fontSize: '12px', opacity: 0.85 }}>
                                        Bills: {parseInt(paymentInsights.totals?.serviceChargeBillsCount || 0, 10)}
                                    </span>
                                </div>
                            </div>
                            <div className="summary-stat-card report-tone-purple">
                                <div className="stat-info">
                                    <span className="stat-label">Net Payable</span>
                                    <span className="stat-value">{cs}{(paymentInsights.totals?.totalNetPayable || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="overview-container-card">
                            <h3 style={{ margin: '0 0 14px', color: '#1e293b' }}>Section Wise Discount Summary</h3>
                            <div className="table-responsive">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Section</th>
                                            <th>Total Discount</th>
                                            <th>Net Payable</th>
                                            <th>Paid</th>
                                            <th>Records</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentInsights.sectionSummary.length > 0 ? (
                                            paymentInsights.sectionSummary.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.section}</td>
                                                    <td>{cs}{parseFloat(row.totalDiscount || 0).toFixed(2)}</td>
                                                    <td>{cs}{parseFloat(row.totalNetPayable || 0).toFixed(2)}</td>
                                                    <td>{cs}{parseFloat(row.totalPaid || 0).toFixed(2)}</td>
                                                    <td>{row.records || 0}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                    Discount section summary not available for selected filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-gst' && (
                    <div className="summary-overview-section" style={{ marginTop: '24px' }}>
                        <h2 className="section-title">GST OVERVIEW</h2>
                        <div className="gst-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0px', marginBottom: '16px' }}>
                            <div className="summary-stat-card report-tone-primary"><div className="stat-info"><span className="stat-label">Taxable Value</span><span className="stat-value">{cs}{(gstInsights.totals?.taxableValue || 0).toFixed(2)}</span></div></div>
                            <div className="summary-stat-card report-tone-rose"><div className="stat-info"><span className="stat-label">Total Tax</span><span className="stat-value">{cs}{(gstInsights.totals?.totalTax || 0).toFixed(2)}</span></div></div>
                            <div className="summary-stat-card report-tone-blue"><div className="stat-info"><span className="stat-label">CGST</span><span className="stat-value">{cs}{(gstInsights.totals?.cgst || 0).toFixed(2)}</span></div></div>
                            <div className="summary-stat-card report-tone-purple"><div className="stat-info"><span className="stat-label">SGST</span><span className="stat-value">{cs}{(gstInsights.totals?.sgst || 0).toFixed(2)}</span></div></div>
                        </div>

                        <div className="overview-container-card">
                            <h3 style={{ margin: '0 0 14px', color: '#1e293b' }}>Tax Source Mapping (Room/Table/Cashier/Service)</h3>
                            <div className="table-responsive">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Section</th>
                                            <th>Source</th>
                                            <th>Transactions</th>
                                            <th>Taxable Value</th>
                                            <th>Tax Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(gstInsights.sourceBreakdown || []).length > 0 ? (
                                            (gstInsights.sourceBreakdown || []).map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.section}</td>
                                                    <td>{row.source}</td>
                                                    <td>{row.transactions}</td>
                                                    <td>{cs}{(row.taxableValue || 0).toFixed(2)}</td>
                                                    <td>{cs}{(row.taxAmount || 0).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No tax source mapping data found for current filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="report-actions" style={{ marginTop: '20px' }}>
                    <button onClick={() => handleExport('Excel')}>Export Excel</button>
                    <button onClick={() => handleExport('PDF')}>Export PDF</button>
                    <ReportPrintDropdown label="Print" />
                </div>

                {config.columns.length > 0 && (
                    <div className="report-data-card" style={{ marginTop: '30px' }}>
                        <h2 className="section-title">{activeTab.toUpperCase()} DETAILS</h2>
                        <div className="table-responsive">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {config.columns.map((col, idx) => <th key={idx}>{col}</th>)}
                                        {showRowActions && <th style={{ width: '60px' }}></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedReportData.length > 0 ? (
                                        sortedReportData.map((row, idx) => {
                                            const rowKey = row.id ?? idx;
                                            return (
                                            <tr key={idx}>
                                                {config.columns.map((_, i) => (
                                                    <td key={i}>{row[`val${i + 1}`]}</td>
                                                ))}
                                                {showRowActions && (
                                                    <td style={{ position: 'relative', textAlign: 'right' }}>
                                                        <button
                                                            aria-label="Print"
                                                            onClick={() => setRowPrintMenu(rowKey === rowPrintMenu ? null : rowKey)}
                                                            style={{
                                                                border: '1px solid #e2e8f0',
                                                                background: '#fff',
                                                                borderRadius: '6px',
                                                                padding: '6px 8px',
                                                                cursor: 'pointer',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            ⋮
                                                        </button>
                                                        {rowPrintMenu === rowKey && (
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: 0,
                                                                    top: 'calc(100% + 6px)',
                                                                    minWidth: '160px',
                                                                    background: '#fff',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '8px',
                                                                    boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
                                                                    zIndex: 10,
                                                                    padding: '8px',
                                                                    maxHeight: '220px',
                                                                    overflowY: PRINT_FORMATS.length > 3 ? 'auto' : 'visible'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Print Format</div>
                                                                {PRINT_FORMATS.map(fmt => (
                                                                    <button
                                                                        key={fmt.key}
                                                                        onClick={() => handleRowPrint(row, fmt.key)}
                                                                        style={{
                                                                            width: '100%',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            padding: '8px',
                                                                            borderRadius: '6px',
                                                                            border: '1px solid transparent',
                                                                            background: '#f8fafc',
                                                                            cursor: 'pointer',
                                                                            fontWeight: 700,
                                                                            marginBottom: '6px'
                                                                        }}
                                                                    >
                                                                        <span>{fmt.icon}</span>
                                                                        <span>{fmt.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                )}
                                                          </tr>
                                                          );
                                                      })
                                    ) : (
                                        <tr>
                                            <td colSpan={config.columns.length + (showRowActions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                                {loading ? 'Fetching data...' : 'No data generated. Click "Generate Report" to view results.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UniversalReport;
