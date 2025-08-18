
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Leaf,
  Bug,
  Droplets
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlantHealthScannerScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setScanResult({
        overallHealth: 'Good',
        healthScore: 85,
        issues: [
          {
            type: 'Nutrient Deficiency',
            severity: 'Low',
            confidence: 78,
            treatment: 'Apply nitrogen-rich fertilizer',
            icon: Leaf
          },
          {
            type: 'Early Pest Activity',
            severity: 'Medium',
            confidence: 65,
            treatment: 'Monitor closely, consider organic spray',
            icon: Bug
          }
        ],
        recommendations: [
          'Increase watering frequency by 10%',
          'Monitor for pest activity over next week',
          'Consider soil pH testing'
        ]
      });
      setIsScanning(false);
      toast({
        title: "Scan Complete",
        description: "Plant health analysis ready"
      });
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-orange-100 text-orange-800'; 
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollArea className="h-[calc(100vh-0px)]">
        <div className="p-4 space-y-6">
          {!uploadedImage ? (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Scan Your Plant</h2>
                <p className="text-gray-600 mb-6">Take a clear photo of your plant's leaves for AI analysis</p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-green-500 hover:bg-green-600 rounded-xl"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded plant" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </CardContent>
              </Card>

              {isScanning && (
                <Card className="border-0 shadow-sm bg-blue-50">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
                    <p className="text-blue-800 font-medium">Analyzing plant health...</p>
                    <p className="text-sm text-blue-600">This may take a few moments</p>
                  </CardContent>
                </Card>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <Card className="border-0 shadow-sm bg-green-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Overall Health: {scanResult.overallHealth}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl font-bold text-green-800">
                          {scanResult.healthScore}%
                        </div>
                        <div className="flex-1 bg-green-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full"
                            style={{ width: `${scanResult.healthScore}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {scanResult.issues.length > 0 && (
                    <Card className="border-0 shadow-sm bg-orange-50">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <span>Issues Detected</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {scanResult.issues.map((issue: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-xl border border-orange-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <issue.icon className="w-4 h-4 text-orange-600" />
                                  <span className="font-medium">{issue.type}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge className={getSeverityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                  <Badge variant="outline">
                                    {issue.confidence}% confident
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{issue.treatment}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-0 shadow-sm bg-blue-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span>Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {scanResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlantHealthScannerScreen;
