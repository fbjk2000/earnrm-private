import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  Search,
  Sparkles,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  Mic,
  User,
  Building,
  AlertCircle
} from 'lucide-react';

const CallsPage = () => {
  const { token } = useAuth();
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [callMessage, setCallMessage] = useState('Thank you for your interest');
  const [calling, setCalling] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [twilioConfigured, setTwilioConfigured] = useState(true);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCalls = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/calls`, { headers });
      setCalls(res.data);
    } catch (err) {
      if (err.response?.status === 503) setTwilioConfigured(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/calls/stats/overview`, { headers });
      setStats(res.data);
    } catch {}
  }, [token]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leads`, { headers });
      setLeads(res.data);
    } catch {}
  }, [token]);

  useEffect(() => {
    Promise.all([fetchCalls(), fetchStats(), fetchLeads()]).finally(() => setLoading(false));
  }, [fetchCalls, fetchStats, fetchLeads]);

  const initiateCall = async () => {
    if (!selectedLead) return;
    setCalling(true);
    try {
      const res = await axios.post(`${API}/calls/initiate`, {
        lead_id: selectedLead,
        message: callMessage
      }, { headers });
      toast.success(`Call initiated to ${res.data.to}`);
      setShowCallDialog(false);
      setSelectedLead(null);
      fetchCalls();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  const analyzeCall = async (callId) => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API}/calls/${callId}/analyze`, {}, { headers });
      toast.success('Call analysis complete');
      setSelectedCall({ ...selectedCall, ai_analysis: res.data.analysis });
      fetchCalls();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDuration = (s) => {
    if (!s) return '0:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    ringing: 'bg-amber-100 text-amber-700',
    queued: 'bg-slate-100 text-slate-600',
    initiated: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    busy: 'bg-orange-100 text-orange-700',
    'no-answer': 'bg-slate-100 text-slate-600'
  };

  const filteredCalls = calls.filter(c =>
    c.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.to_number?.includes(searchQuery)
  );

  const leadsWithPhone = leads.filter(l => l.phone);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="calls-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="calls-page-title">Calls</h1>
            <p className="text-slate-500 text-sm mt-1">Outbound calling, recordings & AI analysis</p>
          </div>
          <Button
            onClick={() => setShowCallDialog(true)}
            className="bg-[#A100FF] hover:bg-purple-700"
            data-testid="new-call-btn"
          >
            <Phone className="w-4 h-4 mr-2" /> New Call
          </Button>
        </div>

        {/* Twilio Not Configured Banner */}
        {!twilioConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3" data-testid="twilio-not-configured">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Twilio not configured</p>
              <p className="text-sm text-amber-600 mt-1">Add your Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_FROM) in Settings to enable outbound calling.</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#A100FF]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-calls">{stats.total_calls}</p>
                    <p className="text-xs text-slate-500">Total Calls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900" data-testid="stat-completed">{stats.completed_calls}</p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900" data-testid="stat-avg-duration">{formatDuration(Math.round(stats.avg_duration_seconds))}</p>
                    <p className="text-xs text-slate-500">Avg Duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900" data-testid="stat-analyzed">{stats.analyzed_calls}</p>
                    <p className="text-xs text-slate-500">AI Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="calls-search"
          />
        </div>

        {/* Call History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Call History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Phone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No calls yet</p>
                <p className="text-sm mt-1">Start making outbound calls to your leads</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCalls.map((call) => (
                  <div
                    key={call.call_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCall(call)}
                    data-testid={`call-row-${call.call_id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {call.status === 'completed' ? (
                          <PhoneCall className="w-4 h-4 text-emerald-600" />
                        ) : call.status === 'failed' ? (
                          <PhoneOff className="w-4 h-4 text-red-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{call.lead_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{call.to_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[call.status] || 'bg-slate-100 text-slate-600'}`}>
                        {call.status}
                      </span>
                      <span className="text-xs text-slate-500 w-12 text-right">{formatDuration(call.duration)}</span>
                      {call.recording_url && <Mic className="w-4 h-4 text-[#A100FF]" />}
                      {call.ai_analysis && <Sparkles className="w-4 h-4 text-amber-500" />}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Call Dialog */}
        <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Outbound Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Select Lead</label>
                <Select value={selectedLead || ''} onValueChange={setSelectedLead}>
                  <SelectTrigger data-testid="call-lead-select">
                    <SelectValue placeholder="Choose a lead with phone number" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadsWithPhone.map(l => (
                      <SelectItem key={l.lead_id} value={l.lead_id}>
                        <span className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {l.first_name} {l.last_name} — {l.phone}
                        </span>
                      </SelectItem>
                    ))}
                    {leadsWithPhone.length === 0 && (
                      <div className="p-3 text-sm text-slate-500 text-center">No leads with phone numbers</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Opening Message</label>
                <Input
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  placeholder="Message to play when call connects"
                  data-testid="call-message-input"
                />
              </div>
              <Button
                onClick={initiateCall}
                disabled={!selectedLead || calling}
                className="w-full bg-[#A100FF] hover:bg-purple-700"
                data-testid="initiate-call-btn"
              >
                {calling ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> Make Call</span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Call Detail Dialog */}
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            {selectedCall && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-[#A100FF]" />
                    Call Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* Call info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Lead</p>
                      <p className="font-medium text-sm">{selectedCall.lead_name || 'Unknown'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium text-sm">{selectedCall.to_number}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="font-medium text-sm">{formatDuration(selectedCall.duration)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Status</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedCall.status] || 'bg-slate-100'}`}>
                        {selectedCall.status}
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Called By</p>
                      <p className="font-medium text-sm">{selectedCall.initiated_by_name}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="font-medium text-sm">{new Date(selectedCall.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Recording */}
                  {selectedCall.recording_url && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <p className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                        <Mic className="w-4 h-4" /> Recording
                      </p>
                      <audio controls className="w-full" data-testid="call-recording-player">
                        <source src={`${selectedCall.recording_url}.mp3`} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {selectedCall.ai_analysis ? (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 space-y-3" data-testid="call-analysis">
                      <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Analysis
                        <span className="ml-auto text-lg font-bold">{selectedCall.ai_analysis.score}/10</span>
                      </p>
                      <p className="text-sm text-slate-700">{selectedCall.ai_analysis.summary}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-700 mb-1">Strengths</p>
                          <ul className="space-y-1">
                            {selectedCall.ai_analysis.strengths?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-orange-700 mb-1">Improvements</p>
                          <ul className="space-y-1">
                            {selectedCall.ai_analysis.improvements?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <ArrowUpRight className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {selectedCall.ai_analysis.next_steps && (
                        <div>
                          <p className="text-xs font-medium text-blue-700 mb-1">Next Steps</p>
                          <ul className="space-y-1">
                            {selectedCall.ai_analysis.next_steps?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600">- {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : selectedCall.recording_url ? (
                    <Button
                      onClick={() => analyzeCall(selectedCall.call_id)}
                      disabled={analyzing}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      data-testid="analyze-call-btn"
                    >
                      {analyzing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Analyze with AI</span>
                      )}
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CallsPage;
