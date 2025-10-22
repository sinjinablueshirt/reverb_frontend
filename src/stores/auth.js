import { defineStore } from 'pinia'
import { useFileStore } from './file'
import { data } from 'autoprefixer'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
    username: null
  }),
  actions: {
    async register(username, password) {
      try {
        const response = await fetch('/api/UserAuthentication/register', {
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
        } else {
          this.user = data.user
          this.username = username;
          this.error = null
        }
      } catch (error) {
        this.error = error.message
        this.user = null
        this.username = null
      }
    },
    async login(username, password) {
      try {
        console.log("Attempting to log in user:", username);
        const response = await fetch('/api/UserAuthentication/login', {
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
        } else {
          this.user = data.user
          this.username = username;
          this.error = null
        }
      } catch (error) {
        this.error = error.message
        this.user = null
        this.username = null
      }
    },
    async deleteUser(username, password) {
        try {
            const response = await fetch('/api/UserAuthentication/deleteUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            const data = await response.json()
            if (data.error) {
                this.error = data.error
            } else {
                this.user = null
                this.username = null
                this.error = null
            }
        } catch (error) {
            this.error = error.message
        }
    },
    async changePassword(username, oldPassword, newPassword) {
        try {
            const response = await fetch('/api/UserAuthentication/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, oldPassword, newPassword })
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
    logout() {
      this.user = null
      this.error = null
    },
    async getUserById(userId) {
        this.error = null;
        try {
            const response = await fetch(`${API_URL}/UserAuthentication/_getUserById`, {
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
