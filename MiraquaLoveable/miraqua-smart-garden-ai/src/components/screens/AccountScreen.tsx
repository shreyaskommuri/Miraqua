
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, LogOut, Moon, Sun } from "lucide-react";
import { useAccountLogic } from "./account/hooks";
import { ProfileSection } from "./account/ProfileSection";
import { SecuritySection } from "./account/SecuritySection";
import { PreferencesSection } from "./account/PreferencesSection";
import { QuickActionsSection } from "./account/QuickActionsSection";
import { LegalSection } from "./account/LegalSection";
import { DangerZoneSection } from "./account/DangerZoneSection";

const AccountScreen = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const {
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
  } = useAccountLogic();

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header - Fixed with proper spacing */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Account Settings</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage your profile and preferences</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
              className="p-2"
            >
              {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="px-4 sm:px-6 py-6 space-y-6 sm:space-y-8 pb-32">
          <ProfileSection
            profile={profile}
            errors={errors}
            onProfileChange={handleProfileChange}
            onAvatarChange={handleAvatarChange}
            onFieldFocus={handleFieldFocus}
          />

          <SecuritySection
            profile={profile}
            onToggle2FA={handleToggle2FA}
          />

          <PreferencesSection
            profile={profile}
            theme={theme}
            language={language}
            onThemeChange={handleThemeChange}
            onLanguageChange={handleLanguageChange}
            onTimezoneChange={handleTimezoneChange}
          />

          <QuickActionsSection profile={profile} />

          <LegalSection />

          <DangerZoneSection onDeleteAccount={handleDeleteAccount} />
        </div>
      </ScrollArea>

      {/* Sticky Action Buttons - Fixed positioning */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 space-y-3 z-30">
        {isDirty && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving || !isDirty}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AccountScreen;
