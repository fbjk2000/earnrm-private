import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Search, Users, Mail, Phone, Building, Linkedin, Globe, MapPin, Edit2,
  Save, Briefcase, Tag, Wand2, Target, DollarSign, Clock, MessageSquare
} from 'lucide-react';

const ContactsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const axiosConfig = { headers, withCredentials: true };

  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId && contacts.length > 0) {
      const c = contacts.find(x => x.contact_id === detailId);
      if (c) { setSelectedContact(c); setEditData({ ...c }); setEditMode(true); }
    }
  }, [contacts]);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API}/contacts`, axiosConfig);
      setContacts(res.data);
    } catch { toast.error('Failed to fetch contacts'); }
    finally { setLoading(false); }
  };

  const openDetail = (c) => { setSelectedContact(c); setEditData({ ...c }); setEditMode(false); };

  const handleSave = async () => {
    if (!selectedContact) return;
    setSaving(true);
    try {
      const { contact_id, organization_id, created_by, created_at, _id, ...updates } = editData;
      const res = await axios.put(`${API}/contacts/${selectedContact.contact_id}`, updates, axiosConfig);
      toast.success('Contact updated');
      setSelectedContact(res.data);
      setEditData(res.data);
      setEditMode(false);
      fetchContacts();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const filtered = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.first_name?.toLowerCase().includes(q) || c.last_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
  });

  const fields = [
    { key: 'first_name', label: 'First Name' }, { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' }, { key: 'job_title', label: 'Job Title' },
    { key: 'linkedin_url', label: 'LinkedIn' }, { key: 'website', label: 'Website' },
    { key: 'location', label: 'Location' }, { key: 'industry', label: 'Industry' },
    { key: 'company_size', label: 'Company Size' }, { key: 'budget', label: 'Budget' },
    { key: 'timeline', label: 'Timeline' }, { key: 'preferred_contact_method', label: 'Preferred Contact' },
  ];

  const viewFields = [
    { label: 'Email', key: 'email', icon: <Mail className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Phone', key: 'phone', icon: <Phone className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Company', key: 'company', icon: <Building className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Job Title', key: 'job_title', icon: <Briefcase className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Website', key: 'website', icon: <Globe className="w-3.5 h-3.5 text-slate-400" />, link: true },
    { label: 'LinkedIn', key: 'linkedin_url', icon: <Linkedin className="w-3.5 h-3.5 text-slate-400" />, link: true },
    { label: 'Location', key: 'location', icon: <MapPin className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Industry', key: 'industry', icon: <Tag className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Budget', key: 'budget', icon: <DollarSign className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Timeline', key: 'timeline', icon: <Clock className="w-3.5 h-3.5 text-slate-400" /> },
    { label: 'Decision Maker', key: 'decision_maker', icon: <Target className="w-3.5 h-3.5 text-slate-400" />, badge: true },
    { label: 'AI Score', key: 'ai_score', icon: null },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="contacts-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="contacts-title">Contacts</h1>
            <p className="text-slate-500 text-sm mt-1">Converted leads and customer profiles</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" data-testid="contacts-search" />
        </div>

        <Card>
          <CardContent className="pt-4">
            {loading ? (
              <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No contacts yet</p>
                <p className="text-sm mt-1">Convert qualified leads to create contacts</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((c, i) => (
                  <div key={c.contact_id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => openDetail(c)} data-testid={`contact-row-${i}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-medium">{c.first_name?.[0]}{c.last_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{c.first_name} {c.last_name}</p>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                            {c.company && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{c.company}</span>}
                            {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.decision_maker && <Badge className="bg-amber-100 text-amber-700 text-xs">Decision Maker</Badge>}
                        {c.ai_score && <Badge className="bg-purple-100 text-purple-700 text-xs">{c.ai_score}/100</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Detail Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => { setSelectedContact(null); setEditMode(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-medium text-sm">{selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}</span>
                    </div>
                    {editMode ? 'Edit Contact' : `${selectedContact.first_name} ${selectedContact.last_name}`}
                  </span>
                  {!editMode && (
                    <Button size="sm" variant="outline" onClick={() => setEditMode(true)} data-testid="edit-contact-btn">
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>

              {editMode ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {fields.map(f => (
                    <div key={f.key}>
                      <Label className="text-xs text-slate-500 mb-1 block">{f.label}</Label>
                      <Input value={editData[f.key] || ''} onChange={(e) => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))} data-testid={`edit-contact-${f.key}`} />
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-slate-500">Decision Maker</Label>
                    <Switch checked={!!editData.decision_maker} onCheckedChange={(v) => setEditData(prev => ({ ...prev, decision_maker: v }))} data-testid="edit-decision-maker" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500 mb-1 block">Pain Points</Label>
                    <Textarea value={editData.pain_points || ''} onChange={(e) => setEditData(prev => ({ ...prev, pain_points: e.target.value }))} rows={2} data-testid="edit-pain-points" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500 mb-1 block">Notes</Label>
                    <Textarea value={editData.notes || ''} onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="col-span-2 flex gap-2 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="bg-[#A100FF] hover:bg-purple-700" data-testid="save-contact-btn">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setEditMode(false); setEditData({ ...selectedContact }); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {viewFields.filter(f => selectedContact[f.key]).map(f => (
                      <div key={f.label} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 flex items-center gap-1">{f.icon}{f.label}</p>
                        {f.badge ? (
                          <Badge className={selectedContact[f.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>{selectedContact[f.key] ? 'Yes' : 'No'}</Badge>
                        ) : f.link ? (
                          <a href={String(selectedContact[f.key]).startsWith('http') ? selectedContact[f.key] : `https://${selectedContact[f.key]}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#A100FF] hover:underline truncate block">{selectedContact[f.key]}</a>
                        ) : (
                          <p className="text-sm font-medium text-slate-900 truncate">{f.key === 'ai_score' ? `${selectedContact[f.key]}/100` : selectedContact[f.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedContact.pain_points && (
                    <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500 mb-1">Pain Points</p><p className="text-sm text-slate-700">{selectedContact.pain_points}</p></div>
                  )}
                  {selectedContact.notes && (
                    <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-700">{selectedContact.notes}</p></div>
                  )}
                  {selectedContact.enrichment && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 space-y-2">
                      <p className="text-sm font-medium text-purple-900 flex items-center gap-1"><Wand2 className="w-4 h-4" /> AI Enrichment</p>
                      {selectedContact.enrichment.recommended_approach && <p className="text-sm text-slate-700">{selectedContact.enrichment.recommended_approach}</p>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {selectedContact.deal_id && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/deals?detail=${selectedContact.deal_id}`)}>
                        <Target className="w-3.5 h-3.5 mr-1" /> View Deal
                      </Button>
                    )}
                    {selectedContact.phone && (
                      <Button size="sm" variant="outline" onClick={() => navigate('/calls')}>
                        <Phone className="w-3.5 h-3.5 mr-1" /> Call
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ContactsPage;
