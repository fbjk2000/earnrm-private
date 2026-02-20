import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#A100FF']} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.welcomeSubtext}>
          Here's what's happening with your sales today
        </Text>
      </View>

      {/* AI Assistant Banner */}
      <TouchableOpacity style={styles.aiBanner}>
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={24} color="#A100FF" />
        </View>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>AI Assistant Ready</Text>
          <Text style={styles.aiSubtitle}>Use Smart Search to find anything</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A100FF" />
      </TouchableOpacity>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Leads"
          value={stats?.total_leads || 0}
          icon="people"
          color="#3B82F6"
        />
        <StatCard
          title="Active Deals"
          value={stats?.active_deals || 0}
          icon="briefcase"
          color="#10B981"
        />
        <StatCard
          title="Open Tasks"
          value={stats?.open_tasks || 0}
          icon="checkbox"
          color="#F59E0B"
        />
        <StatCard
          title="Pipeline Value"
          value={`€${(stats?.pipeline_value || 0).toLocaleString()}`}
          icon="trending-up"
          color="#A100FF"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leads')}
          >
            <Ionicons name="person-add" size={24} color="#A100FF" />
            <Text style={styles.actionButtonText}>Add Lead</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deals')}
          >
            <Ionicons name="add-circle" size={24} color="#A100FF" />
            <Text style={styles.actionButtonText}>New Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={24} color="#A100FF" />
            <Text style={styles.actionButtonText}>Team Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Leads */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Leads</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leads')}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        {stats?.recent_leads?.slice(0, 3).map((lead, index) => (
          <TouchableOpacity
            key={lead.lead_id || index}
            style={styles.leadItem}
            onPress={() => navigation.navigate('LeadDetail', { leadId: lead.lead_id })}
          >
            <View style={styles.leadAvatar}>
              <Text style={styles.leadAvatarText}>
                {lead.first_name?.[0]}{lead.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.leadInfo}>
              <Text style={styles.leadName}>{lead.first_name} {lead.last_name}</Text>
              <Text style={styles.leadCompany}>{lead.company || 'No company'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
              <Text style={styles.statusText}>{lead.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {(!stats?.recent_leads || stats.recent_leads.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No leads yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    backgroundColor: '#A100FF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    marginHorizontal: 16,
    marginTop: -20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContent: {
    flex: 1,
    marginLeft: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '1.5%',
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statContent: {},
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statTitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  recentSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    color: '#A100FF',
    fontWeight: '500',
  },
  leadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  leadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A100FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leadInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  leadCompany: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});

export default DashboardScreen;
