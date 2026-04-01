import { useT } from '../useT';
import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Plus, Search, Target, CheckSquare, MessageSquare, Users, MoreVertical,
  Trash2, Edit2, Save, Calendar, X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const ProjectsPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const { t } = useT();
  const [deals, setDeals] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', deal_id: '', members: [] });
  // Task creation within project
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const ax = { headers, withCredentials: true };

  useEffect(() => { fetchProjects(); fetchDeals(); fetchMembers(); }, []);

  const fetchProjects = async () => {
    try { const r = await axios.get(`${API}/projects`, ax); setProjects(r.data); }
    catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };
  const fetchDeals = async () => { try { const r = await axios.get(`${API}/deals`, ax); setDeals(r.data); } catch (err) { console.error(err); } };
  const fetchMembers = async () => {
    try {
      const orgRes = await axios.get(`${API}/organizations/current`, ax);
      if (orgRes.data?.organization_id) {
        const r = await axios.get(`${API}/organizations/${orgRes.data.organization_id}/members`, ax);
        setMembers(r.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;
    try {
      const payload = { ...newProject, deal_id: newProject.deal_id === 'none' ? null : newProject.deal_id || null };
      const r = await axios.post(`${API}/projects`, payload, ax);
      toast.success('Project created');
      setShowCreate(false);
      setNewProject({ name: '', description: '', deal_id: '', members: [] });
      fetchProjects();
      openProject(r.data.project_id);
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const openProject = async (id) => {
    try { const r = await axios.get(`${API}/projects/${id}`, ax); setSelectedProject(r.data); }
    catch { toast.error('Failed to load project'); }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !selectedProject) return;
    try {
      const payload = { ...newTask, project_id: selectedProject.project_id, related_deal_id: selectedProject.deal_id || undefined };
      if (!payload.due_date) delete payload.due_date;
      if (!payload.assigned_to) payload.assigned_to = user?.user_id;
      await axios.post(`${API}/tasks`, payload, ax);
      toast.success('Task added');
      setShowAddTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '' });
      openProject(selectedProject.project_id);
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status }, ax);
      openProject(selectedProject.project_id);
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await axios.delete(`${API}/projects/${id}`, ax); toast.success('Deleted'); setSelectedProject(null); fetchProjects(); }
    catch { toast.error('Failed'); }
  };

  const handleUpdateStatus = async (id, status) => {
    try { await axios.put(`${API}/projects/${id}`, { status }, ax); fetchProjects(); if (selectedProject?.project_id === id) openProject(id); }
    catch {}
  };

  const statusColors = { active: 'bg-emerald-100 text-emerald-700', on_hold: 'bg-amber-100 text-amber-700', completed: 'bg-blue-100 text-blue-700' };
  const priorityColors = { low: 'bg-slate-400', medium: 'bg-amber-400', high: 'bg-rose-500' };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="projects-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ t('projects.title') }</h1>
            <p className="text-slate-500 text-sm mt-1">{ t('projects.subtitle') }</p>
          </div>
          <Button className="bg-[#A100FF] hover:bg-purple-700" onClick={() => setShowCreate(true)} data-testid="new-project-btn">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" /></div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="font-medium text-slate-600">{ t('projects.noProjects') }</p>
            <p className="text-sm text-slate-400 mt-1">Create a project to organize tasks around a deal</p>
            <Button className="mt-4 bg-[#A100FF] hover:bg-purple-700" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Create Project</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Card key={p.project_id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openProject(p.project_id)} data-testid={`project-card-${p.project_id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      {p.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>}
                    </div>
                    <Badge className={`${statusColors[p.status] || 'bg-slate-100'} text-xs`}>{p.status}</Badge>
                  </div>
                  <Progress value={p.progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{p.tasks_done}/{p.task_count} tasks done</span>
                    <span>{p.progress}%</span>
                  </div>
                  {p.deal_id && <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded inline-block"><Target className="w-3 h-3 inline mr-1" />Linked deal</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle><Plus className="w-5 h-5 inline mr-2 text-[#A100FF]" />{ t('projects.newProject') }</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Project Name *</Label><Input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Q2 Enterprise Onboarding" data-testid="project-name" /></div>
              <div><Label>Description</Label><Textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} rows={2} placeholder="Project goals and scope..." /></div>
              <div><Label>Link to Deal</Label>
                <Select value={newProject.deal_id || 'none'} onValueChange={v => setNewProject({ ...newProject, deal_id: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Select deal" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">No deal</SelectItem>{deals.map(d => <SelectItem key={d.deal_id} value={d.deal_id}>{d.name} — €{d.value?.toLocaleString()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full bg-[#A100FF] hover:bg-purple-700" data-testid="create-project-submit"><Plus className="w-4 h-4 mr-2" /> Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Project Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-3xl">
            {selectedProject && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedProject.name}</h2>
                    {selectedProject.description && <p className="text-sm text-slate-500 mt-1">{selectedProject.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedProject.status} onValueChange={v => handleUpdateStatus(selectedProject.project_id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on_hold">On Hold</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteProject(selectedProject.project_id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{selectedProject.tasks_done}/{selectedProject.task_count} tasks</span><span>{selectedProject.progress}%</span></div>
                  <Progress value={selectedProject.progress} className="h-2" />
                </div>

                {/* Linked Deal */}
                {selectedProject.deal && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-center justify-between">
                    <div><p className="text-sm font-medium text-purple-900"><Target className="w-4 h-4 inline mr-1" />{selectedProject.deal.name}</p><p className="text-xs text-purple-600">€{selectedProject.deal.value?.toLocaleString()} — {selectedProject.deal.stage}</p></div>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedProject(null); navigate(`/deals`); }}>{ t('projects.viewDeal') }</Button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#A100FF] hover:bg-purple-700" onClick={() => setShowAddTask(true)} data-testid="add-task-to-project"><Plus className="w-4 h-4 mr-1" />{ t('projects.addTask') }</Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedProject(null); navigate(`/chat?type=project&id=${selectedProject.project_id}`); }}><MessageSquare className="w-4 h-4 mr-1" />{ t('projects.projectChat') }</Button>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-slate-700">Tasks</h3>
                  {selectedProject.tasks?.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No tasks yet. Add one to get started.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {selectedProject.tasks?.map(task => (
                        <div key={task.task_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50" data-testid={`project-task-${task.task_id}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => handleTaskStatus(task.task_id, task.status === 'done' ? 'todo' : 'done')} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                              {task.status === 'done' && <CheckSquare className="w-3 h-3" />}
                            </button>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority] || 'bg-slate-400'}`} />
                                <span className="text-xs text-slate-500">{task.priority}</span>
                                {task.due_date && <span className="text-xs text-slate-400"><Calendar className="w-3 h-3 inline mr-0.5" />{new Date(task.due_date).toLocaleDateString()}</span>}
                                {task.assigned_to && <span className="text-xs text-purple-600">{members.find(m => m.user_id === task.assigned_to)?.name || 'Assigned'}</span>}
                              </div>
                            </div>
                          </div>
                          <Select value={task.status} onValueChange={v => handleTaskStatus(task.task_id, v)}>
                            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="todo">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="done">Done</SelectItem></SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Members */}
                <div>
                  <h3 className="font-semibold text-sm text-slate-700 mb-2"><Users className="w-4 h-4 inline mr-1" /> Team ({selectedProject.members?.length || 0})</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProject.members?.map(mid => {
                      const m = members.find(x => x.user_id === mid);
                      return m ? <Badge key={mid} variant="outline" className="text-xs">{m.name}</Badge> : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Task to Project Dialog */}
        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Task to Project</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label>Title *</Label><Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task description" data-testid="project-task-title" /></div>
              <div><Label>Description</Label><Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Assign To</Label>
                  <Select value={newTask.assigned_to || 'self'} onValueChange={v => setNewTask({ ...newTask, assigned_to: v === 'self' ? '' : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="self">Myself</SelectItem>{members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} /></div>
              <Button onClick={handleAddTask} className="w-full bg-[#A100FF] hover:bg-purple-700" data-testid="submit-project-task"><Plus className="w-4 h-4 mr-2" />{ t('projects.addTask') }</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
