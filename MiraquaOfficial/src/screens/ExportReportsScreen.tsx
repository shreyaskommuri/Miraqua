import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Plot {
  id: string;
  name: string;
  waterUsed: number;
}

const ExportReportsScreen = ({ navigation }: any) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [selectedPlots, setSelectedPlots] = useState<string[]>(['all']);
  const [includeMap, setIncludeMap] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const plots: Plot[] = [
    { id: '1', name: 'Tomato Garden', waterUsed: 45.2 },
    { id: '2', name: 'Herb Corner', waterUsed: 23.8 },
    { id: '3', name: 'Pepper Patch', waterUsed: 38.5 },
    { id: '4', name: 'Lettuce Bed', waterUsed: 31.7 }
  ];

  const handlePlotSelection = (plotId: string) => {
    if (plotId === 'all') {
      setSelectedPlots(['all']);
    } else {
      setSelectedPlots(prev => {
        const filtered = prev.filter(id => id !== 'all');
        if (filtered.includes(plotId)) {
          return filtered.filter(id => id !== plotId);
        } else {
          return [...filtered, plotId];
        }
      });
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportData = {
      type: reportType,
      dateRange,
      format,
      plots: selectedPlots,
      includeMap,
      includeCharts,
      generatedAt: new Date().toISOString()
    };

    setIsGenerating(false);
    
    Alert.alert(
      'Report Generated',
      `${format.toUpperCase()} report generated successfully!`,
      [{ text: 'OK' }]
    );
  };

  const reportTypes = [
    {
      id: 'summary',
      title: 'Summary Report',
      description: 'High-level overview with key metrics and charts',
      icon: 'bar-chart',
      features: ['Water usage totals', 'Plot status overview', 'Key insights']
    },
    {
      id: 'detailed',
      title: 'Detailed Report',
      description: 'Comprehensive data with daily breakdowns',
      icon: 'calendar',
      features: ['Daily water logs', 'Weather correlations', 'Efficiency metrics']
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Advanced analysis with predictions and trends',
      icon: 'analytics',
      features: ['Trend analysis', 'Cost forecasting', 'Optimization recommendations']
    }
  ];

  const dateRanges = [
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'last-90-days', label: 'Last 90 days' },
    { id: 'current-season', label: 'Current season' },
    { id: 'all-time', label: 'All time' }
  ];

  const formats = [
    { id: 'pdf', label: 'PDF (Printable)' },
    { id: 'csv', label: 'CSV (Spreadsheet)' },
    { id: 'json', label: 'JSON (Data)' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Export Reports</Text>
          <Text style={styles.headerSubtitle}>Generate data exports</Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Report Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Report Type</Text>
          </View>
          
          {reportTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.reportTypeCard,
                reportType === type.id && styles.selectedReportType
              ]}
              onPress={() => setReportType(type.id as any)}
            >
              <View style={styles.reportTypeContent}>
                <View style={styles.reportTypeIcon}>
                  <Ionicons name={type.icon as any} size={24} color="#3B82F6" />
                </View>
                <View style={styles.reportTypeInfo}>
                  <View style={styles.reportTypeHeader}>
                    <Text style={styles.reportTypeTitle}>{type.title}</Text>
                    {reportType === type.id && (
                      <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    )}
                  </View>
                  <Text style={styles.reportTypeDescription}>{type.description}</Text>
                  <View style={styles.featuresContainer}>
                    {type.features.map((feature, index) => (
                      <View key={index} style={styles.featureBadge}>
                        <Text style={styles.featureText}>✓ {feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Configuration</Text>
          </View>
          
          <View style={styles.configCard}>
            {/* Date Range */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Date Range</Text>
              <View style={styles.pickerContainer}>
                {dateRanges.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.pickerOption,
                      dateRange === range.id && styles.selectedPickerOption
                    ]}
                    onPress={() => setDateRange(range.id)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      dateRange === range.id && styles.selectedPickerOptionText
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Format */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Export Format</Text>
              <View style={styles.pickerContainer}>
                {formats.map((formatOption) => (
                  <TouchableOpacity
                    key={formatOption.id}
                    style={[
                      styles.pickerOption,
                      format === formatOption.id && styles.selectedPickerOption
                    ]}
                    onPress={() => setFormat(formatOption.id as any)}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      format === formatOption.id && styles.selectedPickerOptionText
                    ]}>
                      {formatOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Plot Selection */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Include Plots</Text>
              <View style={styles.plotSelection}>
                <TouchableOpacity
                  style={styles.plotOption}
                  onPress={() => handlePlotSelection('all')}
                >
                  <View style={[
                    styles.checkbox,
                    selectedPlots.includes('all') && styles.checkboxSelected
                  ]}>
                    {selectedPlots.includes('all') && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text style={styles.plotOptionText}>All Plots</Text>
                </TouchableOpacity>
                
                {plots.map((plot) => (
                  <TouchableOpacity
                    key={plot.id}
                    style={styles.plotOption}
                    onPress={() => handlePlotSelection(plot.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      (selectedPlots.includes(plot.id) || selectedPlots.includes('all')) && styles.checkboxSelected
                    ]}>
                      {(selectedPlots.includes(plot.id) || selectedPlots.includes('all')) && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <Text style={styles.plotOptionText}>{plot.name}</Text>
                    <View style={styles.plotWaterUsage}>
                      <Ionicons name="water" size={12} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.waterUsageText}>{plot.waterUsed}L</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Additional Options */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Additional Options</Text>
              <View style={styles.optionsContainer}>
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Ionicons name="map" size={16} color="white" />
                    <Text style={styles.optionText}>Include map snapshots</Text>
                  </View>
                  <Switch
                    value={includeMap}
                    onValueChange={setIncludeMap}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                    thumbColor={includeMap ? 'white' : 'rgba(255, 255, 255, 0.5)'}
                  />
                </View>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Ionicons name="bar-chart" size={16} color="white" />
                    <Text style={styles.optionText}>Include charts and graphs</Text>
                  </View>
                  <Switch
                    value={includeCharts}
                    onValueChange={setIncludeCharts}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                    thumbColor={includeCharts ? 'white' : 'rgba(255, 255, 255, 0.5)'}
                  />
                </View>
                
                <View style={styles.optionRow}>
                  <View style={styles.optionInfo}>
                    <Ionicons name="mail" size={16} color="white" />
                    <Text style={styles.optionText}>Email report when ready</Text>
                  </View>
                  <Switch
                    value={emailReport}
                    onValueChange={setEmailReport}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                    thumbColor={emailReport ? 'white' : 'rgba(255, 255, 255, 0.5)'}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Report Preview</Text>
          </View>
          
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="document-text" size={32} color="#3B82F6" />
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>
                  {reportType === 'summary' ? 'Summary Report' : 
                   reportType === 'detailed' ? 'Detailed Report' : 'Analytics Report'}
                </Text>
                <Text style={styles.previewSubtitle}>
                  {dateRange.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {format.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.previewDetails}>
              <View style={styles.previewDetail}>
                <Text style={styles.previewDetailLabel}>Plots</Text>
                <Text style={styles.previewDetailValue}>
                  {selectedPlots.includes('all') ? 'All plots' : `${selectedPlots.length} selected`}
                </Text>
              </View>
              <View style={styles.previewDetail}>
                <Text style={styles.previewDetailLabel}>Features</Text>
                <Text style={styles.previewDetailValue}>
                  {[includeMap && 'Maps', includeCharts && 'Charts'].filter(Boolean).join(', ') || 'Data only'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="reload" size={16} color="white" style={styles.spinningIcon} />
              <Text style={styles.generateButtonText}>Generating Report...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="download" size={16} color="white" />
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shareButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  reportTypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedReportType: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reportTypeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reportTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  reportTypeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  configCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  configItem: {
    marginBottom: 20,
  },
  configLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectedPickerOption: {
    backgroundColor: '#10B981',
  },
  pickerOptionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedPickerOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  plotSelection: {
    gap: 8,
  },
  plotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  plotOptionText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
  },
  plotWaterUsage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waterUsageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  optionsContainer: {
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    color: 'white',
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewInfo: {
    marginLeft: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  previewSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  previewDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  previewDetail: {
    flex: 1,
  },
  previewDetailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  previewDetailValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinningIcon: {
    marginRight: 8,
  },
});

export default ExportReportsScreen; 