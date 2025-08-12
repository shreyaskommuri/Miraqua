import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Sun, Moon } from "lucide-react";
import { UserProfile } from "./types";
import { languages, timezones } from "./constants";

interface PreferencesSectionProps {
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  language: string;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLanguageChange: (language: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

export const PreferencesSection = ({ 
  profile, 
  theme, 
  language, 
  onThemeChange, 
  onLanguageChange, 
  onTimezoneChange 
}: PreferencesSectionProps) => {
  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme */}
        <div className="space-y-3">
          <Label>Theme</Label>
          <RadioGroup 
            value={theme} 
            onValueChange={(value: 'light' | 'dark' | 'system') => onThemeChange(value)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>System</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label>Language</Label>
          <RadioGroup 
            value={language} 
            onValueChange={onLanguageChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {languages.map((lang) => (
              <div key={lang.value} className="flex items-center space-x-2">
                <RadioGroupItem value={lang.value} id={lang.value} />
                <Label htmlFor={lang.value} className="cursor-pointer">
                  {lang.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Timezone */}
        <div className="space-y-3">
          <Label>Timezone</Label>
          <RadioGroup 
            value={profile.timezone} 
            onValueChange={onTimezoneChange}
            className="space-y-2"
          >
            {timezones.map((tz) => (
              <div key={tz.value} className="flex items-center space-x-2">
                <RadioGroupItem value={tz.value} id={tz.value} />
                <Label htmlFor={tz.value} className="cursor-pointer">
                  {tz.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};