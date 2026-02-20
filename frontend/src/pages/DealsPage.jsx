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
import { Plus, MoreVertical, Euro, Calendar, Percent, Tag, Filter, X, Users, MessageSquare } from 'lucide-react';
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
    // Mandatory task fields
    task_title: '',
    task_owner_id: '',
    task_description: '',
    task_due_date: ''
  });
  const [tagInput, setTagInput] = useState('');

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
  }, [filterStage, filterTag, filterOwner]);

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
        probability: parseInt(newDeal.probability) || 0
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

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="deals-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="deals-title">Deals Pipeline</h1>
            <p className="text-slate-600 mt-1">Track your deals through the sales pipeline</p>
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

        {/* Pipeline Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" />
          </div>
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
