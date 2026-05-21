import { useCallback, useEffect, useState } from 'react';
import { roleLabel, useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api/auth';
import {
  PROFILE_UPDATED_EVENT,
  readStoredProfile,
  type ProfileDisplay,
} from '../lib/profile';

const emptyProfile: ProfileDisplay = {
  name: '',
  jobTitle: '',
  photoUrl: '',
};

export function useProfileDisplay() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileDisplay>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const baseName = user?.fullName?.trim() || user?.email || 'User';
    const baseJobTitle = user?.jobTitle?.trim() || '';
    const basePhoto = user?.photoUrl?.trim() || '';
    const stored = readStoredProfile();

    try {
      const data = await authApi.getSettings();
      setProfile({
        name: data.profile.name?.trim() || stored?.name?.trim() || baseName,
        jobTitle: data.profile.jobTitle?.trim() || stored?.jobTitle?.trim() || baseJobTitle,
        photoUrl: data.profile.photoUrl?.trim() || stored?.photoUrl?.trim() || basePhoto,
      });
    } catch {
      setProfile({
        name: stored?.name?.trim() || baseName,
        jobTitle: stored?.jobTitle?.trim() || baseJobTitle,
        photoUrl: stored?.photoUrl?.trim() || basePhoto,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    const onUpdated = () => {
      void load();
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onUpdated);
  }, [load]);

  const subtitle =
    profile.jobTitle || (user ? roleLabel(user.role) : '');

  return {
    profile,
    displayName: profile.name,
    jobTitle: profile.jobTitle,
    subtitle,
    photoUrl: profile.photoUrl,
    isLoading,
    reload: load,
  };
}
