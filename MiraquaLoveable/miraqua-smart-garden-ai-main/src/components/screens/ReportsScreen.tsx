
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, Droplets, Loader2 } from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: "water-usage" | "efficiency" | "maintenance" | "overview";
  period: string;
  generatedAt: string;
  status: "ready" | "generating" | "error";
}

const ReportsScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedType, setSelectedType] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports([
        {
          id: "1",
          title: "Weekly Water Usage Report",
          type: "water-usage",
          period: "Last 7 days",
          generatedAt: "2 hours ago",
          status: "ready"
        },
        {
          id: "2",
          title: "Monthly Efficiency Report",
          type: "efficiency",
          period: "December 2024",
          generatedAt: "1 day ago",
          status: "ready"
        },
        {
          id: "3",
          title: "Garden Overview",
          type: "overview",
          period: "Last 30 days",
          generatedAt: "3 days ago",
          status: "ready"
        }
      ]);
    } catch (err) {
      setError("Failed to load reports");
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
        period: selectedPeriod === "week" ? "Last 7 days" : 
                selectedPeriod === "month" ? "Last 30 days" : "Last 90 days",
        generatedAt: "Just now",
        status: "ready"
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    // Simulate download
    // Download report functionality
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "water-usage": return <Droplets className="w-5 h-5 text-blue-600" />;
      case "efficiency": return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "overview": return <FileText className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-100 text-green-700";
      case "generating": return "bg-yellow-100 text-yellow-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Reports</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">Generate and download reports</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchReports} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Generate New Report */}
          <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Generate New Report</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Report Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Garden Overview</SelectItem>
                      <SelectItem value="water-usage">Water Usage</SelectItem>
                      <SelectItem value="efficiency">Efficiency</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Recent Reports</h2>
            
            {reports.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-sm text-gray-500">Generate your first report to get started</p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getReportIcon(report.type)}
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-gray-600">
                            {report.period} • Generated {report.generatedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        {report.status === "ready" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(report.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReportsScreen;
