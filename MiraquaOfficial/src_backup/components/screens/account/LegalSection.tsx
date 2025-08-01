import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, ChevronRight } from "lucide-react";

export const LegalSection = () => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Legal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/terms" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Terms of Service</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
        
        <Link to="/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Privacy Policy</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
};