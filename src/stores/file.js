import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

const API_URL = 'http://localhost:8000/api';

export const useFileStore = defineStore('file', {
  state: () => ({
    files: [],
    error: null,
  }),
  actions: {
    async uploadFile(file) {
      this.error = null;
      const authStore = useAuthStore();
      console.log('file to upload:', file);
      if (!authStore.user) {
        this.error = 'User not logged in';
        return null;
      }

      try {
        // 1. Request upload URL
        const requestUploadResponse = await fetch(`${API_URL}/FileUrl/requestUpload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, owner: authStore.user }),
        });

        const data = await requestUploadResponse.json(); // ✅ call once

        console.log('Request upload response:', data);

        if (!requestUploadResponse.ok) {
          throw new Error(data.error || 'Failed to request upload URL');
        }

        const { uploadUrl, gcsObjectName } = data;

        console.log('Received upload URL:', uploadUrl);

        // 2. Upload file to GCS
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to storage');
        }

        // 3. Confirm upload
        const confirmUploadResponse = await fetch(`${API_URL}/FileUrl/confirmUpload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            gcsObjectName,
            owner: authStore.user,
          }),
        });

        if (!confirmUploadResponse.ok) {
          const errorData = await confirmUploadResponse.json();
          throw new Error(errorData.error || 'Failed to confirm upload');
        }

        const { file: fileId } = await confirmUploadResponse.json();
        return fileId;
      } catch (error) {
        this.error = error.message;
        return null;
      }
    },

    async getFilesByUser(userId) {
      this.error = null;
      console.log('Fetching files for user:', userId);
      try {
        const response = await fetch(`${API_URL}/FileUrl/_getFilesByUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userId }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorData = await data
          throw new Error(errorData.error || 'Failed to fetch files');
        }

        console.log(data);

        this.files = data;
        return this.files;
      } catch (error) {
        this.error = error.message;
        return [];
      }
    },

    async getFileById(fileId) {
        this.error = null;
        console.log('Fetching file by ID:', fileId);
        try {
            const response = await fetch(`${API_URL}/FileUrl/_getFileById`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId }),
            });

            const file = await response.json();

            if(!response.ok) {
                const errorData = file.error;
                throw new Error(errorData || 'Failed to fetch file');
            }

            return file.file;
        } catch (error) {
            this.error = error.message;
            return null;
        }
    },

    async getViewUrl(gcsObjectName) {
        this.error = null;
        try {
            const response = await fetch(`${API_URL}/FileUrl/getViewUrl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gcsObjectName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get view URL');
            }

            const { viewUrl } = await response.json();
            return viewUrl;
        } catch (error) {
            this.error = error.message;
            return null;
        }
    },
  },
});
