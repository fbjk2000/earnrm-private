import { useT } from '../useT';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Upload, Search, Trash2, Download, Zap, CheckSquare, X } from 'lucide-react';

const FilesPage = () => {
  const { token } = useAuth();
  const { t } = useT();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [linkedType, setLinkedType] = useState('none');
  const [linkedId, setLinkedId] = useState('none');
  const [description, setDescription] = useState('');
  const [entities, setEntities] = useState({ leads: [], contacts: [], companies: [], deals: [], projects: [], campaigns: [] });
  const fileRef = useRef(null);

  const getCfg = () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true });

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchFiles();
    fetchEntities();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFiles = async () => {
    try { const r = await axios.get(`${API}/files`, getCfg()); setFiles(r.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEntities = async () => {
    try {
      const cfg = getCfg();
      const results = await Promise.allSettled([
        axios.get(`${API}/leads`, cfg), axios.get(`${API}/contacts`, cfg), axios.get(`${API}/companies`, cfg),
        axios.get(`${API}/deals`, cfg), axios.get(`${API}/projects`, cfg), axios.get(`${API}/campaigns`, cfg)
      ]);
      const [leads, contacts, companies, deals, projects, campaigns] = results.map(r => r.status === 'fulfilled' ? r.value.data || [] : []);
      setEntities({ leads, contacts, companies, deals, projects, campaigns });
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const params = new URLSearchParams();
    if (linkedType && linkedType !== 'none') params.set('linked_type', linkedType);
    if (linkedId && linkedId !== 'none') params.set('linked_id', linkedId);
    if (description) params.set('description', description);
    try {
      const res = await axios.post(`${API}/files/upload?${params}`, formData, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 60000 });
      toast.success('File uploaded');
      if (res.data.ai_summary) toast.success(`AI: ${res.data.ai_summary.summary?.slice(0, 80)}...`);
      fetchFiles();
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) { console.error(err); toast.error(err.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (fileId) => {
    try { await axios.delete(`${API}/files/${fileId}`, getCfg()); toast.success('Deleted'); fetchFiles(); }
    catch (err) { console.error(err); toast.error('Failed'); }
  };

  const handleCreateTasks = async (fileId) => {
    try {
      const res = await axios.post(`${API}/files/${fileId}/create-tasks`, {}, getCfg());
      toast.success(`${res.data.tasks_created} tasks created`);
    } catch (err) { console.error(err); toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filtered = files.filter(f => f.original_name?.toLowerCase().includes(searchQuery.toLowerCase()) || f.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  const entityOptions = linkedType === 'lead' ? entities.leads.map(l => ({ id: l.lead_id, label: `${l.first_name} ${l.last_name}` }))
    : linkedType === 'contact' ? entities.contacts.map(c => ({ id: c.contact_id, label: `${c.first_name} ${c.last_name}` }))
    : linkedType === 'company' ? entities.companies.map(c => ({ id: c.company_id, label: c.name }))
    : linkedType === 'deal' ? entities.deals.map(d => ({ id: d.deal_id, label: d.name }))
    : linkedType === 'project' ? entities.projects.map(p => ({ id: p.project_id, label: p.name }))
    : linkedType === 'campaign' ? entities.campaigns.map(c => ({ id: c.campaign_id, label: c.name || c.subject }))
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="files-page">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Files</h1>
          <p className="text-slate-500 text-sm mt-1">Upload, manage, and link files to your CRM records</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Link to type</Label>
                <Select value={linkedType} onValueChange={v => { setLinkedType(v); setLinkedId('none'); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {linkedType !== 'none' && (
                <div><Label className="text-xs">Select record</Label>
                  <Select value={linkedId} onValueChange={setLinkedId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {entityOptions.map(e => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div><Label className="text-xs">Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" className="h-8 text-xs" /></div>
              <div className="flex items-end">
                <Button className="w-full h-8 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading...' : <><Upload className="w-3.5 h-3.5 mr-1" /> Upload File</>}
                </Button>
                <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search files..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* File List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Upload className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No files yet</p>
                <p className="text-sm mt-1">Upload files and link them to your CRM records</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-slate-50">
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">File</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Linked To</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Size</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">AI Summary</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-slate-500">Uploaded</th>
                  <th className="py-3 px-4 w-28"></th>
                </tr></thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.file_id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium truncate max-w-[200px]">{f.original_name}</p>
                        {f.description && <p className="text-xs text-slate-400">{f.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        {f.linked_type ? <Badge variant="secondary" className="text-xs">{f.linked_type}</Badge> : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{formatSize(f.size)}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[200px] truncate">{f.ai_summary?.summary || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{f.uploaded_by_name}<br/>{new Date(f.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <a href={`${API}/files/${f.file_id}/download`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="w-3.5 h-3.5" /></Button></a>
                          {f.ai_summary?.follow_ups?.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#7C3AED]" onClick={() => handleCreateTasks(f.file_id)} title="Create follow-up tasks"><CheckSquare className="w-3.5 h-3.5" /></Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(f.file_id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FilesPage;
