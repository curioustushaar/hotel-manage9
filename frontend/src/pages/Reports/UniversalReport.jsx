import React, { useState, useEffect } from 'react';
import './UniversalReport.css';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import soundManager from '../../utils/soundManager';
import axios from 'axios';
import { io } from 'socket.io-client';

const UniversalReport = ({ type }) => {
    const { user } = useAuth();
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({});
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Report configurations
    const reportConfig = {
        'reports-sales': {
            title: 'SALES REPORTS',
            tabs: ['Dine-In Orders', 'Room Service Orders', 'Take-Away Orders', 'Online Orders'],
            filters: ['Category', 'Item'],
            columns: ['Bill No', 'Item / Category', 'Qty', 'Amount', 'Tax', 'Net']
        },
        'reports-payments': {
            title: 'PAYMENT REPORTS',
            tabs: ['Cashier Collection', 'Pending Bills', 'Settled Bills', 'Discount', 'Refund'],
            filters: ['Cashier', 'Payment Mode', 'Shift'],
            columns: ['Bill No', 'Cashier', 'Mode', 'Amount', 'Status']
        },
        'reports-rooms': {
            title: 'ROOM REPORTS',
            tabs: ['Room Occupancy', 'Check-In / Check-Out', 'Room Revenue', 'Reservation', 'No-Show', 'Cancellation'],
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
            tabs: ['GST Summary', 'GST Item Wise', 'CGST / SGST / IGST', 'HSN Wise', 'Taxable vs Non-Taxable'],
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
            tabs: ['Overview', 'Detailed Bills', 'Top Items', 'Cancelled Bills'],
            filters: ['Order Type', 'Payment Method'],
            columns: ['Bill No', 'Date', 'Table / Room', 'Items', 'Amt', 'Tax', 'Disc', 'Total', 'Payment', 'Staff']
        },
        'reports-reservations': {
            title: 'RESERVATION REPORTS',
            tabs: ['Upcoming', 'Today', 'Completed', 'Guest History', 'Repeat Guests'],
            filters: ['Source', 'Table Type'],
            columns: ['Guest', 'Table / Area', 'Date', 'Time / Duration', 'Persons', 'Source', 'Status']
        },
        'reports-analytics': {
            title: 'ANALYTICS REPORTS',
            tabs: ['Overview'],
            filters: ['Metric'],
            columns: ['Metric', 'Value', 'Growth', 'Trend']
        }
    };

    const [activeTab, setActiveTab] = useState((reportConfig[type] || reportConfig['reports-sales']).tabs[0]);

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
        }
        return base;
    };

    const config = getDynamicConfig();

    // Reset active tab when type changes
    useEffect(() => {
        setActiveTab(config.tabs[0]);
    }, [type]);

    const [roomOptions, setRoomOptions] = useState({ types: [], floors: [], statuses: [] });
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

    // Fetch dynamic options based on report type
    useEffect(() => {
        if (type === 'reports-sales') {
            fetch('http://localhost:5000/api/menu/list')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMenuItems(data.data);
                    }
                })
                .catch(err => console.error("Error fetching menu:", err));
        } else if (type === 'reports-rooms') {
            fetch('http://localhost:5000/api/reports/rooms/options')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setRoomOptions(data.data);
                    }
                })
                .catch(err => console.error("Error fetching room options:", err));
        } else if (type === 'reports-reservations') {
            fetch('http://localhost:5000/api/guest-meal/tables')
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
            if (filterName === 'Status') return roomOptions.statuses || [];
            return [];
        }

        if (type === 'reports-kitchen') {
            if (filterName === 'Category') return kitchenCategories;
            if (filterName === 'Order Type') return ['Dine-In', 'Room Order', 'Take Away', 'Online Order'];
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

            const res = await axios.get("http://localhost:5000/api/sales-report", { params: queryParams });
            if (res.data.success) {
                const mappedData = res.data.data.map((tx, idx) => ({
                    id: tx.id || idx,
                    val1: tx.billNo,
                    val2: `${tx.itemName} / ${tx.category}`,
                    val3: tx.qty,
                    val4: `${cs}${parseFloat(tx.price).toFixed(2)}`,
                    val5: `${cs}${parseFloat(tx.subtotal - (tx.qty * tx.price) || 0).toFixed(2)}`,
                    val6: `${cs}${parseFloat(tx.subtotal).toFixed(2)}`,
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
                shift: filters['Shift'] || 'All'
            };

            const res = await axios.get("http://localhost:5000/api/payment-report", { params: queryParams });
            if (res.data.success) {
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
            const res = await axios.get("http://localhost:5000/api/analytics-report", {
                params: {
                    metric: metricFilter,
                    startDate: dateRange.from,
                    endDate: dateRange.to
                }
            });

            if (res.data.success) {
                const mappedData = res.data.data.map((item, idx) => ({
                    id: idx,
                    val1: item.metric,
                    val2: item.value,
                    val3: item.growth,
                    val4: item.trend
                }));
                setReportData(mappedData);

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

            const res = await axios.get("http://localhost:5000/api/reports/rooms", { params: queryParams });
            if (res.data.success) {
                const mappedData = res.data.data.map((item, idx) => ({
                    id: idx,
                    val1: item.roomNo,
                    val2: item.guestName,
                    val3: item.checkIn,
                    val4: item.checkOut,
                    val5: item.nights,
                    val6: `${cs}${parseFloat(item.amount).toFixed(2)}`,
                    rawAmount: item.amount
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

            const res = await axios.get("http://localhost:5000/api/reports/kitchen", { params: queryParams });
            if (res.data.success) {
                if (res.data.categories && res.data.categories.length > 0) {
                    setKitchenCategories(res.data.categories);
                }

                const mappedData = res.data.data.map((item, idx) => ({
                    id: idx,
                    val1: `KOT-${item.kotNo}`,
                    val2: item.item,
                    val3: item.category || '-',
                    val4: item.startTime,
                    val5: item.readyTime,
                    val6: item.delay,
                    rawAmount: item.rawAmount,
                    paymentMethod: item.paymentMethod
                }));
                setReportData(mappedData);

                if (isManual && mappedData.length > 0) {
                    downloadCSV(mappedData, `Kitchen_Report_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                }

                let collections = 0;
                let pm = { cash: 0, card: 0, upi: 0, bankTransfer: 0 };
                mappedData.forEach(item => {
                    const amount = item.rawAmount || 0;
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
                    paymentsCount: mappedData.length,
                    paymentMethods: pm
                }));
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

            const res = await axios.get("http://localhost:5000/api/reports/billing", { params: queryParams });
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
                        id: idx,
                        val1: item.billNo,
                        val2: item.date,
                        val3: item.tableNo,
                        val4: item.items,
                        val5: `${cs}${item.amount.toFixed(2)}`,
                        val6: `${cs}${item.tax.toFixed(2)}`,
                        val7: `${cs}${item.discount.toFixed(2)}`,
                        val8: `${cs}${item.total.toFixed(2)}`,
                        val9: item.payment,
                        val10: item.staff
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

            const res = await axios.get("http://localhost:5000/api/reservation-report", { params: queryParams });
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
                    val7: item.status
                }));

                setReportData(mappedData);
                setResSummary({ summary, distributions, reservationList });
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

    const handleGenerate = () => {
        soundManager.play('click');
        if (type === 'reports-sales') fetchSalesReport(true);
        else if (type === 'reports-payments') fetchPaymentReport(true);
        else if (type === 'reports-analytics') fetchAnalyticsReport(true);
        else if (type === 'reports-rooms') fetchRoomReport(true);
        else if (type === 'reports-kitchen') fetchKitchenReport(true);
        else if (type === 'reports-billing') fetchBillingReport(true);
        else if (type === 'reports-reservations') fetchReservationReport(true);
    };

    const handleExport = (format) => {
        soundManager.play('success');
        if (format === 'Excel') {
            if (reportData.length === 0) {
                alert("No data available to export.");
                return;
            }
            downloadCSV(reportData, `${config.title.replace(/\s+/g, '_')}_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
            window.print();
        }
    };

    useEffect(() => {
        const triggers = [type, activeTab, filters, dateRange.from, dateRange.to];
        if (type === 'reports-sales') fetchSalesReport();
        else if (type === 'reports-analytics') fetchAnalyticsReport();
        else if (type === 'reports-rooms') fetchRoomReport();
        else if (type === 'reports-kitchen') fetchKitchenReport();
        else if (type === 'reports-billing') fetchBillingReport();
        else if (type === 'reports-reservations') fetchReservationReport();
        else if (type === 'reports-payments') {
            fetchPaymentReport(false).then(data => {
                if (data && data.success && activeTab === 'Cashier Collection') {
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
                }
            });
        }

        const socket = io("http://localhost:5000");
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
                            <select
                                value={filters[filter] || (type === 'reports-analytics' && filter === 'Metric' ? 'All Metrics' : 'All')}
                                onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}
                            >
                                {filter !== 'Metric' && <option value="All">All {filter}s</option>}
                                {getOptionsForFilter(filter).map((opt, idx) => {
                                    if (typeof opt === 'object') return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                                    return opt === 'All' ? null : <option key={idx} value={opt}>{opt}</option>;
                                })}
                            </select>
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
                    <div className="reservation-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        <div className="summary-stat-card">
                            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>📅</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.totalReservations || 0}</span>
                                <span className="stat-label">Total Reservations</span>
                            </div>
                        </div>
                        <div className="summary-stat-card">
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>🕒</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.todayCount || 0}</span>
                                <span className="stat-label">Today's Arrival</span>
                            </div>
                        </div>
                        <div className="summary-stat-card">
                            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>👎</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.noShowCount || 0}</span>
                                <span className="stat-label">No Shows</span>
                            </div>
                        </div>
                        <div className="summary-stat-card">
                            <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>❌</div>
                            <div className="stat-info">
                                <span className="stat-value">{resSummary.summary?.cancelledCount || 0}</span>
                                <span className="stat-label">Cancellations</span>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'reports-reservations' && (
                    <div className="report-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
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

                {type === 'reports-billing' && activeTab === 'Overview' && (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div className="summary-stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
                                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '22px' }}>🧾</div>
                                <div className="stat-info">
                                    <span className="stat-value" style={{ color: 'white' }}>{billingSummary.summary?.totalBills || 0}</span>
                                    <span className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Total Bills</span>
                                </div>
                            </div>
                            <div className="summary-stat-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', border: 'none' }}>
                                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '22px' }}>💰</div>
                                <div className="stat-info">
                                    <span className="stat-value" style={{ color: 'white' }}>{cs}{(billingSummary.summary?.totalRevenue || 0).toFixed(0)}</span>
                                    <span className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Total Revenue</span>
                                </div>
                            </div>
                            <div className="summary-stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none' }}>
                                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '22px' }}>📊</div>
                                <div className="stat-info">
                                    <span className="stat-value" style={{ color: 'white' }}>{cs}{billingSummary.summary?.totalBills > 0 ? ((billingSummary.summary?.totalRevenue || 0) / billingSummary.summary?.totalBills).toFixed(0) : 0}</span>
                                    <span className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Avg Bill Value</span>
                                </div>
                            </div>
                            <div className="summary-stat-card" style={{ background: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', color: 'white', border: 'none' }}>
                                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '22px' }}>❌</div>
                                <div className="stat-info">
                                    <span className="stat-value" style={{ color: 'white' }}>{(billingSummary.cancelledBills || []).length}</span>
                                    <span className="stat-label" style={{ color: 'rgba(255,255,255,0.85)' }}>Cancelled Bills</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method + Order Type Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div className="overview-container-card">
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#e0e7ff', borderRadius: '8px', padding: '4px 8px' }}>💳</span> Payment Method
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

                {['reports-sales', 'reports-rooms', 'reports-kitchen'].includes(type) && (
                    <div className="summary-overview-section">
                        <h2 className="section-title">SUMMARY OVERVIEW</h2>
                        <div className="overview-container-card">
                            <div className="overview-sub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                <div className="overview-sub-card">
                                    <div className="overview-icon-box green-icon">💰</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Total Collections</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.totalCollections.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="overview-sub-card">
                                    <div className="overview-icon-box pink-icon">💸</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Payments Received</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.paymentsReceived.toFixed(2)}</span>
                                        <span className="overview-count">{summaryStats.paymentsCount} payments</span>
                                    </div>
                                </div>
                                <div className="overview-sub-card">
                                    <div className="overview-icon-box blue-icon">💳</div>
                                    <div className="overview-text">
                                        <span className="overview-label">Net Cash Flow</span>
                                        <span className="overview-huge-value">{cs}{summaryStats.netCashFlow.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="report-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => handleExport('Excel')}>Export Excel</button>
                    <button onClick={() => handleExport('PDF')}>Export PDF</button>
                    <button onClick={() => handleExport('Print')}>Print</button>
                </div>

                {config.columns.length > 0 && (
                    <div className="report-data-card" style={{ marginTop: '30px' }}>
                        <h2 className="section-title">{activeTab.toUpperCase()} DETAILS</h2>
                        <div className="table-responsive">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {config.columns.map((col, idx) => <th key={idx}>{col}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.length > 0 ? (
                                        reportData.map((row, idx) => (
                                            <tr key={idx}>
                                                {config.columns.map((_, i) => (
                                                    <td key={i}>{row[`val${i + 1}`]}</td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={config.columns.length} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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
