export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  totalPlots: number;
  waterSaved: number;
  isPremium: boolean;
  twoFactorEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  plan: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: { [key: string]: string };
  body?: any;
}