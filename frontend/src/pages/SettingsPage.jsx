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
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-indigo-600">
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
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-sm text-indigo-800 mb-3">
                          Upgrade to Pro to add unlimited team members and unlock all features.
                        </p>
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700" 
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
                        className="bg-indigo-600 hover:bg-indigo-700"
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
                        className="bg-indigo-600 hover:bg-indigo-700"
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
