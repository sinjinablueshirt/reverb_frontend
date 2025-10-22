<template>
  <div v-if="composition" class="composition-container">
    <div class="composition-header">
      <h1>{{ composition.fileName || 'Composition' }}</h1>
      <p><strong>Description:</strong> {{ composition.description }}</p>
      <p><strong>Tags:</strong> {{ composition.tags.join(', ') }}</p>
    </div>

    <div class="content-wrapper">
      <!-- PDF Viewer Section -->
      <div class="pdf-section">
        <iframe v-if="viewUrl" :src="viewUrl" class="pdf-iframe"></iframe>
        <div v-else-if="loading" class="placeholder">
          <p>Loading file preview...</p>
        </div>
        <div v-else class="placeholder">
          <p>No file preview available.</p>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <h2>Feedback</h2>

        <!-- Add Comment Form -->
        <div v-if="authStore.user" class="add-comment">
          <textarea
            v-model="newCommentText"
            placeholder="Leave your feedback here..."
            rows="4"
          ></textarea>
          <div class="tag-input-row">
            <textarea
              v-model="newCommentTags"
              placeholder="Enter tags (comma-separated)..."
              rows="2"
            ></textarea>
            <button
              @click="suggestTags"
              :disabled="!newCommentText.trim() || suggestingTags"
              class="suggest-btn"
            >
              {{ suggestingTags ? 'Suggesting...' : 'Suggest Tags' }}
            </button>
          </div>
          <button @click="submitComment" :disabled="!newCommentText.trim()">
            Submit Feedback
          </button>
          <div v-if="commentStore.error" class="error">{{ commentStore.error }}</div>
        </div>
        <div v-else class="login-prompt">
          <p>Please log in to leave feedback.</p>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="commentStore.comments.length === 0">
            <p>No feedback yet. Be the first to leave a comment!</p>
          </div>
          <div v-else>
            <div v-for="comment in commentStore.comments" :key="comment._id" class="comment">
              <div class="comment-header">
                <strong>{{ getUserName(comment.commenter) }}</strong>
                <span class="comment-date">{{ formatDate(comment.date) }}</span>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
              <div v-if="comment.tags && comment.tags.length > 0" class="comment-tags">
                <span v-for="tag in comment.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <button
                v-if="authStore.user === comment.commenter"
                @click="deleteComment(comment._id)"
                class="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading composition...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCompositionStore } from '@/stores/composition';
import { useFileStore } from '@/stores/file';
import { useCommentStore } from '@/stores/comment';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const compositionStore = useCompositionStore();
const fileStore = useFileStore();
const commentStore = useCommentStore();
const authStore = useAuthStore();

const composition = ref(null);
const viewUrl = ref(null);
const loading = ref(false);
const newCommentText = ref('');
const newCommentTags = ref('');
const suggestingTags = ref(false);
const userNames = ref({});

const loadComposition = async () => {
  const compositionId = route.params.id;
  await compositionStore.fetchComposition(compositionId);
  composition.value = compositionStore.currentComposition;

  // Get the view URL for the file
  if (composition.value && composition.value.gcsObjectName) {
    loading.value = true;
    viewUrl.value = await fileStore.getViewUrl(composition.value.gcsObjectName);
    loading.value = false;
  }

  // Register the composition as a commentable resource and load comments
  if (composition.value) {
    await commentStore.registerResource(compositionId);
    await commentStore.fetchComments(compositionId);

    // Load usernames for all commenters
    for (const comment of commentStore.comments) {
      await loadUserName(comment.commenter);
    }
  }
};

const submitComment = async () => {
  if (!newCommentText.value.trim()) return;

  const compositionId = route.params.id;

  // Parse tags from comma-separated string
  const tags = newCommentTags.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  await commentStore.addComment(compositionId, newCommentText.value, tags);

  if (!commentStore.error) {
    newCommentText.value = '';
    newCommentTags.value = '';
    // Reload comments to get the latest
    await commentStore.fetchComments(compositionId);

    // Load usernames for new commenters
    for (const comment of commentStore.comments) {
      await loadUserName(comment.commenter);
    }
  }
};

const suggestTags = async () => {
  if (!newCommentText.value.trim()) return;

  suggestingTags.value = true;

  try {
    // Parse existing tags from the input
    const existingTags = newCommentTags.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const response = await fetch('http://localhost:8000/api/MusicTagging/suggestTags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: newCommentText.value,
        existingTags: existingTags,
      }),
    });

    const data = await response.json();

    if (data.tags && Array.isArray(data.tags)) {
      // Append suggested tags to existing tags
      const allTags = [...existingTags, ...data.tags];
      newCommentTags.value = allTags.join(', ');
    } else if (data.error) {
      console.error('Error suggesting tags:', data.error);
    }
  } catch (error) {
    console.error('Failed to suggest tags:', error);
  } finally {
    suggestingTags.value = false;
  }
};

const deleteComment = async (commentId) => {
  const compositionId = route.params.id;
  await commentStore.removeComment(commentId, compositionId);
};

const loadUserName = async (userId) => {
  if (userNames.value[userId]) return;

  try {
    const response = await fetch('http://localhost:8000/api/UserAuthentication/_getUserById', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    });
    const data = await response.json();
    if (data.username) {
      userNames.value[userId] = data.username;
    }
  } catch (error) {
    console.error('Failed to load username:', error);
    userNames.value[userId] = 'Unknown User';
  }
};

const getUserName = (userId) => {
  return userNames.value[userId] || 'Loading...';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(loadComposition);

watch(() => route.params.id, loadComposition);
</script>

<style scoped>
.composition-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.composition-header {
  margin-bottom: 1rem;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.pdf-section {
  flex: 1;
  min-width: 0;
  border: 2px solid #98fb98;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.comments-section {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comments-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2e8b57;
}

.add-comment {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.add-comment textarea {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #98fb98;
  border-radius: 4px;
  font-family: inherit;
  margin-bottom: 0.5rem;
  resize: vertical;
}

.tag-input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-input-row textarea {
  flex: 1;
  margin-bottom: 0;
}

.suggest-btn {
  background-color: #3cb371;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.suggest-btn:hover:not(:disabled) {
  background-color: #2e8b57;
}

.suggest-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-comment button {
  background-color: #3cb371;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.add-comment button:hover:not(:disabled) {
  background-color: #2e8b57;
}

.add-comment button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #ff0000;
  margin-top: 0.5rem;
}

.login-prompt {
  padding: 1rem;
  background-color: #f0fff0;
  border: 1px solid #98fb98;
  border-radius: 4px;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.comments-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 0.5rem;
}

.comment {
  background-color: #f0fff0;
  border: 1px solid #98fb98;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #2e8b57;
}

.comment-date {
  font-size: 0.9rem;
  color: #666;
}

.comment-text {
  margin: 0.5rem 0;
  white-space: pre-wrap;
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.comment-tags .tag {
  background-color: #3cb371;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.delete-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background-color: #ff5252;
}

/* Responsive design for smaller screens */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    height: auto;
  }

  .pdf-section {
    height: 600px;
  }

  .comments-section {
    flex: 1;
    max-height: 600px;
  }
}
</style>
