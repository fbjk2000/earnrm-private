import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Plus,
  Search,
  Upload,
  Zap,
  MoreVertical,
  Mail,
  Phone,
  Linkedin,
  Building,
  Filter,
  Sparkles,
  FileText,
  MessageSquare,
  Globe,
  MapPin,
  Edit2,
  Save,
  X,
  Wand2,
  Briefcase,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { SmartSearch, AIEmailComposer, LeadSummary } from '../components/AIAssistant';

const LeadsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    linkedin_url: '',
    source: 'manual'
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Lead detail/edit state
  const [selectedLead, setSelectedLead] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [scoring, setScoring] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get(`${API}/leads`, {
        headers,
        params,
        withCredentials: true
      });
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/leads`, newLead, { headers, withCredentials: true });
      toast.success('Lead added successfully');
      setIsAddDialogOpen(false);
      setNewLead({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        linkedin_url: '',
        source: 'manual'
      });
      fetchLeads();
    } catch (error) {
      toast.error('Failed to add lead');
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/leads/import-csv`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      toast.success(`Imported ${response.data.count} leads`);
      setIsImportDialogOpen(false);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to import CSV');
    }
  };

  const handleScoreLead = async (leadId) => {
    setScoring(leadId);
    try {
      const response = await axios.post(`${API}/ai/score-lead/${leadId}`, {}, { headers });
      toast.success(`Lead scored: ${response.data.ai_score}/100`);
      fetchLeads();
      if (selectedLead?.lead_id === leadId) {
        setSelectedLead(prev => ({ ...prev, ai_score: response.data.ai_score }));
      }
    } catch (error) {
      toast.error('Failed to score lead');
    } finally {
      setScoring(null);
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await axios.delete(`${API}/leads/${leadId}`, { headers });
      toast.success('Lead deleted');
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      await axios.put(`${API}/leads/${leadId}`, { status }, { headers });
      toast.success('Lead status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openLeadDetail = (lead) => {
    setSelectedLead(lead);
    setEditData({ ...lead });
    setEditMode(false);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const { lead_id, organization_id, created_by, created_at, _id, ...updates } = editData;
      const res = await axios.put(`${API}/leads/${selectedLead.lead_id}`, updates, { headers });
      toast.success('Lead updated');
      setSelectedLead(res.data);
      setEditData(res.data);
      setEditMode(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleEnrichLead = async (leadId) => {
    setEnriching(true);
    try {
      const res = await axios.post(`${API}/ai/enrich-lead/${leadId}`, {}, { headers });
      toast.success('Lead enriched with AI data');
      setSelectedLead(res.data.lead);
      setEditData(res.data.lead);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrichment failed');
    } finally {
      setEnriching(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.first_name?.toLowerCase().includes(searchLower) ||
      lead.last_name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower)
    );
  });

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-slate-100 text-slate-700' },
    { value: 'contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-700' },
    { value: 'qualified', label: 'Qualified', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'unqualified', label: 'Unqualified', color: 'bg-rose-100 text-rose-700' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="leads-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="leads-title">Leads</h1>
            <p className="text-slate-600 mt-1">Manage and track your sales leads</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* AI Features */}
            <SmartSearch onSelectResult={(type, item) => {
              if (type === 'lead') {
                toast.info(`Selected lead: ${item.first_name} ${item.last_name}`);
              }
            }} />
            <AIEmailComposer />
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="import-csv-btn">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Leads from CSV</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-slate-600">
                    Upload a CSV file with columns: first_name, last_name, email, phone, company, job_title, linkedin_url
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    data-testid="csv-file-input"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#A100FF] hover:bg-purple-700" data-testid="add-lead-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLead} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={newLead.first_name}
                        onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                        required
                        data-testid="lead-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={newLead.last_name}
                        onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                        required
                        data-testid="lead-last-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_email">Email</Label>
                    <Input
                      id="lead_email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      data-testid="lead-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_phone">Phone</Label>
                    <Input
                      id="lead_phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      data-testid="lead-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_company">Company</Label>
                    <Input
                      id="lead_company"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      data-testid="lead-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_job_title">Job Title</Label>
                    <Input
                      id="lead_job_title"
                      value={newLead.job_title}
                      onChange={(e) => setNewLead({ ...newLead, job_title: e.target.value })}
                      data-testid="lead-job-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_linkedin">LinkedIn URL</Label>
                    <Input
                      id="lead_linkedin"
                      value={newLead.linkedin_url}
                      onChange={(e) => setNewLead({ ...newLead, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      data-testid="lead-linkedin"
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-[#A100FF] hover:bg-purple-700" data-testid="submit-lead-btn">
                      Add Lead
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search leads..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-leads"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card data-testid="leads-list">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-600">No leads found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLeads.map((lead, index) => (
                  <div
                    key={lead.lead_id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                    data-testid={`lead-row-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-[#A100FF] font-medium">
                            {lead.first_name?.[0]}{lead.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            {lead.company && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {lead.company}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        {lead.ai_score && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">{lead.ai_score}</span>
                          </div>
                        )}

                        {/* AI Action Buttons */}
                        <div className="hidden sm:flex items-center gap-1">
                          <LeadSummary 
                            leadId={lead.lead_id} 
                            leadName={`${lead.first_name} ${lead.last_name}`}
                          />
                          <AIEmailComposer 
                            leadId={lead.lead_id} 
                            leadName={`${lead.first_name} ${lead.last_name}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/chat?type=lead&id=${lead.lead_id}`)}
                            title="Discuss this lead"
                            data-testid={`discuss-lead-${lead.lead_id}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>

                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.lead_id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`lead-menu-${index}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/chat?type=lead&id=${lead.lead_id}`)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Discuss Lead
                            </DropdownMenuItem>
                            {lead.phone && (
                              <DropdownMenuItem onClick={() => navigate(`/calls?lead=${lead.lead_id}`)}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Lead
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleScoreLead(lead.lead_id)}>
                              <Zap className="w-4 h-4 mr-2" />
                              AI Score
                            </DropdownMenuItem>
                            {lead.linkedin_url && (
                              <DropdownMenuItem asChild>
                                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <Linkedin className="w-4 h-4 mr-2" />
                                  View LinkedIn
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-rose-600"
                              onClick={() => handleDeleteLead(lead.lead_id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
