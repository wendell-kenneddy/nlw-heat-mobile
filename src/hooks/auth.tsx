import React, { useContext, createContext, useState, useEffect } from 'react';
import { startAsync } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const CLIENT_ID = '59fd4d4befea230fe9a5';
const SCOPE = 'user';
const USER_STORAGE = '@dowhile:user';
const TOKEN_STORAGE = '@dowhile:token';

interface IUser {
  name: string;
  avatar_url: string;
  id: string;
  login: string;
}

interface IAuthProviderProps {
  children: React.ReactNode;
}

interface IAuthContextData {
  user: IUser | null;
  isSigningIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

interface IAuthResponse {
  jwt: string;
  user: IUser;
}

interface IAuthorizationResponse {
  params: {
    code?: string;
    error?: string;
  };
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

export function AuthProvider({ children }: IAuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(true);

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
      const authResponse = (await startAsync({ authUrl })) as IAuthorizationResponse;

      if (authResponse.type === 'success' && authResponse.params.error !== 'access_denied') {
        const response = await api.post<IAuthResponse>('/auth', {
          code: authResponse.params.code
        });

        const { jwt, user } = response.data;

        api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, jwt);

        setUser(user);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(TOKEN_STORAGE);
  };

  useEffect(() => {
    async function loadStoredData() {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE);
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE);

      if (storedUser && storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        setUser(JSON.parse(storedUser));
      }

      setIsSigningIn(false);
    }

    loadStoredData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        isSigningIn,
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
