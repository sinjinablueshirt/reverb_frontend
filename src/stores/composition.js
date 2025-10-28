import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useFileStore } from './file';
import { useCommentStore } from './comment';

const API_URL = 'http://localhost:8000/api';

export const useCompositionStore = defineStore('composition', {
  state: () => ({
    compositions: [], // User's compositions
    searchResults: [], // Search results
    currentComposition: null,
    error: null,
  }),
  actions: {
    async searchCompositions(tags) {
      try {
        const response = await fetch('/api/MusicTagging/_getRegistriesByTags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags }),
        });
        const data = await response.json();
        console.log('Search compositions response data:', data);
        if (data.error) {
          this.error = data.error;
          this.searchResults = [];
        } else {
          this.searchResults = data;
          this.error = null;
        }
      } catch (error) {
        this.error = error.message;
        this.searchResults = [];
      }
    },
    async createComposition(compositionData) {
      const authStore = useAuthStore();
      if (!authStore.user) {
        this.error = 'User must be logged in to create a composition.';
        return;
      }

      try {
        const fileId = compositionData.fileId;
        if (!fileId) {
          this.error = 'File ID is missing.';
          return;
        }

        // 1. Register resource with MusicTagging
        const registerResponse = await fetch(`${API_URL}/MusicTagging/registerResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: fileId, description: compositionData.description }),
        });
        const registerData = await registerResponse.json();
        if (registerData.error) {
          this.error = registerData.error;
          return;
        }
        const registryId = registerData.registry;

        // 2. Add tags
        for (const tag of compositionData.tags) {
          if (tag) { // Ensure tag is not an empty string
            await fetch(`${API_URL}/MusicTagging/addTag`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ registry: registryId, tag }),
            });
          }
        }

        this.error = null;

      } catch (error) {
        this.error = error.message;
      }
    },
    async getCompositionsByUser(userId) {
      const fileStore = useFileStore();
      const files = await fileStore.getFilesByUser(userId);
      if (fileStore.error) {
        this.error = fileStore.error;
        return;
      }

      const compositions = [];
      if (files && Array.isArray(files.files)) {
        for (const file of files.files) {

          try {
            const registry = await fetch(`${API_URL}/MusicTagging/_getRegistryByResource`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource: file._id }),
            });
            const registryData = await registry.json();
            if (registryData.error) {
                throw new Error(registryData.error);
            }
            compositions.push({
              id: file._id,
              url: file.url,
              owner: file.owner,
              title: file.title || file.fileName,
              fileName: file.fileName,
              gcsObjectName: file.gcsObjectName,
              description: registryData.description,
              tags: registryData.tags || [],
            });
          } catch (e) {
            console.error(`Failed to get composition details for file ${file._id}`, e);
          }
        }
      }
      this.compositions = compositions;
    },
    async fetchComposition(id) {
      const authStore = useAuthStore();
      const fileStore = useFileStore();

      // First check if it's in the user's compositions cache
      if (this.compositions.length === 0 && authStore.user) {
        await this.getCompositionsByUser(authStore.user);
      }

      let composition = this.compositions.find(c => c.id === id);

      // If not found in cache, fetch it directly from the backend
      if (!composition) {
        try {
          // Fetch the file details
          const file = await fileStore.getFileById(id);
          if (file) {
            // Fetch the registry details
            const registry = await fetch(`${API_URL}/MusicTagging/_getRegistryByResource`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resource: id }),
            });
            const registryData = await registry.json();

            composition = {
              id: file._id,
              url: file.url,
              owner: file.owner,
              title: file.title || file.fileName,
              fileName: file.fileName,
              gcsObjectName: file.gcsObjectName,
              description: registryData.description || 'No description',
              tags: registryData.tags || [],
            };
          }
        } catch (e) {
          console.error(`Failed to fetch composition ${id}`, e);
        }
      }

      this.currentComposition = composition || null;
      if (!this.currentComposition) {
        this.error = "Composition not found.";
      }
    },
    async updateComposition({ id, data }) {
      const authStore = useAuthStore();
      if (!authStore.user) {
        this.error = 'User must be logged in to update a composition.';
        return;
      }

      try {
        const fileId = id;

        // Get the registry for this resource
        const registryResponse = await fetch(`${API_URL}/MusicTagging/_getRegistryByResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: fileId }),
        });
        const registryData = await registryResponse.json();

        if (registryData.error) {
          this.error = registryData.error;
          return;
        }

        const registryId = registryData._id;

        // Update tags: remove old tags and add new ones
        if (data.tags !== undefined) {
          const currentTags = registryData.tags || [];

          // Remove tags that are no longer present
          for (const tag of currentTags) {
            if (!data.tags.includes(tag)) {
              await fetch(`${API_URL}/MusicTagging/removeTag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registry: registryId, tag }),
              });
            }
          }

          // Add new tags
          for (const tag of data.tags) {
            if (tag && !currentTags.includes(tag)) {
              await fetch(`${API_URL}/MusicTagging/addTag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registry: registryId, tag }),
              });
            }
          }
        }

        this.error = null;

        // Refresh the composition to get updated data
        await this.fetchComposition(id);

      } catch (error) {
        this.error = error.message;
        console.error('Error updating composition:', error);
      }
    },
    async deleteComposition(id) {
      const authStore = useAuthStore();
      const fileStore = useFileStore();

      if (!authStore.user) {
        this.error = 'User must be logged in to delete a composition.';
        return false;
      }

      try {
        console.log('Starting deletion for composition ID:', id);
        console.log('Current user:', authStore.user);

        // 1. Get the registry for this resource
        const registryResponse = await fetch(`${API_URL}/MusicTagging/_getRegistryByResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: id }),
        });
        const registryData = await registryResponse.json();
        console.log('Registry data:', registryData);

        if (registryData.error) {
          console.error('Failed to get registry:', registryData.error);
        } else {
          const registryId = registryData._id;
          console.log('Registry ID:', registryId);

          // 2. Delete all comments associated with this registry
          const commentStore = useCommentStore();
          await commentStore.fetchComments(id);
          console.log('Comments to delete:', commentStore.comments);

          for (const comment of commentStore.comments) {
            console.log('Deleting comment:', comment._id);
            const removeCommentResponse = await fetch(`${API_URL}/Comment/removeComment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                comment: comment._id,
                user: authStore.user
              }),
            });
            const removeCommentResult = await removeCommentResponse.json();
            console.log('Remove comment result:', removeCommentResult);
          }

          // 3. Delete the registry
          console.log('Deleting registry:', registryId);
          const deleteRegistryResponse = await fetch(`${API_URL}/MusicTagging/deleteRegistry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registry: registryId }),
          });
          const deleteRegistryResult = await deleteRegistryResponse.json();
          console.log('Delete registry result:', deleteRegistryResult);
        }

        // 4. Delete the file from storage
        console.log('Deleting file:', id, 'for user:', authStore.user);
        const deleteFileResponse = await fetch(`${API_URL}/FileUrl/deleteFile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: id,
            user: authStore.user
          }),
        });
        const deleteFileResult = await deleteFileResponse.json();
        console.log('Delete file result:', deleteFileResult);

        this.error = null;

        // Remove from local cache
        this.compositions = this.compositions.filter(c => c.id !== id);

        console.log('Deletion completed successfully');
        return true;

      } catch (error) {
        this.error = error.message;
        console.error('Error deleting composition:', error);
        return false;
      }
    }
  },
});
