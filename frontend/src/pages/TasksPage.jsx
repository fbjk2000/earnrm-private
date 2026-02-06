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
import { Plus, MoreVertical, Calendar, Trash2, Filter, X, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';

const TasksPage = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const statuses = [
    { id: 'todo', name: 'To Do', color: 'bg-slate-100 border-slate-300' },
    { id: 'in_progress', name: 'In Progress', color: 'bg-indigo-50 border-indigo-300' },
    { id: 'done', name: 'Done', color: 'bg-emerald-50 border-emerald-300' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-slate-400' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-400' },
    { value: 'high', label: 'High', color: 'bg-rose-500' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [filterStatus, filterOwner]);

  const fetchTasks = async () => {
    try {
      let url = `${API}/tasks`;
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterOwner) params.append('assigned_to', filterOwner);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers,
        withCredentials: true
      });
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
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

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...newTask };
      if (!taskData.due_date) delete taskData.due_date;
      if (!taskData.assigned_to) taskData.assigned_to = user?.user_id;
      
      await axios.post(`${API}/tasks`, taskData, { headers, withCredentials: true });
      toast.success('Task created successfully');
      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assigned_to: ''
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus }, {
        headers,
        withCredentials: true
      });
      toast.success('Task updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`, { headers, withCredentials: true });
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterOwner('');
  };

  const getStatusTasks = (statusId) => tasks.filter(task => task.status === statusId);
  const hasActiveFilters = filterStatus || filterOwner;

  // Get owner name helper
  const getOwnerName = (ownerId) => {
    const member = members.find(m => m.user_id === ownerId);
    return member?.name || 'Unassigned';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="tasks-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="tasks-title">Tasks</h1>
            <p className="text-slate-600 mt-1">Manage your team's tasks and to-dos</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-task-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                    data-testid="task-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Add details..."
                    rows={3}
                    data-testid="task-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger data-testid="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      data-testid="task-due-date"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assigned_to || "self"}
                    onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value === "self" ? (user?.user_id || "") : value })}
                  >
                    <SelectTrigger data-testid="task-assigned-to">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.length > 0 ? members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.name}
                        </SelectItem>
                      )) : (
                        <SelectItem value="self">
                          {user?.name || 'Me'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" data-testid="submit-task-btn">
                  Create Task
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
            
            <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]" data-testid="filter-status">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
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

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {statuses.map((status) => (
              <div key={status.id} data-testid={`column-${status.id}`}>
                <Card className={`border-t-4 ${status.color}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{status.name}</CardTitle>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                        {getStatusTasks(status.id).length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[200px]">
                    {getStatusTasks(status.id).map((task) => (
                      <Card
                        key={task.task_id}
                        className="bg-white shadow-sm hover:shadow-md transition-shadow"
                        data-testid={`task-card-${task.task_id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  priorities.find(p => p.value === task.priority)?.color || 'bg-slate-400'
                                }`} />
                                <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                              </div>
                              {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                              )}
                              
                              {/* Owner display */}
                              {task.assigned_to && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600">
                                  <User className="w-3 h-3" />
                                  {getOwnerName(task.assigned_to)}
                                </div>
                              )}
                              
                              {task.due_date && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                              
                              {/* Related deal indicator */}
                              {task.related_deal_id && (
                                <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded inline-block">
                                  Linked to Deal
                                </div>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {statuses.map((s) => (
                                  <DropdownMenuItem
                                    key={s.id}
                                    onClick={() => handleStatusChange(task.task_id, s.id)}
                                    disabled={s.id === task.status}
                                  >
                                    Move to {s.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem
                                  className="text-rose-600"
                                  onClick={() => handleDeleteTask(task.task_id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {getStatusTasks(status.id).length === 0 && (
                      <p className="text-center text-sm text-slate-400 py-8">No tasks</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
