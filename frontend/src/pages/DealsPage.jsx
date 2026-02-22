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
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, MoreVertical, Euro, Calendar, Percent, Tag, Filter, X, Users, MessageSquare, LayoutGrid, List, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';

const DealsPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [members, setMembers] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedDealIds, setSelectedDealIds] = useState([]);
  
  // Filter states
  const [filterStage, setFilterStage] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  
  const [newDeal, setNewDeal] = useState({
    name: '',
    value: 0,
    currency: 'EUR',
    stage: 'lead',
    probability: 20,
    expected_close_date: '',
    tags: [],
    notes: '',
    lead_id: '',
    contact_id: '',
    company_id: '',
    task_title: '',
    task_owner_id: '',
    task_description: '',
    task_due_date: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [availableLeads, setAvailableLeads] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const stages = [
    { id: 'lead', name: 'Lead', color: 'bg-slate-100 border-slate-300', probability: 10 },
    { id: 'qualified', name: 'Qualified', color: 'bg-purple-50 border-indigo-300', probability: 30 },
    { id: 'proposal', name: 'Proposal', color: 'bg-amber-50 border-amber-300', probability: 50 },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-50 border-purple-300', probability: 70 },
    { id: 'won', name: 'Won', color: 'bg-emerald-50 border-emerald-300', probability: 100 },
    { id: 'lost', name: 'Lost', color: 'bg-rose-50 border-rose-300', probability: 0 }
  ];

  useEffect(() => {
    fetchDeals();
    fetchMembers();
    fetchTags();
    fetchLinkedEntities();
  }, [filterStage, filterTag, filterOwner]);

  const fetchLinkedEntities = async () => {
    try {
      const [leadsRes, contactsRes, companiesRes] = await Promise.all([
        axios.get(`${API}/leads`, { headers, withCredentials: true }),
        axios.get(`${API}/contacts`, { headers, withCredentials: true }),
        axios.get(`${API}/companies`, { headers, withCredentials: true })
      ]);
      setAvailableLeads(leadsRes.data || []);
      setAvailableContacts(contactsRes.data || []);
      setAvailableCompanies(companiesRes.data || []);
    } catch {}
  };

  const fetchDeals = async () => {
    try {
      let url = `${API}/deals`;
      const params = new URLSearchParams();
      if (filterStage) params.append('stage', filterStage);
      if (filterTag) params.append('tag', filterTag);
      if (filterOwner) params.append('assigned_to', filterOwner);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers,
        withCredentials: true
      });
      setDeals(response.data);
    } catch (error) {
      toast.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const orgRes = await axios.get(`${API}/organizations/current`, { headers, withCredentials: true });
      if (orgRes.data?.organization_id) {
        const membersRes = await axios.get(`${API}/organizations/${orgRes.data.organization_id}/members`, {
          headers,
          withCredentials: true
        });
        setMembers(membersRes.data || []);
      }
    } catch (error) {
      console.log('Could not fetch members');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API}/deals/tags`, { headers, withCredentials: true });
      setExistingTags(response.data.tags || []);
    } catch (error) {
      console.log('Could not fetch tags');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newDeal.tags.includes(tagInput.trim())) {
      setNewDeal({ ...newDeal, tags: [...newDeal.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewDeal({ ...newDeal, tags: newDeal.tags.filter(t => t !== tagToRemove) });
  };

  const handleAddDeal = async (e) => {
    e.preventDefault();
    
    // Validate mandatory task fields
    if (!newDeal.task_title.trim()) {
      toast.error('Task title is required when creating a deal');
      return;
    }
    if (!newDeal.task_owner_id) {
      toast.error('Task owner is required when creating a deal');
      return;
    }
    
    try {
      const dealData = {
        ...newDeal,
        value: parseFloat(newDeal.value) || 0,
        probability: parseInt(newDeal.probability) || 0,
        lead_id: newDeal.lead_id && newDeal.lead_id !== 'none' ? newDeal.lead_id : null,
        contact_id: newDeal.contact_id && newDeal.contact_id !== 'none' ? newDeal.contact_id : null,
        company_id: newDeal.company_id && newDeal.company_id !== 'none' ? newDeal.company_id : null,
      };
      
      // Remove empty dates
      if (!dealData.expected_close_date) delete dealData.expected_close_date;
      if (!dealData.task_due_date) delete dealData.task_due_date;
      
      await axios.post(`${API}/deals`, dealData, { headers, withCredentials: true });
      toast.success('Deal created with associated task');
      setIsAddDialogOpen(false);
      setNewDeal({
        name: '',
        value: 0,
        currency: 'EUR',
        stage: 'lead',
        probability: 20,
        expected_close_date: '',
        tags: [],
        notes: '',
        lead_id: '',
        contact_id: '',
        company_id: '',
        task_title: '',
        task_owner_id: '',
        task_description: '',
        task_due_date: ''
      });
      fetchDeals();
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create deal');
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    const stageInfo = stages.find(s => s.id === newStage);
    try {
      await axios.put(`${API}/deals/${dealId}`, { 
        stage: newStage,
        probability: stageInfo?.probability || 0
      }, {
        headers,
        withCredentials: true
      });
      toast.success('Deal stage updated');
      fetchDeals();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update deal');
    }
  };

  const clearFilters = () => {
    setFilterStage('');
    setFilterTag('');
    setFilterOwner('');
  };

  const getStageDeals = (stageId) => deals.filter(deal => deal.stage === stageId);
  const getStageValue = (stageId) => getStageDeals(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  const getWeightedValue = (stageId) => getStageDeals(stageId).reduce((sum, deal) => 
    sum + (deal.value || 0) * ((deal.probability || 0) / 100), 0
  );

  const hasActiveFilters = filterStage || filterTag || filterOwner;

  const handleDeleteDeal = async (dealId) => {
    try {
      await axios.delete(`${API}/deals/${dealId}`, { headers, withCredentials: true });
      toast.success('Deal deleted');
      fetchDeals();
    } catch { toast.error('Failed to delete deal'); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="deals-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="deals-title">Deals Pipeline</h1>
            <p className="text-slate-600 mt-1">Track your deals through the sales pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-sm flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-[#A100FF] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`} data-testid="kanban-view-btn">
                <LayoutGrid className="w-3.5 h-3.5" /> Kanban
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm flex items-center gap-1 ${viewMode === 'list' ? 'bg-[#A100FF] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`} data-testid="list-view-btn">
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A100FF] hover:bg-purple-700" data-testid="add-deal-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDeal} className="space-y-4 pt-4">
                {/* Deal Info Section */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="font-semibold text-slate-700">Deal Information</h3>
                  <div className="space-y-2">
                    <Label>Deal Name *</Label>
                    <Input
                      value={newDeal.name}
                      onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                      placeholder="e.g., Enterprise License - Acme Corp"
                      required
                      data-testid="deal-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          value={newDeal.value}
                          onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                          className="pl-9"
                          data-testid="deal-value"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Probability %</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={newDeal.probability}
                          onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })}
                          className="pl-9"
                          data-testid="deal-probability"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stage</Label>
                      <Select
                        value={newDeal.stage}
                        onValueChange={(value) => {
                          const stageInfo = stages.find(s => s.id === value);
                          setNewDeal({ 
                            ...newDeal, 
                            stage: value,
                            probability: stageInfo?.probability || newDeal.probability
                          });
                        }}
                      >
                        <SelectTrigger data-testid="deal-stage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.slice(0, -1).map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Close Date</Label>
                      <Input
                        type="date"
                        value={newDeal.expected_close_date}
                        onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
                        data-testid="deal-close-date"
                      />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        data-testid="deal-tag-input"
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    {newDeal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newDeal.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {existingTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs text-slate-500">Existing tags:</span>
                        {existingTags.slice(0, 5).map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-slate-100"
                            onClick={() => !newDeal.tags.includes(tag) && setNewDeal({...newDeal, tags: [...newDeal.tags, tag]})}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={newDeal.notes}
                      onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                      placeholder="Additional details..."
                      data-testid="deal-notes"
                    />
                  </div>
                </div>

                {/* Link to Entity */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-800 text-sm">Link Deal To</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Lead</Label>
                      <Select value={newDeal.lead_id || 'none'} onValueChange={(v) => {
                        setNewDeal({ ...newDeal, lead_id: v === 'none' ? '' : v });
                        if (v !== 'none') setNewDeal(prev => ({ ...prev, lead_id: v, probability: Math.min(prev.probability, 30) }));
                      }}>
                        <SelectTrigger className="h-8 text-xs" data-testid="deal-lead-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {availableLeads.map(l => <SelectItem key={l.lead_id} value={l.lead_id}>{l.first_name} {l.last_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact</Label>
                      <Select value={newDeal.contact_id || 'none'} onValueChange={(v) => setNewDeal({ ...newDeal, contact_id: v === 'none' ? '' : v })}>
                        <SelectTrigger className="h-8 text-xs" data-testid="deal-contact-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {availableContacts.map(c => <SelectItem key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Company</Label>
                      <Select value={newDeal.company_id || 'none'} onValueChange={(v) => setNewDeal({ ...newDeal, company_id: v === 'none' ? '' : v })}>
                        <SelectTrigger className="h-8 text-xs" data-testid="deal-company-select"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {availableCompanies.map(c => <SelectItem key={c.company_id} value={c.company_id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newDeal.lead_id && newDeal.lead_id !== 'none' && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Linking to a lead suggests a lower probability of closing. Consider 10-30%.</p>
                  )}
                </div>
                
                {/* Mandatory Task Section */}
                <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Initial Task (Required)
                  </h3>
                  <p className="text-xs text-purple-700">Every deal must have an initial task and owner</p>
                  
                  <div className="space-y-2">
                    <Label>Task Title *</Label>
                    <Input
                      value={newDeal.task_title}
                      onChange={(e) => setNewDeal({ ...newDeal, task_title: e.target.value })}
                      placeholder="e.g., Initial contact call"
                      required
                      data-testid="task-title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Task Owner *</Label>
                      <Select
                        value={newDeal.task_owner_id}
                        onValueChange={(value) => setNewDeal({ ...newDeal, task_owner_id: value })}
                      >
                        <SelectTrigger data-testid="task-owner">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.length > 0 ? members.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              {member.name}
                            </SelectItem>
                          )) : user?.user_id ? (
                            <SelectItem value={user.user_id}>
                              {user?.name || 'Me'}
                            </SelectItem>
                          ) : (
                            <SelectItem value="self">Me (default)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Task Due Date</Label>
                      <Input
                        type="date"
                        value={newDeal.task_due_date}
                        onChange={(e) => setNewDeal({ ...newDeal, task_due_date: e.target.value })}
                        data-testid="task-due-date"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Task Description</Label>
                    <Input
                      value={newDeal.task_description}
                      onChange={(e) => setNewDeal({ ...newDeal, task_description: e.target.value })}
                      placeholder="What needs to be done?"
                      data-testid="task-description"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-[#A100FF] hover:bg-purple-700" data-testid="submit-deal-btn">
                  Create Deal with Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            <Select value={filterStage || "all"} onValueChange={(v) => setFilterStage(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]" data-testid="filter-stage">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterTag || "all"} onValueChange={(v) => setFilterTag(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]" data-testid="filter-tag">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {existingTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterOwner || "all"} onValueChange={(v) => setFilterOwner(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]" data-testid="filter-owner">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Bulk actions */}
        {selectedDealIds.length > 0 && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="text-sm font-medium text-purple-800">{selectedDealIds.length} selected</span>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={async () => {
              try { await axios.post(`${API}/bulk/delete`, { entity_type: 'deal', entity_ids: selectedDealIds }, { headers, withCredentials: true }); toast.success('Deals deleted'); setSelectedDealIds([]); fetchDeals(); } catch { toast.error('Failed'); }
            }} data-testid="bulk-delete-deals"><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedDealIds([])}>Clear</Button>
          </div>
        )}

        {/* Pipeline Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="py-3 px-4 text-left w-10"><input type="checkbox" checked={selectedDealIds.length === deals.length && deals.length > 0} onChange={() => setSelectedDealIds(selectedDealIds.length === deals.length ? [] : deals.map(d => d.deal_id))} className="accent-[#A100FF]" /></th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Deal</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Value</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Stage</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Probability</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Tags</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.deal_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`deal-list-row-${deal.deal_id}`}>
                      <td className="py-3 px-4"><input type="checkbox" checked={selectedDealIds.includes(deal.deal_id)} onChange={() => setSelectedDealIds(prev => prev.includes(deal.deal_id) ? prev.filter(x => x !== deal.deal_id) : [...prev, deal.deal_id])} className="accent-[#A100FF]" /></td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{deal.name}</p>
                        {deal.notes && <p className="text-xs text-slate-500 truncate max-w-[200px]">{deal.notes}</p>}
                      </td>
                      <td className="py-3 px-4 font-medium">€{deal.value?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Select value={deal.stage} onValueChange={(v) => handleStageChange(deal.deal_id, v)}>
                          <SelectTrigger className="w-[120px] h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-xs">{deal.probability}%</td>
                      <td className="py-3 px-4"><div className="flex gap-1">{deal.tags?.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div></td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3 h-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/chat?type=deal&id=${deal.deal_id}`)}><MessageSquare className="w-3 h-3 mr-2" />Discuss</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDeal(deal.deal_id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deals.length === 0 && <p className="text-center text-slate-500 py-8">No deals</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {stages.map((stage) => (
                <div key={stage.id} className="w-72 flex-shrink-0" data-testid={`stage-${stage.id}`}>
                  <Card className={`border-t-4 ${stage.color}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                          {getStageDeals(stage.id).length}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          €{getStageValue(stage.id).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Weighted: €{getWeightedValue(stage.id).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                      {getStageDeals(stage.id).map((deal) => (
                        <Card
                          key={deal.deal_id}
                          className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          data-testid={`deal-card-${deal.deal_id}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">{deal.name}</p>
                                <p className="text-lg font-bold text-[#A100FF] mt-1">
                                  €{(deal.value || 0).toLocaleString()}
                                </p>
                                
                                {/* Probability badge */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={deal.probability >= 70 ? "default" : deal.probability >= 40 ? "secondary" : "outline"} className="text-xs">
                                    {deal.probability || 0}% prob
                                  </Badge>
                                </div>
                                
                                {/* Expected close date */}
                                {deal.expected_close_date && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(deal.expected_close_date).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {/* Tags */}
                                {deal.tags && deal.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {deal.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/chat?type=deal&id=${deal.deal_id}`)}>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Discuss Deal
                                  </DropdownMenuItem>
                                  {stages.map((s) => (
                                    <DropdownMenuItem
                                      key={s.id}
                                      onClick={() => handleStageChange(deal.deal_id, s.id)}
                                      disabled={s.id === deal.stage}
                                    >
                                      Move to {s.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {deal.notes && (
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{deal.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {getStageDeals(stage.id).length === 0 && (
                        <p className="text-center text-sm text-slate-400 py-4">No deals</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealsPage;
