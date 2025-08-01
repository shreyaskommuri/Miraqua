import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { UserProfile } from "./types";

export const useAccountLogic = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useI18n();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    avatar: "",
    memberSince: "March 2024",
    totalPlots: 5,
    waterSaved: 142,
    isPremium: true,
    twoFactorEnabled: false,
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    plan: 'Premium'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProfile = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profile.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile]);

  const handleSaveChanges = useCallback(async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      
      setIsDirty(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [validateProfile, toast]);

  const handleProfileChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleFieldFocus = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleAvatarChange = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setProfile(prev => ({ ...prev, avatar: result }));
            setIsDirty(true);
          };
          reader.readAsDataURL(file);
          
          toast({
            title: "Avatar updated",
            description: "Your profile picture has been changed.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload avatar. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    
    input.click();
  }, [toast]);

  const handleToggle2FA = useCallback(async () => {
    if (profile.twoFactorEnabled) {
      setProfile(prev => ({ ...prev, twoFactorEnabled: false }));
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } else {
      setProfile(prev => ({ ...prev, twoFactorEnabled: true }));
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled.",
      });
    }
    setIsDirty(true);
  }, [profile.twoFactorEnabled, toast]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setProfile(prev => ({ ...prev, theme: newTheme }));
    setIsDirty(true);
  }, [setTheme]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'es' | 'hi' | 'fr');
    setProfile(prev => ({ ...prev, language: newLanguage }));
    setIsDirty(true);
  }, [setLanguage]);

  const handleTimezoneChange = useCallback((timezone: string) => {
    setProfile(prev => ({ ...prev, timezone }));
    setIsDirty(true);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/welcome');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate('/welcome');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);

  const handleCancel = useCallback(() => {
    setProfile({
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      avatar: "",
      memberSince: "March 2024",
      totalPlots: 5,
      waterSaved: 142,
      isPremium: true,
      twoFactorEnabled: false,
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      plan: 'Premium'
    });
    setIsDirty(false);
    setErrors({});
  }, []);

  return {
    profile,
    theme,
    language,
    isSaving,
    isDirty,
    errors,
    handleSaveChanges,
    handleProfileChange,
    handleFieldFocus,
    handleAvatarChange,
    handleToggle2FA,
    handleThemeChange,
    handleLanguageChange,
    handleTimezoneChange,
    handleSignOut,
    handleDeleteAccount,
    handleCancel
  };
};