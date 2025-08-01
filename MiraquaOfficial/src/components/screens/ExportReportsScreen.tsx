
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar,
  Filter,
  Mail,
  Share2,
  BarChart3,
  Droplets,
  MapPin,
  Clock,
  CheckCircle
} from "lucide-react";

const ExportReportsScreen = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [selectedPlots, setSelectedPlots] = useState<string[]>(['all']);
  const [includeMap, setIncludeMap] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const plots = [
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

    // In production, this would trigger actual report generation
    if (format === 'pdf') {
      // Generate PDF with embedded map snapshots
    } else if (format === 'csv') {
      // Generate CSV export
    } else {
      // Generate JSON export
    }

    setIsGenerating(false);
    
    // Show success message or download
    alert(`${format.toUpperCase()} report generated successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Export Reports</h1>
              <p className="text-sm text-gray-500">Generate data exports</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app')}
              className="p-2"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Report Type Selection */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Report Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 'summary',
                title: 'Summary Report',
                description: 'High-level overview with key metrics and charts',
                icon: BarChart3,
                features: ['Water usage totals', 'Plot status overview', 'Key insights']
              },
              {
                id: 'detailed',
                title: 'Detailed Report',
                description: 'Comprehensive data with daily breakdowns',
                icon: Calendar,
                features: ['Daily water logs', 'Weather correlations', 'Efficiency metrics']
              },
              {
                id: 'analytics',
                title: 'Analytics Report',
                description: 'Advanced analysis with predictions and trends',
                icon: BarChart3,
                features: ['Trend analysis', 'Cost forecasting', 'Optimization recommendations']
              }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    reportType === type.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => setReportType(type.id as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{type.title}</h3>
                          {reportType === type.id && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              ✓ {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2 text-green-600" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="current-season">Current season</SelectItem>
                  <SelectItem value="all-time">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF (Printable)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plot Selection */}
            <div className="space-y-3">
              <Label>Include Plots</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-plots"
                    checked={selectedPlots.includes('all')}
                    onCheckedChange={() => handlePlotSelection('all')}
                  />
                  <Label htmlFor="all-plots" className="font-medium">All Plots</Label>
                </div>
                {plots.map((plot) => (
                  <div key={plot.id} className="flex items-center justify-between pl-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`plot-${plot.id}`}
                        checked={selectedPlots.includes(plot.id) || selectedPlots.includes('all')}
                        onCheckedChange={() => handlePlotSelection(plot.id)}
                        disabled={selectedPlots.includes('all')}
                      />
                      <Label htmlFor={`plot-${plot.id}`}>{plot.name}</Label>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Droplets className="w-3 h-3" />
                      <span>{plot.waterUsed}L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-map"
                    checked={includeMap}
                    onCheckedChange={(checked) => setIncludeMap(!!checked)}
                  />
                  <Label htmlFor="include-map" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Include map snapshots</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                  />
                  <Label htmlFor="include-charts" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Include charts and graphs</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-report"
                    checked={emailReport}
                    onCheckedChange={(checked) => setEmailReport(!!checked)}
                  />
                  <Label htmlFor="email-report" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email report when ready</span>
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {reportType === 'summary' ? 'Summary Report' : 
                     reportType === 'detailed' ? 'Detailed Report' : 'Analytics Report'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {dateRange.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {format.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Plots</p>
                  <p className="font-medium">
                    {selectedPlots.includes('all') ? 'All plots' : `${selectedPlots.length} selected`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Features</p>
                  <p className="font-medium">
                    {[includeMap && 'Maps', includeCharts && 'Charts'].filter(Boolean).join(', ') || 'Data only'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isGenerating ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Bottom safe area */}
      <div className="h-20"></div>
    </div>
  );
};

export default ExportReportsScreen;
