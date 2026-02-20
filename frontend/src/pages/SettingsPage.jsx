import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  User, 
  Building, 
  Mail, 
  LogOut, 
  Plus, 
  CreditCard, 
  FileText, 
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  Zap,
  Users,
  Copy,
  Link,
  Gift,
  Layers,
  Edit,
  Trash2,
  Save,
  Crown
} from 'lucide-react';

const SettingsPage = () => {
  const { user, token, logout, checkAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);
  const [members, setMembers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [affiliateStatus, setAffiliateStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newOrgName, setNewOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [editingStages, setEditingStages] = useState(false);
  const [dealStages, setDealStages] = useState([]);
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [newPipeline, setNewPipeline] = useState({ name: '', stages: [] });

  const defaultTab = searchParams.get('tab') || 'profile';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchOrganization();
    fetchInvoices();
    fetchAffiliateStatus();
  }, []);

  useEffect(() => {
    if (organization) {
      fetchOrgSettings();
      fetchMembers();
    }
  }, [organization]);

  const fetchOrganization = async () => {
    try {
      const response = await axios.get(`${API}/organizations/current`, {
        headers,
        withCredentials: true
      });
      setOrganization(response.data);
    } catch (error) {
      console.error('Failed to fetch organization');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgSettings = async () => {
    try {
      const response = await axios.get(`${API}/organizations/settings`, {
        headers,
        withCredentials: true
      });
      setOrgSettings(response.data);
      setDealStages(response.data.deal_stages || []);
    } catch (error) {
      console.error('Failed to fetch org settings');
    }
  };

  const fetchMembers = async () => {
    if (!organization?.organization_id) return;
    try {
      const response = await axios.get(`${API}/organizations/${organization.organization_id}/members`, {
        headers,
        withCredentials: true
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members');
    }
  };

  const fetchAffiliateStatus = async () => {
    try {
      const response = await axios.get(`${API}/affiliate/me`, {
        headers,
        withCredentials: true
      });
      setAffiliateStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch affiliate status');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`, {
        headers,
        withCredentials: true
      });
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices');
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setCreatingOrg(true);
    try {
      await axios.post(`${API}/organizations?name=${encodeURIComponent(newOrgName)}`, {}, {
        headers,
        withCredentials: true
      });
      toast.success('Organization created successfully');
      await checkAuth();
      fetchOrganization();
      setNewOrgName('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleSaveDealStages = async () => {
    try {
      await axios.put(`${API}/organizations/settings`, { deal_stages: dealStages }, {
        headers,
        withCredentials: true
      });
      toast.success('Deal stages saved');
      setEditingStages(false);
      fetchOrgSettings();
    } catch (error) {
      toast.error('Failed to save deal stages');
    }
  };

  const handleToggleAffiliate = async (enabled) => {
    try {
      await axios.put(`${API}/organizations/settings`, { affiliate_enabled: enabled }, {
        headers,
        withCredentials: true
      });
      toast.success(enabled ? 'Affiliate program enabled' : 'Affiliate program disabled');
      fetchOrgSettings();
    } catch (error) {
      toast.error('Failed to update affiliate settings');
    }
  };

  const handleEnrollAffiliate = async () => {
    try {
      await axios.post(`${API}/affiliate/enroll`, {}, {
        headers,
        withCredentials: true
      });
      toast.success('Successfully enrolled as affiliate!');
      fetchAffiliateStatus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enroll');
    }
  };

  const handleUnenrollAffiliate = async () => {
    if (!confirm('Are you sure you want to leave the affiliate program?')) return;
    try {
      await axios.post(`${API}/affiliate/unenroll`, {}, {
        headers,
        withCredentials: true
      });
      toast.success('Successfully unenrolled from affiliate program');
      fetchAffiliateStatus();
    } catch (error) {
      toast.error('Failed to unenroll');
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/organizations/members/${userId}/role?role=${newRole}`, {}, {
        headers,
        withCredentials: true
      });
      toast.success('Member role updated');
      fetchMembers();
      if (newRole === 'owner') {
        await checkAuth(); // Refresh current user's role
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const addDealStage = () => {
    const newStage = {
      id: `stage_${Date.now()}`,
      name: 'New Stage',
      order: dealStages.length + 1
    };
    setDealStages([...dealStages, newStage]);
  };

  const removeDealStage = (index) => {
    setDealStages(dealStages.filter((_, i) => i !== index));
  };

  const updateDealStage = (index, field, value) => {
    const updated = [...dealStages];
    updated[index] = { ...updated[index], [field]: value };
    setDealStages(updated);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const viewInvoice = async (invoiceId) => {
    try {
      const response = await axios.get(`${API}/invoices/${invoiceId}/html`, {
        headers,
        withCredentials: true
      });
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <button onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; cursor: pointer;">Print Invoice</button>
            ${response.data}
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      toast.error('Failed to load invoice');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl" data-testid="settings-page">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="settings-title">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account, organization, and billing</p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="billing">Billing & Invoices</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
                <CardDescription>Your personal account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-earnrm-purple">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900" data-testid="user-name">{user?.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {user?.role || 'member'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={handleLogout}
                    data-testid="logout-btn"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Affiliate Section */}
            {orgSettings?.affiliate_enabled && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Affiliate Program
                  </CardTitle>
                  <CardDescription>Earn commissions by referring new customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {affiliateStatus?.enrolled ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-sm font-medium text-emerald-800 mb-2">Your Referral Link</p>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={affiliateStatus.referral_link} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => copyToClipboard(affiliateStatus.referral_link)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-slate-900">{affiliateStatus.affiliate?.total_referrals || 0}</p>
                          <p className="text-xs text-slate-500">Total Referrals</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-emerald-600">€{(affiliateStatus.affiliate?.total_earnings || 0).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Total Earnings</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-amber-600">€{(affiliateStatus.affiliate?.pending_earnings || 0).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Pending</p>
                        </div>
                      </div>

                      {affiliateStatus.referrals?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Recent Referrals</p>
                          <div className="space-y-2">
                            {affiliateStatus.referrals.slice(0, 5).map((ref, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                <span className="text-slate-600">{ref.referred_user_id}</span>
                                <Badge variant={ref.commission_status === 'paid' ? 'default' : 'secondary'}>
                                  €{ref.commission_amount?.toFixed(2)} - {ref.commission_status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="text-rose-600 border-rose-200"
                        onClick={handleUnenrollAffiliate}
                      >
                        Leave Affiliate Program
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Gift className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
                      <p className="text-slate-600 mb-4">Join our affiliate program and earn 20% commission on referrals!</p>
                      <Button onClick={handleEnrollAffiliate} className="bg-earnrm-purple hover:bg-purple-700">
                        <Link className="w-4 h-4 mr-2" />
                        Become an Affiliate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Organization
                </CardTitle>
                <CardDescription>Your team and workspace settings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-earnrm-purple border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : organization ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-900" data-testid="org-name">{organization.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>Plan: <span className="capitalize font-medium">{organization.subscription_plan || organization.plan || 'free'}</span></span>
                        <span>•</span>
                        <span>Users: {organization.user_count}/{organization.max_users || organization.max_free_users || 3}</span>
                      </div>
                      {organization.subscription_status === 'active' && (
                        <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active Subscription
                        </Badge>
                      )}
                    </div>
                    {(!organization.subscription_status || organization.subscription_status !== 'active') && (
                      <div className="p-4 bg-purple-50 border border-indigo-200 rounded-lg">
                        <p className="text-sm text-purple-800 mb-3">
                          Upgrade to Pro to add unlimited team members and unlock all features.
                        </p>
                        <Button 
                          className="bg-earnrm-purple hover:bg-purple-700" 
                          size="sm"
                          onClick={() => navigate('/pricing')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Create an organization to invite team members and collaborate on leads, deals, and tasks.
                    </p>
                    <form onSubmit={handleCreateOrganization} className="flex gap-3">
                      <Input
                        placeholder="Organization name"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        className="flex-1"
                        data-testid="org-name-input"
                      />
                      <Button
                        type="submit"
                        disabled={creatingOrg || !newOrgName.trim()}
                        className="bg-earnrm-purple hover:bg-purple-700"
                        data-testid="create-org-btn"
                      >
                        {creatingOrg ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members Section - Only show if organization exists */}
            {organization && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>Manage your team and transfer ownership</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {member.picture ? (
                            <img src={member.picture} alt={member.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="font-semibold text-earnrm-purple">{member.name?.[0]?.toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                              {member.name}
                              {member.role === 'owner' && <Crown className="w-4 h-4 text-amber-500" />}
                              {member.user_id === user?.user_id && <Badge variant="outline" className="text-xs">You</Badge>}
                            </p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(user?.role === 'owner' || user?.role === 'super_admin') && member.user_id !== user?.user_id ? (
                            <Select 
                              value={member.role} 
                              onValueChange={(value) => handleUpdateMemberRole(member.user_id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="capitalize">{member.role}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">No team members yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Deal Stages Configuration - Only for owner/admin */}
            {organization && (user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_admin') && (
              <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Pipeline Stages
                    </CardTitle>
                    <CardDescription>Customize your deal pipeline stages</CardDescription>
                  </div>
                  {!editingStages ? (
                    <Button variant="outline" size="sm" onClick={() => setEditingStages(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Stages
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingStages(false); setDealStages(orgSettings?.deal_stages || []); }}>
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-earnrm-purple hover:bg-purple-700" onClick={handleSaveDealStages}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dealStages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center gap-2">
                        <span className="w-8 text-sm text-slate-400">{index + 1}.</span>
                        {editingStages ? (
                          <>
                            <Input
                              value={stage.name}
                              onChange={(e) => updateDealStage(index, 'name', e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-rose-500"
                              onClick={() => removeDealStage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex-1 p-2 bg-slate-50 rounded">
                            <span className="text-slate-700">{stage.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {editingStages && (
                      <Button variant="outline" size="sm" onClick={addDealStage} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Stage
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Affiliate Settings - Only for owner/admin */}
            {organization && (user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_admin') && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Affiliate Program Settings
                  </CardTitle>
                  <CardDescription>Enable affiliates for your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Enable Affiliate Program</p>
                      <p className="text-sm text-slate-500">Allow members to earn commissions by referring new customers</p>
                    </div>
                    <Switch 
                      checked={orgSettings?.affiliate_enabled || false}
                      onCheckedChange={handleToggleAffiliate}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {organization?.subscription_status === 'active' ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-emerald-900">Pro Plan Active</p>
                        <p className="text-sm text-emerald-700">
                          {organization.subscription_plan === 'annual' ? 'Annual billing' : 'Monthly billing'}
                        </p>
                      </div>
                      <Badge className="bg-emerald-600">Active</Badge>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">Free Plan</p>
                        <p className="text-sm text-slate-500">Up to 3 users included</p>
                      </div>
                      <Button 
                        className="bg-earnrm-purple hover:bg-purple-700"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Invoices
                  </CardTitle>
                  <CardDescription>View and download your billing history</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No invoices yet</p>
                  ) : (
                    <div className="divide-y">
                      {invoices.map((invoice) => (
                        <div key={invoice.invoice_id} className="py-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(invoice.invoice_date).toLocaleDateString()} • {invoice.plan_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-slate-900">
                              €{invoice.total_amount.toFixed(2)}
                            </span>
                            <Badge className={invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {invoice.status === 'paid' ? (
                                <><CheckCircle className="w-3 h-3 mr-1" />Paid</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" />Pending</>
                              )}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewInvoice(invoice.invoice_id)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integrations</CardTitle>
                <CardDescription>Connect external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Kit</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Kit.com (ConvertKit)</p>
                      <p className="text-sm text-slate-500">Email marketing automation</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">in</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">LinkedIn</p>
                      <p className="text-sm text-slate-500">Lead generation & scraping</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="connect-linkedin-btn">Connect</Button>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Stripe</p>
                      <p className="text-sm text-slate-500">Payment processing</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
