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
import SidebarNavigation from './SidebarNavigation';

interface ScanResult {
  id: string;
  plantName: string;
  healthScore: number;
  issues: string[];
  recommendations: string[];
  timestamp: string;
  imageUrl?: string;
}

export default function PlantHealthScannerScreen({ navigation }: any) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchRecentScans();
  }, []);

  const fetchRecentScans = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScanResults([
        {
          id: '1',
          plantName: 'Tomato Plant',
          healthScore: 85,
          issues: ['Slight yellowing on lower leaves', 'Minor nutrient deficiency'],
          recommendations: ['Increase nitrogen fertilizer', 'Check soil pH levels'],
          timestamp: '2 hours ago',
          imageUrl: 'https://via.placeholder.com/150/10B981/FFFFFF?text=Tomato'
        },
        {
          id: '2',
          plantName: 'Lettuce',
          healthScore: 92,
          issues: ['Minor pest damage'],
          recommendations: ['Apply organic pest control', 'Monitor for further damage'],
          timestamp: '1 day ago',
          imageUrl: 'https://via.placeholder.com/150/10B981/FFFFFF?text=Lettuce'
        },
        {
          id: '3',
          plantName: 'Pepper Plant',
          healthScore: 78,
          issues: ['Overwatering detected', 'Root rot symptoms'],
          recommendations: ['Reduce watering frequency', 'Improve drainage'],
          timestamp: '2 days ago',
          imageUrl: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=Pepper'
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
              const newScan: ScanResult = {
                id: Date.now().toString(),
                plantName: 'New Plant Scan',
                healthScore: Math.floor(Math.random() * 30) + 70,
                issues: ['AI analysis in progress...'],
                recommendations: ['Processing recommendations...'],
                timestamp: 'Just now',
                imageUrl: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=Scan'
              };
              setScanResults(prev => [newScan, ...prev]);
              setSelectedPlant(newScan.id);
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

  const ScanCard = ({ scan }: { scan: ScanResult }) => (
    <TouchableOpacity 
      style={styles.scanResultCard}
      onPress={() => setSelectedPlant(scan.id)}
    >
      <View style={styles.scanHeader}>
        <Image source={{ uri: scan.imageUrl }} style={styles.scanImage} />
        <View style={styles.scanInfo}>
          <Text style={styles.scanResultTitle}>{scan.plantName}</Text>
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

  const AnalysisModal = ({ scan }: { scan: ScanResult }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Plant Analysis</Text>
          <TouchableOpacity onPress={() => setSelectedPlant(null)}>
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.modalPlantInfo}>
            <Image source={{ uri: scan.imageUrl }} style={styles.modalPlantImage} />
            <View style={styles.modalPlantDetails}>
              <Text style={styles.modalPlantName}>{scan.plantName}</Text>
              <Text style={styles.modalPlantTime}>{scan.timestamp}</Text>
            </View>
            <View style={styles.modalHealthScore}>
              <View style={[styles.modalScoreCircle, { borderColor: getHealthColor(scan.healthScore) }]}>
                <Text style={[styles.modalScoreText, { color: getHealthColor(scan.healthScore) }]}>
                  {scan.healthScore}
                </Text>
              </View>
              <Text style={styles.modalScoreLabel}>Health Score</Text>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Detected Issues</Text>
            {scan.issues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons name="warning" size={16} color="#F59E0B" />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Recommendations</Text>
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
              onPress={() => navigation.navigate('PlotDetails', { plot: { id: 'plot-1', name: 'Plot A' } })}
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
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRecentScans}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
          {scanResults.map((scan) => (
            <ScanCard key={scan.id} scan={scan} />
          ))}
          {scanResults.length === 0 && (
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
      {selectedPlant && scanResults.find(scan => scan.id === selectedPlant) && <AnalysisModal scan={scanResults.find(scan => scan.id === selectedPlant)!} />}

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="PlantHealthScanner"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scanSection: {
    marginBottom: 24,
  },
  scanCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  scanPrompt: {
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
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
    backgroundColor: '#6B7280',
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
    color: 'white',
    marginBottom: 16,
  },
  scanResultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: 'white',
    marginBottom: 4,
  },
  scanPlot: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  scanTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalBody: {
    padding: 20,
  },
  modalPlantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPlantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  modalPlantDetails: {
    flex: 1,
  },
  modalPlantName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  modalPlantTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modalHealthScore: {
    alignItems: 'center',
  },
  modalScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalScoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScoreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  shareButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
}); 