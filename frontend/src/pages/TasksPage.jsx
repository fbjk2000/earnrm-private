import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, MoreVertical, Calendar, Trash2, Filter, X, User, Edit2, Save, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TasksPage = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const [newTask, setNewTask] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    due_date: '', assigned_to: ''
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const ax = { headers, withCredentials: true };

  const statuses = [
    { id: 'todo', name: 'To Do', color: 'border-slate-300' },
    { id: 'in_progress', name: 'In Progress', color: 'border-blue-400' },
    { id: 'done', name: 'Done', color: 'border-emerald-400' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-slate-400' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-400' },
    { value: 'high', label: 'High', color: 'bg-rose-500' }
  ];

  useEffect(() => { fetchTasks(); fetchMembers(); }, [filterStatus, filterOwner]);

  const fetchTasks = async () => {
    try {
      let url = `${API}/tasks`;
      const params = [];
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (filterOwner) params.push(`assigned_to=${filterOwner}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await axios.get(url, ax);
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try {
      const orgRes = await axios.get(`${API}/organizations/current`, ax);
      if (orgRes.data?.organization_id) {
        const res = await axios.get(`${API}/organizations/${orgRes.data.organization_id}/members`, ax);
        setMembers(res.data || []);
      }
    } catch {}
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const data = { ...newTask };
      if (!data.due_date) delete data.due_date;
      if (!data.assigned_to) data.assigned_to = user?.user_id;
      await axios.post(`${API}/tasks`, data, ax);
      toast.success('Task created');
      setIsAddDialogOpen(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', assigned_to: '' });
      fetchTasks();
    } catch { toast.error('Failed to create task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status } : t));
      await axios.put(`${API}/tasks/${taskId}`, { status }, ax);
      fetchTasks();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`, ax);
      toast.success('Task deleted');
      setSelectedTask(null);
      fetchTasks();
    } catch { toast.error('Failed'); }
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;
    try {
      const { task_id, organization_id, created_by, created_at, _id, ...updates } = editData;
      if (!updates.due_date) delete updates.due_date;
      await axios.put(`${API}/tasks/${selectedTask.task_id}`, updates, ax);
      toast.success('Task updated');
      setEditMode(false);
      fetchTasks();
      const updated = await axios.get(`${API}/tasks`, ax);
      const fresh = updated.data.find(t => t.task_id === selectedTask.task_id);
      if (fresh) { setSelectedTask(fresh); setEditData(fresh); }
    } catch { toast.error('Failed to update'); }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setEditData({ ...task });
    setEditMode(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    if (newStatus === result.source.droppableId) return;
    handleStatusChange(taskId, newStatus);
  };

  const getStatusTasks = (statusId) => tasks.filter(t => t.status === statusId);
  const getOwnerName = (uid) => members.find(m => m.user_id === uid)?.name || 'Unknown';
  const hasFilters = filterStatus || filterOwner;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="tasks-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your team's tasks and to-dos</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white" data-testid="add-task-btn">
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-3 pt-2">
                <div><Label>Title *</Label><Input value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required data-testid="task-title" /></div>
                <div><Label>Description</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows={2} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Assign To</Label>
                    <Select value={newTask.assigned_to || 'self'} onValueChange={(v) => setNewTask({...newTask, assigned_to: v === 'self' ? '' : v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="self">Myself</SelectItem>{members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Due Date</Label><Input type="date" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} /></div>
                <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white" data-testid="submit-task">Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-36" data-testid="filter-status"><SelectValue placeholder="All Stages" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Stages</SelectItem>{statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterOwner || 'all'} onValueChange={(v) => setFilterOwner(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-36" data-testid="filter-owner"><SelectValue placeholder="All Owners" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Owners</SelectItem>{members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
            {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(''); setFilterOwner(''); }}><X className="w-3 h-3 mr-1" />Clear</Button>}
          </div>
        </Card>

        {/* Kanban with DnD */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid md:grid-cols-3 gap-6">
              {statuses.map((status) => (
                <Droppable droppableId={status.id} key={status.id}>
                  {(provided, snapshot) => (
                    <div data-testid={`column-${status.id}`}>
                      <Card className={`border-t-4 ${status.color} ${snapshot.isDraggingOver ? 'ring-2 ring-[#7C3AED]/20' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">{status.name}</CardTitle>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{getStatusTasks(status.id).length}</span>
                          </div>
                        </CardHeader>
                        <CardContent ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                          {getStatusTasks(status.id).map((task, idx) => (
                            <Draggable key={task.task_id} draggableId={task.task_id} index={idx}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps}
                                  className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#7C3AED]/20' : ''}`}
                                  data-testid={`task-card-${task.task_id}`}
                                >
                                  <div className="p-3">
                                    <div className="flex items-start gap-2">
                                      <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4 text-slate-300" />
                                      </div>
                                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openTaskDetail(task)}>
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className={`w-2 h-2 rounded-full ${priorities.find(p => p.value === task.priority)?.color || 'bg-slate-400'}`} />
                                          <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                                        </div>
                                        {task.description && <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>}
                                        {task.assigned_to && <div className="flex items-center gap-1 mt-2 text-xs text-[#7C3AED]"><User className="w-3 h-3" />{getOwnerName(task.assigned_to)}</div>}
                                        {task.due_date && <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}</div>}
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"><MoreVertical className="w-3 h-3" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => { openTaskDetail(task); setEditMode(true); }}><Edit2 className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                                          {statuses.map(s => <DropdownMenuItem key={s.id} onClick={() => handleStatusChange(task.task_id, s.id)} disabled={s.id === task.status}>Move to {s.name}</DropdownMenuItem>)}
                                          <DropdownMenuItem className="text-rose-600" onClick={() => handleDeleteTask(task.task_id)}><Trash2 className="w-3 h-3 mr-2" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {getStatusTasks(status.id).length === 0 && <p className="text-center text-sm text-slate-400 py-8">Drop tasks here</p>}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Task Detail / Edit Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => { setSelectedTask(null); setEditMode(false); }}>
        <DialogContent className="max-w-lg">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{editMode ? 'Edit Task' : selectedTask.title}</span>
                  {!editMode && <Button size="sm" variant="outline" onClick={() => setEditMode(true)} data-testid="edit-task-btn"><Edit2 className="w-3.5 h-3.5 mr-1" /> Edit</Button>}
                </DialogTitle>
              </DialogHeader>
              {editMode ? (
                <div className="space-y-3 pt-2">
                  <div><Label>Title</Label><Input value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})} data-testid="edit-task-title" /></div>
                  <div><Label>Description</Label><Textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} data-testid="edit-task-desc" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Status</Label>
                      <Select value={editData.status} onValueChange={v => setEditData({...editData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Priority</Label>
                      <Select value={editData.priority} onValueChange={v => setEditData({...editData, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Assign To</Label>
                      <Select value={editData.assigned_to || 'none'} onValueChange={v => setEditData({...editData, assigned_to: v === 'none' ? null : v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="none">Unassigned</SelectItem>{members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Due Date</Label><Input type="date" value={editData.due_date ? editData.due_date.split('T')[0] : ''} onChange={e => setEditData({...editData, due_date: e.target.value || null})} /></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveTask} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white" data-testid="save-task-btn"><Save className="w-4 h-4 mr-2" /> Save</Button>
                    <Button variant="outline" onClick={() => { setEditMode(false); setEditData({...selectedTask}); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {selectedTask.description && (
                    <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500 mb-1">Description</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedTask.description}</p></div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Status</p><p className="text-sm font-medium capitalize">{selectedTask.status?.replace('_', ' ')}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Priority</p>
                      <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${priorities.find(p => p.value === selectedTask.priority)?.color}`} /><span className="text-sm font-medium capitalize">{selectedTask.priority}</span></div>
                    </div>
                    {selectedTask.assigned_to && (
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Assigned To</p><p className="text-sm font-medium">{getOwnerName(selectedTask.assigned_to)}</p></div>
                    )}
                    {selectedTask.due_date && (
                      <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Due Date</p><p className="text-sm font-medium">{new Date(selectedTask.due_date).toLocaleDateString()}</p></div>
                    )}
                    {selectedTask.project_id && (
                      <div className="bg-purple-50 rounded-lg p-3"><p className="text-xs text-purple-500">Project</p><p className="text-sm font-medium text-purple-700">{selectedTask.project_id}</p></div>
                    )}
                    {selectedTask.related_deal_id && (
                      <div className="bg-purple-50 rounded-lg p-3"><p className="text-xs text-purple-500">Linked Deal</p><p className="text-sm font-medium text-purple-700">{selectedTask.related_deal_id}</p></div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteTask(selectedTask.task_id)}><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</Button>
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

export default TasksPage;
