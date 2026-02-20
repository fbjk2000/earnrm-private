import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLead, getLeadSummary, scoreLead } from '../services/api';

const LeadDetailScreen = ({ route }) => {
  const { leadId } = route.params;
  const [lead, setLead] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [scoring, setScoring] = useState(false);

  const fetchLead = async () => {
    try {
      const data = await getLead(leadId);
      setLead(data);
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      Alert.alert('Error', 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleGetSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await getLeadSummary(leadId);
      setSummary(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleScore = async () => {
    setScoring(true);
    try {
      const data = await scoreLead(leadId);
      setLead((prev) => ({ ...prev, ai_score: data.score }));
      Alert.alert('AI Score', `Lead scored: ${data.score}/100`);
    } catch (error) {
      Alert.alert('Error', 'Failed to score lead');
    } finally {
      setScoring(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A100FF" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ccc" />
        <Text style={styles.errorText}>Lead not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      new: '#3B82F6',
      contacted: '#F59E0B',
      qualified: '#10B981',
      negotiation: '#A100FF',
      closed: '#059669',
      lost: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {lead.first_name?.[0]}{lead.last_name?.[0]}
          </Text>
        </View>
        <Text style={styles.leadName}>{lead.first_name} {lead.last_name}</Text>
        <Text style={styles.leadCompany}>{lead.company || 'No company'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
          <Text style={styles.statusText}>{lead.status}</Text>
        </View>
        {lead.ai_score && (
          <View style={styles.scoreContainer}>
            <Ionicons name="flash" size={18} color="#F59E0B" />
            <Text style={styles.scoreText}>AI Score: {lead.ai_score}</Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          {lead.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#A100FF" />
              <Text style={styles.infoText}>{lead.email}</Text>
            </View>
          )}
          {lead.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#A100FF" />
              <Text style={styles.infoText}>{lead.phone}</Text>
            </View>
          )}
          {lead.job_title && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#A100FF" />
              <Text style={styles.infoText}>{lead.job_title}</Text>
            </View>
          )}
          {lead.linkedin_url && (
            <View style={styles.infoRow}>
              <Ionicons name="logo-linkedin" size={20} color="#A100FF" />
              <Text style={styles.infoText} numberOfLines={1}>{lead.linkedin_url}</Text>
            </View>
          )}
        </View>
      </View>

      {/* AI Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Features</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, scoring && styles.actionButtonDisabled]}
            onPress={handleScore}
            disabled={scoring}
          >
            {scoring ? (
              <ActivityIndicator size="small" color="#A100FF" />
            ) : (
              <>
                <Ionicons name="flash" size={24} color="#A100FF" />
                <Text style={styles.actionButtonText}>AI Score</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, loadingSummary && styles.actionButtonDisabled]}
            onPress={handleGetSummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? (
              <ActivityIndicator size="small" color="#A100FF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={24} color="#A100FF" />
                <Text style={styles.actionButtonText}>AI Summary</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Summary */}
      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{summary.summary || summary.overview}</Text>
            {summary.recommended_actions && (
              <>
                <Text style={styles.summarySubtitle}>Recommended Actions:</Text>
                {summary.recommended_actions.map((action, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.actionItemText}>{action}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      )}

      {/* Notes */}
      {lead.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{lead.notes}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  headerCard: {
    backgroundColor: '#A100FF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  leadName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  leadCompany: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  summarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default LeadDetailScreen;
