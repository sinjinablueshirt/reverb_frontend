import { defineStore } from 'pinia'
import { useFileStore } from './file'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
    username: null,
    session: null
  }),
  actions: {
    async register(username, password) {
      try {
        const response = await fetch(`${API_BASE}/UserAuthentication/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "username": username, "password": password })
        })
        const data = await response.json()
        if (data.error) {
          this.error = data.error
          this.user = null
          this.username = null
          this.session = null
        } else {
          // Registration successful, now log in to get a session
          await this.login(username, password)
        }
      } catch (error) {
        this.error = error.message
        this.user = null
        this.username = null
        this.session = null
      }
    },
    async login(username, password) {
      try {
        console.log("Attempting to log in user:", username);
        const response = await fetch(`${API_BASE}/UserAuthentication/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "username": username, "password": password })
        })
        const data = await response.json()
        if (data.error) {
          this.error = data.error
          this.user = null
          this.username = null
          this.session = null
        } else {
          this.user = data.user
          this.username = username;
          this.session = data.session;
          this.error = null
        }
      } catch (error) {
        this.error = error.message
        this.user = null
        this.username = null
        this.session = null
      }
    },
    async deleteUser(username, password) {
        try {
            const response = await fetch(`${API_BASE}/UserAuthentication/deleteUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session: this.session, username, password })
            })
            const data = await response.json()
            if (data.error) {
                this.error = data.error
            } else {
                this.user = null
                this.username = null
                this.session = null
                this.error = null
            }
        } catch (error) {
            this.error = error.message
        }
    },
    async changePassword(username, oldPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE}/UserAuthentication/changePassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session: this.session, username, oldPassword, newPassword })
            })
            const data = await response.json()
            if (data.error) {
                this.error = data.error
            } else {
                this.error = null
            }
        } catch (error) {
            this.error = error.message
        }
    },
    async logout() {
      try {
        if (this.session) {
          await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: this.session }),
          });
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
      this.user = null
      this.username = null
      this.session = null
      this.error = null
    },
    async getUserById(userId) {
        this.error = null;
        try {
            const response = await fetch(`${API_BASE}/UserAuthentication/_getUserById`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            data = await response.json();
            console.log(data);

            if (!response.ok) {
                const errorData = await data
                throw new Error(errorData.error || 'Failed to fetch user');
            }

            return data.username;
        } catch (error) {
            this.error = error.message;
            return null;
        }
    },
    }
})
