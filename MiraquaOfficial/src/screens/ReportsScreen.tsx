import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Report {
  id: string;
  title: string;
  type: 'water-usage' | 'efficiency' | 'maintenance' | 'overview';
  period: string;
  generatedAt: string;
  status: 'ready' | 'generating' | 'error';
}

export default function ReportsScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedType, setSelectedType] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports([
        {
          id: '1',
          title: 'Weekly Water Usage Report',
          type: 'water-usage',
          period: 'Last 7 days',
          generatedAt: '2 hours ago',
          status: 'ready'
        },
        {
          id: '2',
          title: 'Monthly Efficiency Report',
          type: 'efficiency',
          period: 'December 2024',
          generatedAt: '1 day ago',
          status: 'ready'
        },
        {
          id: '3',
          title: 'Garden Overview',
          type: 'overview',
          period: 'Last 30 days',
          generatedAt: '3 days ago',
          status: 'ready'
        }
      ]);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: Report = {
        id: Date.now().toString(),
        title: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Report`,
        type: selectedType as any,
        period: selectedPeriod === 'week' ? 'Last 7 days' : 
                selectedPeriod === 'month' ? 'Last 30 days' : 'Last 90 days',
        generatedAt: 'Just now',
        status: 'ready'
      };
      
      setReports(prev => [newReport, ...prev]);
      Alert.alert('Success', 'Report generated successfully!');
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    Alert.alert('Download', 'Report download started...');
    // Simulate download
    setTimeout(() => {
      Alert.alert('Success', 'Report downloaded successfully!');
    }, 1500);
  };

  const deleteReport = (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setReports(prev => prev.filter(report => report.id !== reportId));
            Alert.alert('Success', 'Report deleted successfully!');
          }
        }
      ]
    );
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'water-usage': return 'water';
      case 'efficiency': return 'trending-up';
      case 'maintenance': return 'construct';
      case 'overview': return 'analytics';
      default: return 'document';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#10B981';
      case 'generating': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <View style={styles.reportIconContainer}>
            <Ionicons name={getReportIcon(report.type) as any} size={20} color="#3B82F6" />
          </View>
          <View style={styles.reportDetails}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportPeriod}>{report.period}</Text>
            <Text style={styles.reportTime}>{report.generatedAt}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.reportActions}>
        {report.status === 'ready' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => downloadReport(report.id)}
          >
            <Ionicons name="download" size={16} color="#3B82F6" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteReport(report.id)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchReports}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Generate New Report */}
        <View style={styles.generateCard}>
          <Text style={styles.generateTitle}>Generate New Report</Text>
          
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Report Type:</Text>
            <View style={styles.selectorContainer}>
              {['overview', 'water-usage', 'efficiency', 'maintenance'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.selectorOption, selectedType === type && styles.selectedOption]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.selectorText, selectedType === type && styles.selectedText]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Time Period:</Text>
            <View style={styles.selectorContainer}>
              {['week', 'month', 'quarter'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[styles.selectorOption, selectedPeriod === period && styles.selectedOption]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[styles.selectorText, selectedPeriod === period && styles.selectedText]}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.generateText}>Generating...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.generateText}>Generate Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 36,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  generateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  selectorRow: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
  },
  selectedOption: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectorText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedText: {
    color: 'white',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  generateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportPeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  reportTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
}); 