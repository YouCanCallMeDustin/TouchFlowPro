import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    ChevronRight,
    Shield,
    User as UserIcon,
    Settings,
    Mail,
    Loader2,
    TrendingUp,
    Target,
    Key,
    FileText,
    ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PageTransition from '../components/PageTransition';
import { apiFetch } from '../utils/api';
import CreateOrgModal from '../components/CreateOrgModal';
import InviteMemberModal from '../components/InviteMemberModal';
import JoinOrgModal from '../components/JoinOrgModal';

const MotionCard = motion(Card);

interface Organization {
    id: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
    _count?: {
        members: number;
    };
    createdAt: string;
}

interface OrgsProps {
    onNavigate: (stage: string) => void;
    onViewReport: (orgId: string) => void;
}

const Orgs: React.FC<OrgsProps> = ({ onNavigate, onViewReport }) => {

    // ... inside return ...

    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [orgDetails, setOrgDetails] = useState<any | null>(null);
    const [orgAnalytics, setOrgAnalytics] = useState<any | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/api/orgs');
            setOrgs(data.orgs || []);
        } catch (error) {
            console.error('Failed to fetch orgs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (id: string) => {
        try {
            setDetailsLoading(true);
            const [details, analytics] = await Promise.all([
                apiFetch(`/api/orgs/${id}`),
                apiFetch(`/api/orgs/${id}/analytics`)
            ]);
            setOrgDetails(details);
            setOrgAnalytics(analytics);
        } catch (error) {
            console.error('Failed to fetch org details or analytics:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleOrgClick = (id: string) => {
        setSelectedOrgId(id);
        fetchDetails(id);
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedOrgId || !confirm('Are you sure you want to remove this member?')) return;
        try {
            await apiFetch(`/api/orgs/${selectedOrgId}/members/${memberId}`, { method: 'DELETE' });
            fetchDetails(selectedOrgId); // Refresh list
            setOpenMenuMemberId(null);
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member');
        }
    };

    const handleChangeRole = async (memberId: string, newRole: 'ADMIN' | 'MEMBER') => {
        if (!selectedOrgId) return;
        try {
            await apiFetch(`/api/orgs/${selectedOrgId}/members/${memberId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            fetchDetails(selectedOrgId);
            setOpenMenuMemberId(null);
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role');
        }
    };

    if (loading && orgs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Orgs...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12" onClick={() => setOpenMenuMemberId(null)}>
                {/* Header Container */}
                <div className="relative overflow-hidden card group min-h-[220px] flex items-center bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] border border-white/10 p-8 sm:p-12">
                    <div className="relative z-10 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-text-muted hover:text-primary hover:border-primary/30 transition-all mr-2"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Users size={18} className="text-primary" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Team Infrastructure</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-main mb-6 uppercase leading-[0.9]">
                            Organizations
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl leading-relaxed opacity-70">
                            Build your elite typing squad. Manage permissions, track collectively, and benchmark with internal performance metrics.
                        </p>
                    </div>

                    <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:flex flex-col gap-3">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full px-8 py-4 rounded-2xl uppercase tracking-[0.3em] text-[12px] font-black shadow-2xl shadow-primary/30"
                        >
                            <Plus size={20} className="mr-3" /> Establish New Org
                        </Button>
                        <Button
                            onClick={() => setIsJoinModalOpen(true)}
                            variant="outline"
                            className="w-full px-8 py-4 rounded-2xl uppercase tracking-[0.3em] text-[12px] font-black border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                        >
                            <Key size={20} className="mr-3" /> Join Org
                        </Button>
                    </div>

                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none overflow-hidden">
                        <Users size={300} className="translate-x-1/2 -translate-y-1/4" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Managed Fleets</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="lg:hidden p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {orgs.length === 0 ? (
                                    <MotionCard
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-8 text-center border-dashed border-white/5 bg-transparent"
                                    >
                                        <Users size={32} className="mx-auto text-text-muted mb-4 opacity-20" />
                                        <p className="text-sm text-text-muted mb-6">No organizational assets detected.</p>
                                        <div className="space-y-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="w-full text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Initialize First Team
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsJoinModalOpen(true)}
                                                className="w-full text-[10px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500"
                                            >
                                                Join via Token
                                            </Button>
                                        </div>
                                    </MotionCard>
                                ) : (
                                    orgs.map((org) => (
                                        <MotionCard
                                            key={org.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => handleOrgClick(org.id)}
                                            className={`cursor-pointer p-6 transition-all border-white/5 hover:border-primary/20 hover:translate-x-2 ${selectedOrgId === org.id ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-lg font-black text-text-main tracking-tight">{org.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${org.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-500/10 text-text-muted'}`}>
                                                            {org.role}
                                                        </span>
                                                        <span className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest flex items-center gap-1">
                                                            <UserIcon size={10} /> {org._count?.members || 1} Seats
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className={`transition-transform duration-300 ${selectedOrgId === org.id ? 'translate-x-1 text-primary' : 'text-text-muted/20'}`} />
                                            </div>
                                        </MotionCard>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {!selectedOrgId ? (
                                <motion.div
                                    key="empty-details"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full min-h-[400px] flex flex-col items-center justify-center card bg-transparent border-dashed border-white/5 p-12 text-center"
                                >
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-500/5 flex items-center justify-center mb-6">
                                        <Users size={32} className="text-text-muted opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-black text-text-main mb-2">Select an Organization</h3>
                                    <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                                        Choose an organization from the sidebar to view member statistics and manage team settings.
                                    </p>
                                </motion.div>
                            ) : detailsLoading ? (
                                <motion.div
                                    key="loading-details"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full min-h-[400px] flex items-center justify-center card"
                                >
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </motion.div>
                            ) : orgDetails && (
                                <motion.div
                                    key={`details-${orgDetails.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    {/* Org Overview Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-8 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">Organization Status</h3>
                                                <div className="flex gap-2">
                                                    {orgDetails.myRole === 'ADMIN' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onViewReport(orgDetails.id)}
                                                            className="h-8 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/10"
                                                        >
                                                            <FileText size={12} className="mr-2" /> View Reports
                                                        </Button>
                                                    )}
                                                    <Shield size={16} className="text-primary" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-text-muted text-xs uppercase font-black tracking-widest">Plan Tier</span>
                                                    <span className="text-2xl font-black text-text-main italic">{orgDetails.planTier}</span>
                                                </div>
                                                <div className="h-1 w-full bg-slate-500/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary w-1/5" />
                                                </div>
                                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-text-muted/60">
                                                    <span>Seat Usage</span>
                                                    <span>{orgDetails.members?.length || 0} / {orgDetails.seatLimit} Members</span>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-8 flex flex-col justify-center gap-4 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                                <TrendingUp size={100} strokeWidth={1} />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">Collective Velocity</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black text-text-main tracking-tighter">
                                                    {orgAnalytics ? orgAnalytics.velocity : '74.2'}
                                                </span>
                                                <span className="text-xs font-black uppercase tracking-widest text-primary">Avg WPM</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                                                <Target size={10} /> +5.2% against sector baseline
                                            </p>
                                        </Card>
                                    </div>

                                    {/* Member Table */}
                                    <Card className="overflow-hidden">
                                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Users size={18} className="text-primary" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Team Manifest</h3>
                                            </div>
                                            {orgDetails.myRole === 'ADMIN' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-[9px] font-black uppercase tracking-[0.2em] border-secondary/20 text-secondary hover:bg-secondary/10"
                                                    onClick={() => setIsInviteModalOpen(true)}
                                                >
                                                    <Mail size={14} className="mr-2" /> Dispatch Invites
                                                </Button>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto min-h-[300px]">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-500/5">
                                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Identity</th>
                                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Protocol</th>
                                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {orgDetails.members?.map((member: any) => (
                                                        <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center border border-white/10 overflow-hidden">
                                                                        {member.user.photoUrl ? (
                                                                            <img src={member.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <UserIcon size={18} className="text-text-muted/40" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-black text-text-main tracking-tight">{member.user.name || member.user.email.split('@')[0]}</div>
                                                                        <div className="text-[10px] font-bold text-text-muted opacity-60 italic">{member.user.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${member.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-500/10 text-text-muted'}`}>
                                                                    {member.role === 'ADMIN' ? 'Overseer' : 'Technician'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Active</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4 text-right relative">
                                                                {orgDetails.myRole === 'ADMIN' && (
                                                                    <div className="relative">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenMenuMemberId(openMenuMemberId === member.user.id ? null : member.user.id);
                                                                            }}
                                                                            className="p-2 rounded-lg text-text-muted hover:bg-white/5 transition-colors"
                                                                        >
                                                                            <Settings size={14} />
                                                                        </button>

                                                                        {openMenuMemberId === member.user.id && (
                                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                                                                <div className="py-1">
                                                                                    <button
                                                                                        onClick={() => handleChangeRole(member.user.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center gap-2"
                                                                                    >
                                                                                        <Shield size={12} />
                                                                                        {member.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'}
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleRemoveMember(member.user.id)}
                                                                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                                                                    >
                                                                                        <Users size={12} /> Remove Member
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>

                                    {orgDetails.myRole === 'ADMIN' && (
                                        <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this fleet? This action cannot be undone.')) {
                                                        try {
                                                            const { apiFetch } = await import('../utils/api');
                                                            await apiFetch(`/api/orgs/${orgDetails.id}`, { method: 'DELETE' });
                                                            fetchOrgs();
                                                            setSelectedOrgId(null);
                                                            setOrgDetails(null);
                                                        } catch (error) {
                                                            console.error('Failed to delete org:', error);
                                                            alert('Failed to delete organization');
                                                        }
                                                    }
                                                }}
                                                className="text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-2"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                                Dismantle Fleet
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <CreateOrgModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(newOrg) => {
                    setOrgs(prev => [newOrg, ...prev]);
                    handleOrgClick(newOrg.id);
                }}
            />
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                orgId={selectedOrgId || ''}
                orgName={orgDetails?.name || ''}
            />
            <JoinOrgModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onSuccess={(org) => {
                    setOrgs(prev => [org, ...prev]);
                    handleOrgClick(org.id);
                }}
            />
        </PageTransition>
    );
};

export default Orgs;
