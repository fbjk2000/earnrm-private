import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Users,
  Building,
  Target,
  TrendingUp,
  DollarSign,
  Tag,
  UserPlus,
  Percent,
  Gift,
  Copy,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  Layers,
  Settings,
  Mail,
  CreditCard,
  Wallet,
  Save
} from 'lucide-react';

const AdminPage = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isAffiliateDialogOpen, setIsAffiliateDialogOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    discount_percent: 10,
    discount_type: 'percentage',
    max_uses: null,
    valid_until: ''
  });
  const [newAffiliate, setNewAffiliate] = useState({
    user_id: '',
    affiliate_code: '',
    commission_rate_tier1: 20,
    commission_rate_tier2: 10,
    commission_rate_tier3: 5
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes, usersRes, discountsRes, affiliatesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers, withCredentials: true }).catch(() => null),
        axios.get(`${API}/admin/organizations`, { headers, withCredentials: true }).catch(() => null),
        axios.get(`${API}/admin/users`, { headers, withCredentials: true }).catch(() => null),
        axios.get(`${API}/admin/discount-codes`, { headers, withCredentials: true }).catch(() => null),
        axios.get(`${API}/admin/affiliates`, { headers, withCredentials: true }).catch(() => null),
        axios.get(`${API}/admin/settings`, { headers, withCredentials: true }).catch(() => null)
      ]);

      if (statsRes) setStats(statsRes.data);
      if (orgsRes) setOrganizations(orgsRes.data);
      if (usersRes) setUsers(usersRes.data.users || []);
      if (discountsRes) setDiscountCodes(discountsRes.data.discount_codes || []);
      if (affiliatesRes) setAffiliates(affiliatesRes.data.affiliates || []);
      if (settingsRes) setPlatformSettings(settingsRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Super admin access required');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (settingKey, value) => {
    try {
      await axios.put(`${API}/admin/settings`, { [settingKey]: value }, { headers, withCredentials: true });
      toast.success('Settings updated');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleSaveAllSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/settings`, platformSettings, { headers, withCredentials: true });
      toast.success('All settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/discount-codes`, newDiscount, { headers, withCredentials: true });
      toast.success('Discount code created');
      setIsDiscountDialogOpen(false);
      setNewDiscount({ code: '', discount_percent: 10, discount_type: 'percentage', max_uses: null, valid_until: '' });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create discount code');
    }
  };

  const handleDeleteDiscount = async (codeId) => {
    if (!confirm('Delete this discount code?')) return;
    try {
      await axios.delete(`${API}/admin/discount-codes/${codeId}`, { headers, withCredentials: true });
      toast.success('Discount code deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete discount code');
    }
  };

  const handleToggleDiscount = async (codeId, currentStatus) => {
    try {
      await axios.put(`${API}/admin/discount-codes/${codeId}`, { is_active: !currentStatus }, { headers, withCredentials: true });
      toast.success(`Discount code ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update discount code');
    }
  };

  const handleCreateAffiliate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/affiliates`, newAffiliate, { headers, withCredentials: true });
      toast.success('Affiliate created');
      setIsAffiliateDialogOpen(false);
      setNewAffiliate({ user_id: '', affiliate_code: '', commission_rate_tier1: 20, commission_rate_tier2: 10, commission_rate_tier3: 5 });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create affiliate');
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (!confirm('Delete this affiliate?')) return;
    try {
      await axios.delete(`${API}/admin/affiliates/${affiliateId}`, { headers, withCredentials: true });
      toast.success('Affiliate deleted');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete affiliate');
    }
  };

  const handleProcessPayout = async (affiliateId, pendingAmount) => {
    const amount = prompt(`Enter payout amount (max €${pendingAmount.toFixed(2)}):`, pendingAmount.toFixed(2));
    if (!amount) return;
    
    try {
      await axios.post(`${API}/admin/affiliates/${affiliateId}/payout?amount=${parseFloat(amount)}`, {}, { headers, withCredentials: true });
      toast.success('Payout processed');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process payout');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/role?role=${newRole}`, {}, { headers, withCredentials: true });
      toast.success('User role updated');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-earnrm-purple border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.total_users || 0, icon: <Users className="w-5 h-5" />, color: 'bg-indigo-100 text-earnrm-purple' },
    { title: 'Organizations', value: stats?.total_organizations || 0, icon: <Building className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Revenue', value: `€${(stats?.total_revenue || 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600' },
    { title: 'Affiliates', value: stats?.total_affiliates || 0, icon: <UserPlus className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
    { title: 'Discount Codes', value: stats?.total_discount_codes || 0, icon: <Tag className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
    { title: 'Affiliate Earnings', value: `€${(stats?.total_affiliate_earnings || 0).toLocaleString()}`, icon: <Gift className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-600' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="admin-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="admin-title">Super Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage users, organizations, discounts & affiliates</p>
          </div>
          <Button variant="outline" onClick={fetchAllData} data-testid="refresh-btn">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} data-testid={`admin-stat-${index}`}>
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList data-testid="admin-tabs">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No users yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="users-table">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Organization</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, index) => (
                          <tr key={u.user_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`user-row-${index}`}>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.user_id}</p>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">{u.email}</td>
                            <td className="py-3 px-4">
                              <Select
                                value={u.role || 'member'}
                                onValueChange={(value) => handleUpdateUserRole(u.user_id, value)}
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="owner">Owner</SelectItem>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500">
                              {u.organization_id || '—'}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(u.user_id)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>All Organizations</CardTitle>
                <CardDescription>Manage registered organizations</CardDescription>
              </CardHeader>
              <CardContent>
                {organizations.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No organizations yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="organizations-table">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Organization</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Plan</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Users</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organizations.map((org, index) => (
                          <tr key={org.organization_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`org-row-${index}`}>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900">{org.name}</p>
                              <p className="text-xs text-slate-500">{org.organization_id}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                org.plan === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {org.plan}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{org.user_count}</td>
                            <td className="py-3 px-4 text-sm text-slate-500">
                              {new Date(org.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discount Codes Tab */}
          <TabsContent value="discounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Discount Codes</CardTitle>
                  <CardDescription>Create and manage discount codes</CardDescription>
                </div>
                <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-earnrm-purple hover:bg-purple-700" data-testid="create-discount-btn">
                      <Tag className="w-4 h-4 mr-2" />
                      Create Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Discount Code</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDiscount} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Code *</Label>
                        <Input
                          value={newDiscount.code}
                          onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                          placeholder="e.g., SAVE20"
                          required
                          data-testid="discount-code-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            value={newDiscount.discount_percent}
                            onChange={(e) => setNewDiscount({ ...newDiscount, discount_percent: parseFloat(e.target.value) })}
                            min={0}
                            max={100}
                            data-testid="discount-percent-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Uses</Label>
                          <Input
                            type="number"
                            value={newDiscount.max_uses || ''}
                            onChange={(e) => setNewDiscount({ ...newDiscount, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Unlimited"
                            data-testid="discount-max-uses"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Valid Until</Label>
                        <Input
                          type="date"
                          value={newDiscount.valid_until}
                          onChange={(e) => setNewDiscount({ ...newDiscount, valid_until: e.target.value })}
                          data-testid="discount-valid-until"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-earnrm-purple hover:bg-purple-700" data-testid="submit-discount-btn">
                        Create Discount Code
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {discountCodes.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No discount codes yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="discounts-table">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Code</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Discount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Uses</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discountCodes.map((code, index) => (
                          <tr key={code.code_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`discount-row-${index}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{code.code}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-earnrm-purple font-semibold">{code.discount_percent}%</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {code.current_uses}/{code.max_uses || '∞'}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleDiscount(code.code_id, code.is_active)}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  code.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {code.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:text-rose-700"
                                onClick={() => handleDeleteDiscount(code.code_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliates Tab */}
          <TabsContent value="affiliates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Three-Tier Affiliate System
                  </CardTitle>
                  <CardDescription>Manage affiliates and their commissions</CardDescription>
                </div>
                <Dialog open={isAffiliateDialogOpen} onOpenChange={setIsAffiliateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-earnrm-purple hover:bg-purple-700" data-testid="create-affiliate-btn">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Affiliate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Affiliate</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAffiliate} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>User ID *</Label>
                        <Select
                          value={newAffiliate.user_id}
                          onValueChange={(value) => setNewAffiliate({ ...newAffiliate, user_id: value })}
                        >
                          <SelectTrigger data-testid="affiliate-user-select">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.user_id} value={u.user_id}>
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Affiliate Code (optional)</Label>
                        <Input
                          value={newAffiliate.affiliate_code}
                          onChange={(e) => setNewAffiliate({ ...newAffiliate, affiliate_code: e.target.value.toUpperCase() })}
                          placeholder="Auto-generated if empty"
                          data-testid="affiliate-code-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Commission Rates</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Tier 1 %</p>
                            <Input
                              type="number"
                              value={newAffiliate.commission_rate_tier1}
                              onChange={(e) => setNewAffiliate({ ...newAffiliate, commission_rate_tier1: parseFloat(e.target.value) })}
                              data-testid="affiliate-tier1"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Tier 2 %</p>
                            <Input
                              type="number"
                              value={newAffiliate.commission_rate_tier2}
                              onChange={(e) => setNewAffiliate({ ...newAffiliate, commission_rate_tier2: parseFloat(e.target.value) })}
                              data-testid="affiliate-tier2"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Tier 3 %</p>
                            <Input
                              type="number"
                              value={newAffiliate.commission_rate_tier3}
                              onChange={(e) => setNewAffiliate({ ...newAffiliate, commission_rate_tier3: parseFloat(e.target.value) })}
                              data-testid="affiliate-tier3"
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-earnrm-purple hover:bg-purple-700" data-testid="submit-affiliate-btn">
                        Create Affiliate
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Commission Structure Info */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Three-Tier Commission Structure</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="font-bold text-earnrm-purple">Tier 1</p>
                      <p className="text-slate-600">Direct Referral</p>
                      <p className="text-lg font-bold">20%</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="font-bold text-purple-600">Tier 2</p>
                      <p className="text-slate-600">Sub-Referral</p>
                      <p className="text-lg font-bold">10%</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="font-bold text-cyan-600">Tier 3</p>
                      <p className="text-slate-600">Sub-Sub-Referral</p>
                      <p className="text-lg font-bold">5%</p>
                    </div>
                  </div>
                </div>

                {affiliates.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No affiliates yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="affiliates-table">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Affiliate</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Code</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Referrals</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Earnings</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Pending</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {affiliates.map((aff, index) => (
                          <tr key={aff.affiliate_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`affiliate-row-${index}`}>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900">{aff.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{aff.user?.email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-earnrm-purple">{aff.affiliate_code}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(aff.affiliate_code)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{aff.total_referrals}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-600">
                              €{(aff.total_earnings || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 font-semibold text-amber-600">
                              €{(aff.pending_earnings || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {aff.pending_earnings > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProcessPayout(aff.affiliate_id, aff.pending_earnings)}
                                  >
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Payout
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:text-rose-700"
                                  onClick={() => handleDeleteAffiliate(aff.affiliate_id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  earnrm Platform Settings
                </CardTitle>
                <CardDescription>Configure earnrm platform payment integrations, support email, and global settings (Super Admin only)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAllSettings} className="space-y-6">
                  {/* Support Email */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-earnrm-purple" />
                      Support Settings
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Support Email</Label>
                        <Input
                          type="email"
                          value={platformSettings?.support_email || ''}
                          onChange={(e) => setPlatformSettings({...platformSettings, support_email: e.target.value})}
                          placeholder="support@earnrm.com"
                          data-testid="settings-support-email"
                        />
                        <p className="text-xs text-slate-500">Contact form submissions will be sent to this email</p>
                      </div>
                      <div className="space-y-2">
                        <Label>UK VAT Rate (%)</Label>
                        <Input
                          type="number"
                          value={platformSettings?.vat_rate || 20}
                          onChange={(e) => setPlatformSettings({...platformSettings, vat_rate: parseFloat(e.target.value)})}
                          placeholder="20"
                          data-testid="settings-vat-rate"
                        />
                        <p className="text-xs text-slate-500">VAT rate applied to invoices</p>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Settings */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      Stripe Integration
                    </h3>
                    <div className="space-y-2">
                      <Label>Stripe API Key</Label>
                      <Input
                        type="password"
                        value={platformSettings?.stripe_api_key || ''}
                        onChange={(e) => setPlatformSettings({...platformSettings, stripe_api_key: e.target.value})}
                        placeholder="sk_live_..."
                        data-testid="settings-stripe-key"
                      />
                      <p className="text-xs text-slate-500">Your Stripe secret API key for processing payments</p>
                    </div>
                  </div>

                  {/* PayPal Settings */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      PayPal Integration
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>PayPal Client ID</Label>
                        <Input
                          value={platformSettings?.paypal_client_id || ''}
                          onChange={(e) => setPlatformSettings({...platformSettings, paypal_client_id: e.target.value})}
                          placeholder="Your PayPal Client ID"
                          data-testid="settings-paypal-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PayPal Client Secret</Label>
                        <Input
                          type="password"
                          value={platformSettings?.paypal_client_secret || ''}
                          onChange={(e) => setPlatformSettings({...platformSettings, paypal_client_secret: e.target.value})}
                          placeholder="Your PayPal Client Secret"
                          data-testid="settings-paypal-secret"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Get your credentials from the PayPal Developer Dashboard</p>
                  </div>

                  {/* Crypto Settings */}
                  <div className="space-y-4 pb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-amber-600" />
                      Cryptocurrency
                    </h3>
                    <div className="space-y-2">
                      <Label>ETH Wallet Address</Label>
                      <Input
                        value={platformSettings?.crypto_wallet_address || ''}
                        onChange={(e) => setPlatformSettings({...platformSettings, crypto_wallet_address: e.target.value})}
                        placeholder="0x..."
                        data-testid="settings-crypto-wallet"
                      />
                      <p className="text-xs text-slate-500">ETH wallet address for receiving crypto payments (5% discount applies)</p>
                    </div>
                  </div>

                  <Button type="submit" className="bg-earnrm-purple hover:bg-purple-700" data-testid="save-settings-btn">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
