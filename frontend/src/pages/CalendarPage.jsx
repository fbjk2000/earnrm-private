import { useT } from '../useT';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, API } from '../App';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import {
  ChevronLeft, ChevronRight, Plus, Phone, CheckSquare, Target, X, Calendar as CalIcon, Clock
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const { t } = useT();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', end_date: '', notes: '', linked_type: '', linked_id: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [linkableEntities, setLinkableEntities] = useState({ leads: [], contacts: [], companies: [], deals: [], projects: [], campaigns: [] });

  const getCfg = () => ({ headers: { Authorization: `Bearer ${token}` }, withCredentials: true });

  const reloadEvents = async () => {
    try {
      const cfg = getCfg();
      const [earnrm, google] = await Promise.allSettled([
        axios.get(`${API}/calendar/events`, cfg),
        axios.get(`${API}/calendar/google/events`, cfg)
      ]);
      const all = [...(earnrm.status === 'fulfilled' ? earnrm.value.data || [] : []), ...(google.status === 'fulfilled' && Array.isArray(google.value.data) ? google.value.data : [])];
      setEvents(all);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    const cfg = { headers: h, withCredentials: true };
    Promise.allSettled([
      axios.get(`${API}/calendar/events`, cfg).then(r => setEvents(prev => [...(r.data || [])])),
      axios.get(`${API}/calendar/google/events`, cfg).then(r => { if (Array.isArray(r.data)) setEvents(prev => [...prev, ...r.data]); }),
      axios.get(`${API}/calendar/google/status`, cfg).then(r => setGoogleConnected(r.data.connected))
    ]).finally(() => setLoading(false));
    // Load linkable entities
    Promise.allSettled([
      axios.get(`${API}/leads`, cfg), axios.get(`${API}/contacts`, cfg), axios.get(`${API}/companies`, cfg),
      axios.get(`${API}/deals`, cfg), axios.get(`${API}/projects`, cfg), axios.get(`${API}/campaigns`, cfg)
    ]).then(results => {
      const [leads, contacts, companies, deals, projects, campaigns] = results.map(r => r.status === 'fulfilled' ? r.value.data || [] : []);
      setLinkableEntities({ leads, contacts, companies, deals, projects, campaigns });
    });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps



  const connectGoogle = async () => {
    try {
      const r = await axios.get(`${API}/calendar/google/auth-url`, getCfg());
      window.location.href = r.data.auth_url;
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to connect'); }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    try {
      const params = new URLSearchParams({ title: newEvent.title, date: new Date(newEvent.date).toISOString() });
      if (newEvent.notes) params.set('notes', newEvent.notes);
      if (newEvent.end_date) params.set('end_date', new Date(newEvent.end_date).toISOString());
      if (newEvent.linked_type && newEvent.linked_id) { params.set('linked_type', newEvent.linked_type); params.set('linked_id', newEvent.linked_id); }
      await axios.post(`${API}/calendar/events?${params}`, {}, getCfg());
      toast.success('Event created');
      setShowCreate(false);
      setNewEvent({ title: '', date: '', end_date: '', notes: '', linked_type: '', linked_id: '' });
      reloadEvents();
    } catch (err) { console.error(err); toast.error('Failed to create event'); }
  };

  const handleDeleteEvent = async (id) => {
    try { await axios.delete(`${API}/calendar/events/${id}`, getCfg()); toast.success('Deleted'); reloadEvents(); setSelectedEvent(null); }
    catch { toast.error('Failed'); }
  };

  const handleEventClick = (evt) => {
    if (evt.entity_type === 'lead') navigate(`/leads?detail=${evt.entity_id}`);
    else if (evt.entity_type === 'deal') navigate('/deals');
    else if (evt.entity_type === 'project') navigate('/projects');
    else if (evt.entity_type === 'task') navigate('/tasks');
    else setSelectedEvent(evt);
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const getEventsForDay = (day) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      try { return e.date?.substring(0, 10) === dayStr; } catch { return false; }
    });
  };

  // Week view
  const getWeekDays = () => {
    const start = new Date(currentDate);
    const dow = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = useMemo(() => getWeekDays(), [currentDate]);
  const prevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
  const nextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));

  const getEventsForDate = (d) => {
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return events.filter(e => { try { return e.date?.substring(0, 10) === dayStr; } catch { return false; } });
  };

  const typeIcons = { call: <Phone className="w-3 h-3" />, task: <CheckSquare className="w-3 h-3" />, deal: <Target className="w-3 h-3" />, event: <CalIcon className="w-3 h-3" />, google: <CalIcon className="w-3 h-3" /> };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4" data-testid="calendar-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ t('calendar.title') }</h1>
            <p className="text-slate-500 text-sm mt-1">{ t('calendar.subtitle') }</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setView('month')} className={`px-3 py-1.5 text-sm ${view === 'month' ? 'bg-[#A100FF] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{ t('calendar.month') }</button>
              <button onClick={() => setView('week')} className={`px-3 py-1.5 text-sm ${view === 'week' ? 'bg-[#A100FF] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{ t('calendar.week') }</button>
            </div>
            {!googleConnected ? (
              <Button variant="outline" onClick={connectGoogle} data-testid="connect-google-cal">
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Connect Google
              </Button>
            ) : (
              <Badge className="bg-blue-100 text-blue-700">{ t('calendar.googleConnected') }</Badge>
            )}
            <Button className="bg-[#A100FF] hover:bg-purple-700" onClick={() => setShowCreate(true)} data-testid="new-event-btn"><Plus className="w-4 h-4 mr-1" /> Event</Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={view === 'month' ? prevMonth : prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={view === 'month' ? nextMonth : nextWeek}><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={goToday}>{ t('calendar.today') }</Button>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {view === 'month' ? `${MONTHS[month]} ${year}` : `Week of ${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </h2>
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A100FF]" />{ t('calendar.legendCalls') }</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{ t('calendar.legendTasks') }</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />{ t('calendar.legendDeals') }</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" />{ t('calendar.legendEvents') }</span>
            {googleConnected && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Google</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" /></div>
        ) : view === 'month' ? (
          /* Month View */
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-slate-500 border-r last:border-r-0">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-r border-b bg-slate-50/50" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  return (
                    <div key={day} className={`min-h-[100px] border-r border-b p-1 hover:bg-slate-50 cursor-pointer transition-colors ${isToday(day) ? 'bg-purple-50/50' : ''}`}
                      onClick={() => { setSelectedDay(day); if (!dayEvents.length) { setNewEvent({ ...newEvent, date: `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` }); setShowCreate(true); } }}
                    >
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-[#A100FF] text-white' : 'text-slate-700'}`}>{day}</div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(evt => (
                          <div key={evt.id} className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80" style={{ backgroundColor: evt.color + '20', color: evt.color }}
                            onClick={(e) => { e.stopPropagation(); handleEventClick(evt); }}>
                            {typeIcons[evt.type]} {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Week View */
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {weekDays.map((d, i) => {
                  const dayEvents = getEventsForDate(d);
                  const isCurrentDay = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`border-r last:border-r-0 min-h-[400px] ${isCurrentDay ? 'bg-purple-50/30' : ''}`}>
                      <div className={`p-2 text-center border-b ${isCurrentDay ? 'bg-[#A100FF]/10' : 'bg-slate-50'}`}>
                        <div className="text-xs text-slate-500">{DAYS[i]}</div>
                        <div className={`text-lg font-semibold ${isCurrentDay ? 'text-[#A100FF]' : 'text-slate-900'}`}>{d.getDate()}</div>
                      </div>
                      <div className="p-1 space-y-1">
                        {dayEvents.map(evt => (
                          <div key={evt.id} className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 border-l-2" style={{ backgroundColor: evt.color + '10', borderColor: evt.color }}
                            onClick={() => handleEventClick(evt)}>
                            <div className="flex items-center gap-1 font-medium" style={{ color: evt.color }}>
                              {typeIcons[evt.type]}
                              <span className="truncate">{evt.title}</span>
                            </div>
                            {evt.notes && <p className="text-[10px] text-slate-500 truncate mt-0.5">{evt.notes}</p>}
                            {evt.value && <p className="text-[10px] text-slate-500">€{evt.value.toLocaleString()}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{ t('forms.newEvent') }</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label>Title *</Label><Input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Meeting, deadline..." data-testid="event-title" /></div>
            <div><Label>Start *</Label><Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} data-testid="event-date" /></div>
            <div><Label>End</Label><Input type="datetime-local" value={newEvent.end_date} onChange={e => setNewEvent({ ...newEvent, end_date: e.target.value })} data-testid="event-end-date" /></div>
            <div><Label>Notes</Label><Input value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} placeholder="Optional details" /></div>
            <div><Label>Link to</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={newEvent.linked_type || 'none'} onValueChange={v => setNewEvent({ ...newEvent, linked_type: v === 'none' ? '' : v, linked_id: '' })}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
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
                {newEvent.linked_type && (
                  <Select value={newEvent.linked_id || 'none'} onValueChange={v => setNewEvent({ ...newEvent, linked_id: v === 'none' ? '' : v })}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {newEvent.linked_type === 'lead' && linkableEntities.leads.map(l => <SelectItem key={l.lead_id} value={l.lead_id}>{l.first_name} {l.last_name}</SelectItem>)}
                      {newEvent.linked_type === 'contact' && linkableEntities.contacts.map(c => <SelectItem key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</SelectItem>)}
                      {newEvent.linked_type === 'company' && linkableEntities.companies.map(c => <SelectItem key={c.company_id} value={c.company_id}>{c.name}</SelectItem>)}
                      {newEvent.linked_type === 'deal' && linkableEntities.deals.map(d => <SelectItem key={d.deal_id} value={d.deal_id}>{d.name}</SelectItem>)}
                      {newEvent.linked_type === 'project' && linkableEntities.projects.map(p => <SelectItem key={p.project_id} value={p.project_id}>{p.name}</SelectItem>)}
                      {newEvent.linked_type === 'campaign' && linkableEntities.campaigns.map(c => <SelectItem key={c.campaign_id} value={c.campaign_id}>{c.name || c.subject}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <Button onClick={handleCreateEvent} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white" data-testid="create-event-submit"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-sm">
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                <h3 className="font-semibold text-slate-900">{selectedEvent.title}</h3>
              </div>
              <p className="text-sm text-slate-500"><Clock className="w-3.5 h-3.5 inline mr-1" />{new Date(selectedEvent.date).toLocaleString()}</p>
              {selectedEvent.notes && <p className="text-sm text-slate-600">{selectedEvent.notes}</p>}
              {selectedEvent.value && <p className="text-sm font-medium text-indigo-600">€{selectedEvent.value.toLocaleString()}</p>}
              {selectedEvent.type === 'event' && (
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteEvent(selectedEvent.id)}><X className="w-3.5 h-3.5 mr-1" /> Delete</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalendarPage;
