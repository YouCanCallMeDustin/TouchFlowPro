import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiFetch } from '../utils/api';
import { Users, Plus, Shield, Mail, LayoutDashboard, Copy, Download } from 'lucide-react';

interface Org {
    id: string;
    name: string;
    createdAt: string;
    planTier: 'FREE' | 'PRO' | 'ENTERPRISE';
    seatLimit: number;
    stripeCustomerId?: string | null;
}

interface OrgMembership {
    id: string;
    role: string;
    org: Org;
}

interface OrgDetail extends Org {
    members: {
        id: string; // OrgMember.id (IMPORTANT: use this for remove endpoint)
        role: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            photoUrl: string | null;
        };
    }[];
}

interface DashboardStats {
    membersCount: number;
    sessionsCount7d: number;
    sessionsCount30d: number;
    avgWpm7d: number;
    avgAcc7d: number;
    avgFatigue7d: number;
    planAdherence7d: number;
    fatigueRiskCount7d: number;
    plateauCount7d: number;
}

interface Invite {
    id: string;
    email: string;
    role: string;
    token: string;
    createdAt: string;
    expiresAt: string;
}

interface OrgsProps {
    userId: string;
}

export default function Orgs({ userId }: OrgsProps) {
    const [view, setView] = useState<'list' | 'create' | 'detail' | 'accept'>('list');
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [myOrgs, setMyOrgs] = useState<OrgMembership[]>([]);
    const [loading, setLoading] = useState(false);

    // Create Form
    const [newOrgName, setNewOrgName] = useState('');

    // Accept Form
    const [inviteToken, setInviteToken] = useState('');
    const [acceptError, setAcceptError] = useState('');

    // Detail Data
    const [activeOrg, setActiveOrg] = useState<OrgDetail | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [generatedInvite, setGeneratedInvite] = useState<{ token: string; link: string } | null>(null);

    const myMember = activeOrg?.members.find((m) => m.user.id === userId);
    const myRole = myMember?.role;
    const isOwner = myRole === 'OWNER';
    const isAdmin = myRole === 'ADMIN' || isOwner;

    useEffect(() => {
        if (view === 'list') fetchMyOrgs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    useEffect(() => {
        if (view === 'detail' && selectedOrgId) {
            fetchOrgDetails(selectedOrgId);
            fetchOrgDashboard(selectedOrgId);
            fetchOrgInvites(selectedOrgId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, selectedOrgId]);

    const safeJson = async (res: Response) => {
        try {
            return await res.json();
        } catch {
            return null;
        }
    };

    const fetchMyOrgs = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/orgs/mine');
            if (res.ok) setMyOrgs(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async () => {
        if (!newOrgName) return;
        setLoading(true);
        try {
            const res = await apiFetch('/api/orgs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName }),
            });
            if (res.ok) {
                setNewOrgName('');
                setView('list');
            } else {
                const data = await safeJson(res);
                alert(data?.error?.message ?? 'Failed to create org');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async () => {
        if (!inviteToken) return;
        setLoading(true);
        setAcceptError('');
        try {
            const res = await apiFetch('/api/org-invites/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: inviteToken }),
            });

            const data = await safeJson(res);

            if (res.ok) {
                setView('list');
                setInviteToken('');
            } else {
                setAcceptError(data?.error?.message ?? 'Failed to accept invite');
            }
        } catch (e) {
            console.error(e);
            setAcceptError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgDetails = async (id: string) => {
        try {
            const res = await apiFetch(`/api/orgs/${id}`);
            if (res.ok) setActiveOrg(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchOrgDashboard = async (id: string) => {
        try {
            const res = await apiFetch(`/api/orgs/${id}/dashboard`);
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchOrgInvites = async (id: string) => {
        try {
            const res = await apiFetch(`/api/orgs/${id}/invites`);
            if (res.ok) setInvites(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const handleLeaveOrg = async () => {
        if (!selectedOrgId || !confirm('Are you sure you want to leave this organization?')) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/leave`, { method: 'POST' });
            if (res.ok) {
                setView('list');
                setSelectedOrgId(null);
            } else {
                const data = await safeJson(res);
                alert(data?.error?.message ?? 'Failed to leave org');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    // IMPORTANT: memberId must be OrgMember.id, NOT userId
    const handleRemoveMember = async (memberId: string) => {
        if (!selectedOrgId || !confirm('Remove this member?')) return;
        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/members/${memberId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchOrgDetails(selectedOrgId);
                fetchOrgDashboard(selectedOrgId);
            } else {
                const data = await safeJson(res);
                alert(data?.error?.message ?? 'Failed to remove member');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        if (!selectedOrgId || !confirm('Revoke this invite?')) return;
        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/invites/${inviteId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchOrgInvites(selectedOrgId);
            } else {
                const data = await safeJson(res);
                alert(data?.error?.message ?? 'Failed to revoke invite');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };

    const handleCreateInvite = async () => {
        if (!selectedOrgId || !inviteEmail) return;
        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/invites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await safeJson(res);

            if (res.ok) {
                setGeneratedInvite({
                    token: data?.token,
                    link: `${window.location.origin}/accept-invite?token=${data?.token}`, // hint only
                });
                setInviteEmail('');
                fetchOrgInvites(selectedOrgId);
            } else {
                alert(data?.error?.message ?? 'Failed to create invite');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };

    const handleDownloadReport = async () => {
        if (!selectedOrgId || !activeOrg) return;

        if (activeOrg.planTier === 'FREE') {
            alert('Enterprise Reports are available on Pro and Enterprise plans. Please upgrade.');
            return;
        }

        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/reports/weekly?days=7&format=csv`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `org_report_${selectedOrgId}_weekly.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download report');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };



    const handleDownloadPdf = async () => {
        if (!selectedOrgId || !activeOrg) return;

        if (activeOrg.planTier === 'FREE') {
            alert('Enterprise Reports are available on Pro and Enterprise plans. Please upgrade.');
            return;
        }

        try {
            const res = await apiFetch(`/api/orgs/${selectedOrgId}/reports/weekly.pdf?days=7`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `org_report_${selectedOrgId}_weekly.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const data = await safeJson(res);
                alert(data?.error?.message ?? 'Failed to download PDF report');
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
    };

    const handleUpgrade = async (planTier: 'PRO' | 'ENTERPRISE') => {
        if (!selectedOrgId) return;
        setLoading(true);
        try {
            const res = await apiFetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orgId: selectedOrgId, planTier })
            });
            const data = await safeJson(res);
            if (res.ok && data?.url) {
                window.location.href = data.url;
            } else {
                alert(data?.error?.message ?? 'Failed to start checkout');
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handlePortal = async () => {
        if (!selectedOrgId) return;
        setLoading(true);
        try {
            const res = await apiFetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orgId: selectedOrgId })
            });
            const data = await safeJson(res);
            if (res.ok && data?.url) {
                window.location.href = data.url;
            } else {
                alert(data?.error?.message ?? 'Failed to open billing portal');
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Organizations</h1>
                    <p className="text-text-muted mt-2">Manage your teams and analytics</p>
                </div>
                {view !== 'list' && (
                    <Button variant="ghost" onClick={() => setView('list')}>
                        Back to List
                    </Button>
                )}
            </div>

            {/* VIEWS */}
            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization List */}
                    <Card glass className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>My Teams</span>
                                <div className="flex gap-4">
                                    <Button onClick={() => setView('accept')} variant="secondary" size="sm">
                                        <Mail size={16} className="mr-2" /> Accept Invite
                                    </Button>
                                    <Button onClick={() => setView('create')} size="sm">
                                        <Plus size={16} className="mr-2" /> Create Org
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading && <div className="text-center p-8 text-text-muted">Loading...</div>}
                                {!loading && myOrgs.length === 0 && (
                                    <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                                        <Users size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                                        <p className="text-lg font-bold">No Organizations Found</p>
                                        <p className="text-sm text-text-muted mt-2">Create one or ask your admin for an invite code.</p>
                                    </div>
                                )}
                                {myOrgs.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                                        onClick={() => {
                                            setSelectedOrgId(m.org.id);
                                            setView('detail');
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black">
                                                {m.org.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{m.org.name}</div>
                                                <div className="text-xs text-text-muted uppercase tracking-wider flex items-center gap-2">
                                                    <Shield size={10} /> {m.role}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="opacity-0 group-hover:opacity-100">
                                            Open Dashboard <LayoutDashboard size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {view === 'create' && (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input
                            label="Organization Name"
                            placeholder="Acme Corp"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                        />
                        <div className="flex justify-end gap-4">
                            <Button variant="ghost" onClick={() => setView('list')}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateOrg} isLoading={loading}>
                                Create Org
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {view === 'accept' && (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Join Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input
                            label="Invite Token"
                            placeholder="Paste your token here..."
                            value={inviteToken}
                            onChange={(e) => setInviteToken(e.target.value)}
                            error={acceptError}
                        />
                        <div className="flex justify-end gap-4">
                            <Button variant="ghost" onClick={() => setView('list')}>
                                Cancel
                            </Button>
                            <Button onClick={handleAcceptInvite} isLoading={loading}>
                                Join Team
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {view === 'detail' && activeOrg && (
                <div className="space-y-6">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <Card glass className="flex-1">
                            <CardContent className="pt-6 flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-primary mb-1">{activeOrg.name}</h2>
                                    <div className="text-xs font-mono opacity-50">ID: {activeOrg.id}</div>
                                </div>
                                {!isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLeaveOrg}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Leave Org
                                    </Button>
                                )}
                                {(isAdmin || myRole === 'MANAGER') && (
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={handleDownloadReport} className="ml-2">
                                            <Download size={16} className="mr-2" /> CSV
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleDownloadPdf} className="ml-2">
                                            <Download size={16} className="mr-2" /> PDF
                                        </Button>

                                        {/* Plan Badge & Actions */}
                                        <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-4">
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-text-muted">Plan</div>
                                                <div className="font-bold text-sm text-primary">{activeOrg.planTier}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-black text-text-muted">Seats</div>
                                                <div className={`font-bold text-sm ${activeOrg.members.length >= activeOrg.seatLimit ? 'text-red-500' : 'text-white'}`}>
                                                    {activeOrg.members.length} / {activeOrg.seatLimit}
                                                </div>
                                            </div>
                                            {isOwner && (
                                                <div className="flex gap-2">
                                                    {activeOrg.planTier === 'FREE' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                                                                onClick={() => handleUpgrade('PRO')}
                                                            >
                                                                Upgrade to Pro
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 text-[10px] px-2"
                                                                onClick={() => handleUpgrade('ENTERPRISE')}
                                                            >
                                                                Enterprise
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        activeOrg.stripeCustomerId && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-[10px] px-2"
                                                                onClick={handlePortal}
                                                            >
                                                                Manage Billing
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-[2]">
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black">{stats?.membersCount || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Members</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black">{stats?.sessionsCount7d || 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">7d Sessions</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black text-secondary">{Math.round(stats?.avgWpm7d || 0)}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Avg WPM</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black text-green-400">{Math.round(stats?.avgAcc7d || 0)}%</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Avg Accuracy</div>
                                </CardContent>
                            </Card>

                            {/* Row 2: Coaching Metrics */}
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black text-blue-400">{stats?.planAdherence7d || 0}%</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Plan Adherence</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div
                                        className={`text-2xl font-black ${(stats?.fatigueRiskCount7d || 0) > 0 ? 'text-red-500' : 'text-green-500'
                                            }`}
                                    >
                                        {stats?.fatigueRiskCount7d || 0}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Fatigue Risk</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none">
                                <CardContent className="pt-6 text-center">
                                    <div
                                        className={`text-2xl font-black ${(stats?.plateauCount7d || 0) > 0 ? 'text-amber-500' : 'text-text-muted'
                                            }`}
                                    >
                                        {stats?.plateauCount7d || 0}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">At Risk (Plateau)</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-none opacity-50">
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-black text-text-muted">-</div>
                                    <div className="text-[10px] uppercase tracking-wider text-text-muted">Coming Soon</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Members List */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {activeOrg.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-black">
                                                    {member.user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{member.user.name || member.user.email.split('@')[0]}</div>
                                                    <div className="text-[10px] text-text-muted">{member.user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-1 rounded bg-black/20 text-[10px] font-bold uppercase tracking-wider">
                                                    {member.role}
                                                </div>
                                                {isAdmin && member.role !== 'OWNER' && member.user.id !== userId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-red-500 hover:text-red-400"
                                                        onClick={() => handleRemoveMember(member.id)} // FIX: OrgMember.id
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Invites (Admin Only) */}
                        {isAdmin && invites.length > 0 && (
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Pending Invites</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {invites.map((invite) => (
                                            <div
                                                key={invite.id}
                                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-dashed border-white/10"
                                            >
                                                <div>
                                                    <div className="font-bold text-sm">{invite.email}</div>
                                                    <div className="text-[10px] text-text-muted uppercase">
                                                        {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-red-500 hover:text-red-400"
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invite Actions */}
                        {isAdmin && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invite New Member</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        label="Email Address"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                    />

                                    <div>
                                        <label className="text-[10px] uppercase font-black text-text-muted">Role</label>
                                        <select
                                            className="w-full mt-1 px-3 py-2 bg-black/20 rounded-lg border border-white/10 text-sm text-text-muted focus:border-primary focus:outline-none"
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleCreateInvite}
                                        disabled={activeOrg.members.length >= activeOrg.seatLimit}
                                    >
                                        {activeOrg.members.length >= activeOrg.seatLimit ? 'Seat Limit Reached' : 'Generate Invite Token'}
                                    </Button>

                                    {generatedInvite && (
                                        <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-primary">INVITE TOKEN</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => navigator.clipboard.writeText(generatedInvite.token)}
                                                >
                                                    <Copy size={12} />
                                                </Button>
                                            </div>
                                            <code className="block bg-black/40 p-2 rounded text-[10px] break-all font-mono text-white/80 select-all">
                                                {generatedInvite.token}
                                            </code>
                                            <p className="mt-2 text-[10px] text-text-muted">Share this token securely. It expires in 7 days.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
