import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock } from "lucide-react";
import { UserProfile } from "./types";

interface SecuritySectionProps {
  profile: UserProfile;
  onToggle2FA: () => void;
}

export const SecuritySection = ({ profile, onToggle2FA }: SecuritySectionProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Security & Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground">••••••••</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/forgot-password')}
            className="flex items-center space-x-2 flex-shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Change Password</span>
            <span className="sm:hidden">Change</span>
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"} className="mt-1">
              {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Switch
            checked={profile.twoFactorEnabled}
            onCheckedChange={onToggle2FA}
            className="flex-shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  );
};