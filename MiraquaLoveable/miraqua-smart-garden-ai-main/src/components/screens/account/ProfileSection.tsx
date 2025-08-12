import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera } from "lucide-react";
import { UserProfile } from "./types";

interface ProfileSectionProps {
  profile: UserProfile;
  errors: Record<string, string>;
  onProfileChange: (field: keyof UserProfile, value: string) => void;
  onAvatarChange: () => void;
  onFieldFocus: (field: string) => void;
}

export const ProfileSection = ({ 
  profile, 
  errors, 
  onProfileChange, 
  onAvatarChange, 
  onFieldFocus 
}: ProfileSectionProps) => {
  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Profile Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section - Responsive */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-lg sm:text-xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" onClick={onAvatarChange} className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Change Photo</span>
          </Button>
        </div>

        {/* Form fields with proper spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => onProfileChange('name', e.target.value)}
              onFocus={() => onFieldFocus('name')}
              className={errors.name ? "border-destructive" : ""}
              maxLength={50}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => onProfileChange('email', e.target.value)}
              onFocus={() => onFieldFocus('email')}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Member since</span>
          <span className="font-medium text-foreground">{profile.memberSince}</span>
        </div>

        {/* Stats - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.totalPlots}</div>
            <div className="text-sm text-muted-foreground">Active Plots</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.waterSaved}L</div>
            <div className="text-sm text-muted-foreground">Water Saved</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};