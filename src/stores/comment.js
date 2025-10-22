import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

const API_URL = 'http://localhost:8000/api';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    error: null,
  }),
  actions: {
    async registerResource(resourceId) {
      this.error = null;
      try {
        const response = await fetch(`${API_URL}/Comment/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: resourceId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // Resource might already be registered, which is okay
          if (!errorData.error.includes('already registered')) {
            throw new Error(errorData.error || 'Failed to register resource');
          }
        }

        return true;
      } catch (error) {
        // Silently fail if already registered
        console.log('Resource registration:', error.message);
        return true;
      }
    },

    async fetchComments(resourceId) {
      try {
        const response = await fetch(`${API_URL}/Comment/_getCommentsByResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: resourceId }),
        });
        const data = await response.json();

        console.log('Fetched comments data:', data);

        // Handle both { comments: [...] } format and direct array format
        let commentsArray = [];
        if (Array.isArray(data)) {
          commentsArray = data;
        } else if (data && Array.isArray(data.comments)) {
          commentsArray = data.comments;
        }

        console.log('Comments array:', commentsArray);

        if (commentsArray.length > 0) {
          // Enrich each comment with its tags
          const enrichedComments = await Promise.all(
            commentsArray.map(async (comment) => {
              const tags = await this.getCommentTags(comment._id);
              return { ...comment, tags };
            })
          );
          this.comments = enrichedComments;
        } else {
          this.comments = [];
        }
        this.error = null;
      } catch (error) {
        console.error('Error fetching comments:', error);
        this.error = error.message;
        this.comments = [];
      }
    },

    async addComment(resourceId, text, tags = []) {
      const authStore = useAuthStore();
      if (!authStore.user) {
        this.error = 'User must be logged in to comment.';
        return;
      }
      try {
        const response = await fetch(`${API_URL}/Comment/addComment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: resourceId,
            commenter: authStore.user,
            text: text,
            date: new Date().toISOString(),
          }),
        });
        const data = await response.json();
        if (data.error) {
          this.error = data.error;
          return null;
        }

        const commentId = data.comment;

        // If tags are provided, register the comment as a resource and add tags
        if (tags.length > 0) {
          try {
            // Register comment as a resource in MusicTagging
            const registerResponse = await fetch(`${API_URL}/MusicTagging/registerResource`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ resource: commentId, description: text }),
            });
            const registerData = await registerResponse.json();

            if (!registerData.error) {
              const registryId = registerData.registry;

              // Add each tag to the registry
              for (const tag of tags) {
                if (tag.trim()) {
                  await fetch(`${API_URL}/MusicTagging/addTag`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ registry: registryId, tag: tag.trim() }),
                  });
                }
              }
            }
          } catch (tagError) {
            console.error('Error adding tags to comment:', tagError);
          }
        }

        this.error = null;
        // Refresh comments
        await this.fetchComments(resourceId);
        return commentId;
      } catch (error) {
        this.error = error.message;
        return null;
      }
    },

    async getCommentTags(commentId) {
      try {
        const response = await fetch(`${API_URL}/MusicTagging/_getRegistryByResource`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: commentId }),
        });
        const data = await response.json();

        if (data && data.tags) {
          return data.tags;
        }
        return [];
      } catch (error) {
        console.error('Error fetching comment tags:', error);
        return [];
      }
    },

    async removeComment(commentId, resourceId) {
      const authStore = useAuthStore();
      if (!authStore.user) {
        this.error = 'User must be logged in to delete comments.';
        return;
      }
      try {
        const response = await fetch(`${API_URL}/Comment/removeComment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: commentId,
            user: authStore.user,
          }),
        });
        const data = await response.json();
        if (data.error) {
          this.error = data.error;
        } else {
          this.error = null;
          // Refresh comments
          await this.fetchComments(resourceId);
        }
      } catch (error) {
        this.error = error.message;
      }
    },
  },
});
