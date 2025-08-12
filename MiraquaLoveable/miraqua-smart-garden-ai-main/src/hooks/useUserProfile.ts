import { useState, useEffect } from 'react';
import { UserProfile } from '@/components/screens/account/types';

// Dynamic user profile based on plots data
export const useUserProfile = (plotsCount: number = 0, totalWaterSaved: number = 0) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    // Generate dynamic profile based on actual data
    const memberSince = new Date();
    memberSince.setMonth(memberSince.getMonth() - Math.floor(Math.random() * 12 + 1));
    
    const dynamicProfile: UserProfile = {
      name: "Garden Enthusiast", // This would come from auth
      email: "user@miraqua.com", // This would come from auth
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      memberSince: memberSince.toLocaleDateString(),
      totalPlots: plotsCount,
      waterSaved: totalWaterSaved,
      isPremium: plotsCount > 2 || totalWaterSaved > 500,
      twoFactorEnabled: false,
      theme: (localStorage.getItem('miraqua-theme') as 'light' | 'dark' | 'system') || 'system',
      language: localStorage.getItem('miraqua-language') || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      plan: plotsCount > 2 ? 'Pro' : 'Free'
    };
    
    setProfile(dynamicProfile);
  }, [plotsCount, totalWaterSaved]);
  
  return profile;
};