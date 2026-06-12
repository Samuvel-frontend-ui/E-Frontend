import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  force_password_change?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  setUser: (user: User | null) => void;
  checkAuth: (apiUrl: string) => Promise<void>;
  logout: (apiUrl: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isChecking: false
    });
  },

  checkAuth: async (apiUrl) => {
    set({ isChecking: true });
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        // Send cookies (session) in request
        headers: {
          'X-Requested-With': 'XMLHttpRequest' // Standard CSRF header or validation just in case
        },
        // IMPORTANT: include credentials so session cookie is sent to API
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        set({
          user: data.user,
          isAuthenticated: true,
          isChecking: false
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isChecking: false
        });
      }
    } catch (error) {
      console.error('Failed to check auth status', error);
      set({
        user: null,
        isAuthenticated: false,
        isChecking: false
      });
    }
  },

  logout: async (apiUrl) => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false
      });
    }
  }
}));
