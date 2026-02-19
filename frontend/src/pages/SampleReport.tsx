import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Download,
    Share2,
    ChevronLeft,
    Calendar,
    FileText,
    TrendingUp,
    Zap,
    Target,
    Lock,
    AlertTriangle,
    X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../utils/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SampleReportProps {
    onBack: () => void;
    orgId?: string;
}

const SampleReport: React.FC<SampleReportProps> = ({ onBack, orgId }) => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    useEffect(() => {
        if (orgId) {
            fetchReportData();
        } else {
            // Fallback for demo mode (accessing from Landing Page without Org)
            setLoading(false);
        }
    }, [orgId]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/api/orgs/${orgId}/analytics`);
            setReportData(data);
        } catch (err) {
            console.error("Failed to fetch report:", err);
            setError("Failed to load organization data.");
        } finally {
            setLoading(false);
        }
    };

    // Default Mock Data for Demo
    const mockData = {
        velocity: 72,
        accuracy: 98.4,
        fatigue: 14,
        volume: '145.2K',
        trendData: [
            { date: 'Jan 15', wpm: 65, accuracy: 96, fatigue: 20 },
            { date: 'Jan 22', wpm: 68, accuracy: 97, fatigue: 18 },
            { date: 'Jan 29', wpm: 70, accuracy: 97.5, fatigue: 15 },
            { date: 'Feb 05', wpm: 71, accuracy: 98, fatigue: 16 },
            { date: 'Feb 12', wpm: 74, accuracy: 98.5, fatigue: 13 },
            { date: 'Today', wpm: 74, accuracy: 98.8, fatigue: 12 },
        ],
        auditLog: [
            { date: 'Feb 15, 14:30', type: 'Speed Drill', wpm: 76, acc: '99.1%', fatigue: 'Low', status: 'VERIFIED', userEmail: 'user@example.com' },
            { date: 'Feb 14, 09:15', type: 'Endurance', wpm: 71, acc: '98.4%', fatigue: 'Med', status: 'VERIFIED', userEmail: 'user@example.com' },
            { date: 'Feb 13, 16:45', type: 'Coding Syntax', wpm: 68, acc: '97.8%', fatigue: 'Low', status: 'VERIFIED', userEmail: 'user@example.com' },
            { date: 'Feb 12, 11:20', type: 'Burst Fire', wpm: 82, acc: '96.5%', fatigue: 'High', status: 'FLAGGED', userEmail: 'user@example.com' },
            { date: 'Feb 11, 10:00', type: 'Standard', wpm: 73, acc: '98.9%', fatigue: 'Low', status: 'VERIFIED', userEmail: 'user@example.com' },
        ],
        totalMembers: 8 // default
    };

    const data = reportData || mockData;
    const isRealData = !!reportData;
    const subjectId = isRealData ? (orgId?.slice(0, 8).toUpperCase() || 'UNKNOWN') : 'TF-ALPHA-082';

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleDateString();

        // 1. Header & Branding
        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("TOUCHFLOW PRO", 15, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("PERFORMANCE DIAGNOSTICS & AUDIT REPORT", 15, 30);

        // 2. Metadata Section
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Subject ID: ${subjectId}`, 15, 50);
        doc.text(`Generated: ${timestamp}`, 15, 55);
        doc.text(`Audit Window: 30 Days`, 15, 60);

        doc.setDrawColor(230, 230, 230);
        doc.line(15, 65, 195, 65);

        // 3. Key Metrics Grid
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("KEY PERFORMANCE INDICATORS", 15, 75);

        const kpiData = [
            ["Metric", "Value", "Status"],
            ["Net Velocity", `${data.velocity} WPM`, "Elite"],
            ["Precision", `${data.accuracy}%`, "High"],
            ["Fatigue Floor", `${data.fatigue}/100`, "Low Risk"],
            ["Total Volume", data.volume, "Standard"]
        ];

        autoTable(doc, {
            startY: 80,
            head: [kpiData[0]],
            body: kpiData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [50, 50, 50] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // 4. Trend Summary
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("AUDIT LOG (30-DAY WINDOW)", 15, finalY);

        // 5. Audit Log Table
        autoTable(doc, {
            startY: finalY + 5,
            head: [['Date', 'Type', 'WPM', 'Accuracy', 'Status', 'User']],
            body: data.auditLog.map((l: any) => [
                l.date.split(',')[0],
                l.type,
                l.wpm,
                l.acc,
                l.status,
                l.userEmail?.split('@')[0] || 'N/A'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Brand Primary Color
            styles: { fontSize: 8 }
        });

        // 6. Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                "CONFIDENTIAL - TOUCHFLOW PRO ENTERPRISE AUDIT SYSTEM",
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        }

        doc.save(`TF_AUDIT_REPORT_${subjectId}.pdf`);
    };

    const handleDownloadCSV = () => {
        const headers = ['Date', 'Type', 'WPM', 'Accuracy', 'Fatigue', 'Status', 'User'];
        const rows = data.auditLog.map((l: any) => [
            l.date, l.type, l.wpm, l.acc, l.fatigue, l.status, l.userEmail || 'N/A'
        ]);
        const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TF_DATA_${subjectId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-8 space-y-8"
        >
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-text-muted hover:text-text-main group"
                >
                    <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
                    Back to Dashboard
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10" onClick={handleDownloadCSV}>
                        <Share2 className="mr-2" size={16} /> Export CSV
                    </Button>
                    <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary-hover text-bg-main font-bold">
                        <Download className="mr-2" size={16} /> Download Summary
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-[60vh] flex items-center justify-center">
                    <div className="animate-spin text-primary">
                        <Activity size={48} />
                    </div>
                </div>
            ) : error ? (
                <div className="h-[60vh] flex items-center justify-center text-red-500">
                    <AlertTriangle className="mr-2" /> {error}
                </div>
            ) : (
                <>
                    {/* Main Report Card */}
                    <Card className="p-8 sm:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                            <Activity size={300} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/10 pb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="px-2 py-1 rounded bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                                            Confidential
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            Ref: {Math.random().toString(36).substring(7).toUpperCase()}
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-text-main mb-2 tracking-tighter uppercase">
                                        Performance Audit
                                    </h1>
                                    <p className="text-text-muted text-lg">
                                        Subject ID: <span className="text-primary font-mono">{subjectId}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Generated</div>
                                    <div className="text-xl font-bold text-text-main flex items-center justify-end gap-2">
                                        <Calendar size={18} className="text-primary" />
                                        {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                                {[
                                    { label: 'Net velocity', value: data.velocity, suffix: 'WPM', sub: '+12% vs Baseline', icon: Zap, color: 'text-primary' },
                                    { label: 'Precision', value: data.accuracy, suffix: '%', sub: 'Elite Consensus', icon: Target, color: 'text-secondary' },
                                    { label: 'Fatigue floor', value: data.fatigue, suffix: '/100', sub: 'Low Risk Profile', icon: Activity, color: 'text-emerald-500' },
                                    { label: 'Total Volume', value: data.volume, suffix: '', sub: 'Keystrokes Tracked', icon: FileText, color: 'text-amber-500' },
                                ].map((kpi: any, i: number) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 relative group hover:border-primary/20 transition-colors">
                                        <div className="flex items-center gap-3 mb-4 text-text-muted">
                                            <kpi.icon size={18} className={`${kpi.color}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</span>
                                        </div>
                                        <div className="text-4xl font-black text-text-main mb-1 tracking-tighter">
                                            {kpi.value} <span className="text-lg text-text-muted font-bold">{kpi.suffix}</span>
                                        </div>
                                        <div className={`text-[10px] font-bold ${kpi.color} flex items-center gap-1`}>
                                            <TrendingUp size={12} /> {kpi.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Analysis Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                        <TrendingUp size={16} /> Velocity Trend (30 Days)
                                    </h3>
                                    <div className="h-64 w-full bg-white/[0.02] rounded-xl border border-white/5 relative overflow-hidden p-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.trendData}>
                                                <defs>
                                                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="100%">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10 }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgb(23, 23, 23)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                />
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <Area type="monotone" dataKey="wpm" stroke="var(--primary)" fillOpacity={1} fill="url(#colorWpm)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                        <Lock size={16} /> Audit Log
                                    </h3>
                                    <div className="space-y-3">
                                        {data.auditLog.slice(0, 5).map((log: any, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04]">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <span className="text-[10px] font-bold text-text-muted uppercase">{log.type}</span>
                                                    </div>
                                                    <div className="text-xs font-medium text-text-muted opacity-60">{log.date ? log.date.split('T')[0] : 'N/A'}</div>
                                                    {log.userEmail && <div className="text-[9px] text-text-muted opacity-40">{log.userEmail.split('@')[0]}</div>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-text-main">{log.wpm} WPM</div>
                                                    <div className="text-[10px] font-mono text-text-muted">{log.acc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs text-text-muted hover:text-primary"
                                        onClick={() => setIsAuditModalOpen(true)}
                                    >
                                        View Full Audit Log
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}
            {/* Audit Log Modal */}
            <AnimatePresence>
                {isAuditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-bg-main border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-primary" />
                                    <h3 className="text-lg font-black uppercase tracking-tight text-text-main">Full Audit Log</h3>
                                </div>
                                <button
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="p-2 rounded-xl hover:bg-white/5 text-text-muted transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {data.auditLog.map((log: any, i: number) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04]">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-2 h-2 rounded-full ${log.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold text-text-main uppercase">{log.type}</span>
                                                    <span className="text-[10px] text-text-muted opacity-40">#{i + 1}</span>
                                                </div>
                                                <div className="text-[10px] font-medium text-text-muted opacity-60">
                                                    {log.date ? new Date(log.date).toLocaleString() : 'N/A'}
                                                </div>
                                                {log.userEmail && <div className="text-[9px] text-text-muted opacity-40">{log.userEmail}</div>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-primary">{log.wpm} WPM</div>
                                            <div className="text-[10px] font-mono text-text-muted">{log.acc} Accuracy</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                                <Button variant="outline" onClick={handleDownloadCSV}>Export CSV</Button>
                                <Button onClick={() => setIsAuditModalOpen(false)}>Close Log</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SampleReport;
