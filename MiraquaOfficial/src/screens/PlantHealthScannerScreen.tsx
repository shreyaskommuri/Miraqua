import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlantAnalysis {
  id: string;
  plantName: string;
  healthScore: number;
  issues: string[];
  recommendations: string[];
  imageUrl: string;
  timestamp: string;
  plotId: string;
  plotName: string;
}

export default function PlantHealthScannerScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<PlantAnalysis[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantAnalysis | null>(null);

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecentScans([
        {
          id: '1',
          plantName: 'Tomato Plant',
          healthScore: 85,
          issues: ['Slight yellowing on lower leaves', 'Minor nutrient deficiency'],
          recommendations: ['Increase nitrogen fertilizer', 'Check soil pH levels'],
          imageUrl: 'https://via.placeholder.com/150/10B981/FFFFFF?text=Tomato',
          timestamp: '2 hours ago',
          plotId: 'plot-1',
          plotName: 'Plot A'
        },
        {
          id: '2',
          plantName: 'Lettuce',
          healthScore: 92,
          issues: ['Minor pest damage'],
          recommendations: ['Apply organic pest control', 'Monitor for further damage'],
          imageUrl: 'https://via.placeholder.com/150/10B981/FFFFFF?text=Lettuce',
          timestamp: '1 day ago',
          plotId: 'plot-2',
          plotName: 'Plot B'
        },
        {
          id: '3',
          plantName: 'Pepper Plant',
          healthScore: 78,
          issues: ['Overwatering detected', 'Root rot symptoms'],
          recommendations: ['Reduce watering frequency', 'Improve drainage'],
          imageUrl: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=Pepper',
          timestamp: '2 days ago',
          plotId: 'plot-3',
          plotName: 'Plot C'
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recent scans');
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    Alert.alert(
      'Camera Access',
      'This would open the camera to scan your plants. In this demo, we\'ll simulate a scan.',
      [
        { text: 'Cancel', onPress: () => setIsScanning(false) },
        {
          text: 'Simulate Scan',
          onPress: () => {
            setTimeout(() => {
              const newScan: PlantAnalysis = {
                id: Date.now().toString(),
                plantName: 'New Plant Scan',
                healthScore: Math.floor(Math.random() * 30) + 70,
                issues: ['AI analysis in progress...'],
                recommendations: ['Processing recommendations...'],
                imageUrl: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=Scan',
                timestamp: 'Just now',
                plotId: 'plot-1',
                plotName: 'Plot A'
              };
              setRecentScans(prev => [newScan, ...prev]);
              setSelectedPlant(newScan);
              setIsScanning(false);
              Alert.alert('Scan Complete', 'Plant analysis completed successfully!');
            }, 3000);
          }
        }
      ]
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const ScanCard = ({ scan }: { scan: PlantAnalysis }) => (
    <TouchableOpacity 
      style={styles.scanResultCard}
      onPress={() => setSelectedPlant(scan)}
    >
      <View style={styles.scanHeader}>
        <Image source={{ uri: scan.imageUrl }} style={styles.scanImage} />
        <View style={styles.scanInfo}>
          <Text style={styles.scanResultTitle}>{scan.plantName}</Text>
          <Text style={styles.scanPlot}>{scan.plotName}</Text>
          <Text style={styles.scanTime}>{scan.timestamp}</Text>
        </View>
        <View style={styles.healthScore}>
          <View style={[styles.scoreCircle, { borderColor: getHealthColor(scan.healthScore) }]}>
            <Text style={[styles.scoreText, { color: getHealthColor(scan.healthScore) }]}>
              {scan.healthScore}
            </Text>
          </View>
          <Text style={styles.scoreLabel}>Health</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const AnalysisModal = ({ scan }: { scan: PlantAnalysis }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Plant Analysis</Text>
          <TouchableOpacity onPress={() => setSelectedPlant(null)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <Image source={{ uri: scan.imageUrl }} style={styles.modalImage} />
          
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Plant Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plant:</Text>
              <Text style={styles.detailValue}>{scan.plantName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{scan.plotName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Health Score:</Text>
              <Text style={[styles.detailValue, { color: getHealthColor(scan.healthScore) }]}>
                {scan.healthScore}/100 ({getHealthStatus(scan.healthScore)})
              </Text>
            </View>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Detected Issues</Text>
            {scan.issues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {scan.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb" size={16} color="#10B981" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PlotDetails', { plot: { id: scan.plotId, name: scan.plotName } })}
            >
              <Ionicons name="eye" size={16} color="#3B82F6" />
              <Text style={styles.actionText}>View Plot</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => Alert.alert('Share', 'Share analysis report')}
            >
              <Ionicons name="share" size={16} color="#10B981" />
              <Text style={styles.actionText}>Share Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plant Health Scanner</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchRecentScans}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scan Button */}
        <View style={styles.scanSection}>
          <View style={styles.scanCard}>
            <View style={styles.scanPrompt}>
              <Ionicons name="camera" size={48} color="#3B82F6" />
              <Text style={styles.scanTitle}>Scan Plant Health</Text>
              <Text style={styles.scanSubtitle}>
                Use your camera to analyze plant health and get AI-powered recommendations
              </Text>
              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanningButton]}
                onPress={startScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <View style={styles.scanningContent}>
                    <Ionicons name="scan" size={20} color="white" />
                    <Text style={styles.scanButtonText}>Scanning...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.scanButtonText}>Start Scan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.map((scan) => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
          {recentScans.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="camera" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No scans yet</Text>
              <Text style={styles.emptySubtext}>Start by scanning your first plant!</Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Scanning Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="sunny" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>Ensure good lighting for accurate analysis</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="hand-left" size={20} color="#10B981" />
            <Text style={styles.tipText}>Hold camera steady and focus on the plant</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="leaf" size={20} color="#3B82F6" />
            <Text style={styles.tipText}>Include both healthy and affected areas</Text>
          </View>
        </View>
      </ScrollView>

      {/* Analysis Modal */}
      {selectedPlant && <AnalysisModal scan={selectedPlant} />}
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scanSection: {
    marginBottom: 24,
  },
  scanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanPrompt: {
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanningButton: {
    backgroundColor: '#9CA3AF',
  },
  scanningContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  scanResultCard: {
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
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scanPlot: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  scanTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  healthScore: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  analysisSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  shareButton: {
    backgroundColor: '#ECFDF5',
  },
}); 