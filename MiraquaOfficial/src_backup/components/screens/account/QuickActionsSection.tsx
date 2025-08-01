import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CreditCard, HelpCircle, ChevronRight } from "lucide-react";
import { UserProfile } from "./types";

interface QuickActionsSectionProps {
  profile: UserProfile;
}

export const QuickActionsSection = ({ profile }: QuickActionsSectionProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Settings */}
        <div onClick={() => navigate('/app/notifications')} className="cursor-pointer">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notification Settings</p>
                <p className="text-sm text-muted-foreground">Manage alerts and reminders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Subscription */}
        <div onClick={() => navigate('/subscription')} className="cursor-pointer">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Manage Subscription</p>
                <p className="text-sm text-muted-foreground">Current plan: {profile.plan}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Help & Support */}
        <div onClick={() => navigate('/app/help')} className="cursor-pointer">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Help & Support</p>
                <p className="text-sm text-muted-foreground">FAQs, contact support</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};