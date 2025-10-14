import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

// Correct redirect URI for dev client (no proxy)
const redirectUri = makeRedirectUri({ scheme: 'miraquaappexpo' });
console.log('🔐 Redirect URI used in dev client:', redirectUri);

export const useGoogleAuth = () => {
  const [idToken, setIdToken] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '594279669584-l1nfq6qiaoue9kdl70g3u76hbemujlnn.apps.googleusercontent.com',
    redirectUri,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.params.id_token;
      console.log('✅ ID Token received from Google:', token);
      setIdToken(token);
    }
  }, [response]);

  const signIn = async () => {
    if (!idToken) {
      console.warn('⚠️ No ID token available for Firebase credential.');
      return;
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();

    try {
      const result = await signInWithCredential(auth, credential);
      console.log('🎉 Firebase login success:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Firebase login error:', error);
    }
  };

  return { promptAsync, request, idToken, signIn };
};