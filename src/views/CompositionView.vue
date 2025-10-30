<template>
  <div v-if="composition" class="composition-container">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <div class="content-wrapper">
      <!-- Left Info Section -->
      <div class="info-section">
        <h1>{{ composition.title || 'Composition' }}</h1>
        <div class="info-item creator-item">
          <strong>Creator:</strong>
          <p>{{ compositionOwnerName || 'Loading...' }}</p>
        </div>
        <div class="info-item">
          <strong>Description:</strong>
          <p>{{ composition.description || 'No description provided' }}</p>
        </div>
        <div class="info-item">
          <strong>Tags:</strong>
          <div class="composition-tags">
            <span v-for="tag in composition.tags.filter(t => t !== 'public')" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- Public/Private Toggle (Owner Only) -->
        <div v-if="isOwner" class="info-item visibility-toggle">
          <strong>Visibility:</strong>
          <div class="toggle-container">
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isPublic"
                @change="toggleVisibility"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">{{ isPublic ? 'Public' : 'Private' }}</span>
          </div>
        </div>

        <!-- Delete Button (Owner Only) -->
        <div v-if="isOwner" class="info-item delete-section">
          <button @click="confirmDelete" class="delete-button">
            🗑️ Delete Composition
          </button>
        </div>
      </div>

      <!-- PDF Viewer Section -->
      <div class="pdf-section">
        <iframe v-if="viewUrl" :src="viewUrl + '#toolbar=0&navpanes=0&scrollbar=0'" class="pdf-iframe"></iframe>
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
          <div v-if="suggestTagsError" class="suggest-tags-error">{{ suggestTagsError }}</div>
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
import { useRoute, useRouter } from 'vue-router';
import { useCompositionStore } from '@/stores/composition';
import { useFileStore } from '@/stores/file';
import { useCommentStore } from '@/stores/comment';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
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
const suggestTagsError = ref('');
const userNames = ref({});
const compositionOwnerName = ref('');
const isPublic = ref(false);
const isOwner = ref(false);

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

    // Check if current user is the owner
    isOwner.value = authStore.user === composition.value.owner;

    // Check if composition is public (has "public" tag)
    isPublic.value = composition.value.tags.includes('public');

    // Load the composition owner's name
    if (composition.value.owner) {
      await loadUserName(composition.value.owner);
      compositionOwnerName.value = getUserName(composition.value.owner);
    }

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
  suggestTagsError.value = '';

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

    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      // Append suggested tags to existing tags
      const allTags = [...existingTags, ...data.tags];
      newCommentTags.value = allTags.join(', ');
      suggestTagsError.value = '';
    } else if (data.error) {
      console.error('Error suggesting tags:', data.error);
      suggestTagsError.value = 'Unable to find tags that match the comment content.';
    } else {
      // No tags were returned
      suggestTagsError.value = 'Unable to find tags that match the comment content.';
    }
  } catch (error) {
    console.error('Failed to suggest tags:', error);
    suggestTagsError.value = 'Unable to find tags that match the comment content.';
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

const toggleVisibility = async () => {
  if (!composition.value || !isOwner.value) return;

  const compositionId = route.params.id;
  let updatedTags = [...composition.value.tags];

  console.log('Current tags:', updatedTags);
  console.log('Current isPublic:', isPublic.value);

  // Toggle the public tag
  if (isPublic.value) {
    // Remove public tag
    updatedTags = updatedTags.filter(tag => tag !== 'public');
    console.log('Removing public tag, new tags:', updatedTags);
  } else {
    // Add public tag
    if (!updatedTags.includes('public')) {
      updatedTags.push('public');
      console.log('Adding public tag, new tags:', updatedTags);
    }
  }

  // Update the composition
  const compositionData = {
    ...composition.value,
    tags: updatedTags,
  };

  console.log('Updating composition with data:', compositionData);
  await compositionStore.updateComposition({ id: compositionId, data: compositionData });

  if (!compositionStore.error) {
    // Update local state
    isPublic.value = !isPublic.value;
    composition.value.tags = updatedTags;
    console.log('Update successful, new isPublic:', isPublic.value);
  } else {
    console.error('Update failed with error:', compositionStore.error);
  }
};

const confirmDelete = async () => {
  if (!composition.value || !isOwner.value) return;

  const confirmed = confirm(
    `Are you sure you want to delete "${composition.value.title || 'this composition'}"?\n\n` +
    'This will permanently delete:\n' +
    '• The composition file\n' +
    '• All comments and feedback\n' +
    '• All associated data\n\n' +
    'This action cannot be undone.'
  );

  if (!confirmed) return;

  const compositionId = route.params.id;
  const success = await compositionStore.deleteComposition(compositionId);

  if (success) {
    // Redirect to home page after successful deletion
    router.push('/');
  } else {
    alert('Failed to delete composition. Please try again.');
  }
};

onMounted(loadComposition);

watch(() => route.params.id, loadComposition);
</script>

<style scoped>
.composition-container {
  position: relative;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #8768c8, #a94a66);
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #feb503, #a94a66);
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #3d5d7e, #8768c8);
  top: 45%;
  right: 12%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}

/* Left Info Section */
.info-section {
  flex: 0 0 320px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 245, 232, 0.95) 100%);
  border: 2px solid #8768c8;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(135, 104, 200, 0.25);
  backdrop-filter: blur(10px);
}

.info-section h1 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 2em;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 50%, #feb503 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.info-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border-left: 4px solid #8768c8;
}

.creator-item {
  background: linear-gradient(135deg, rgba(135, 104, 200, 0.15) 0%, rgba(169, 74, 102, 0.15) 100%);
  border-left: 4px solid #feb503;
}

.creator-item p {
  font-weight: 600;
  color: #3d5d7e;
  font-size: 1.1em;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  display: block;
  color: #3d5d7e;
  margin-bottom: 0.75rem;
  font-size: 1em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  margin: 0;
  color: #1a1a1a;
  line-height: 1.7;
  font-size: 1.05em;
}

.composition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.composition-tags .tag {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(135, 104, 200, 0.3);
  transition: all 0.3s ease;
}

.composition-tags .tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(135, 104, 200, 0.4);
}

/* Visibility Toggle */
.visibility-toggle {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border-left: 4px solid #8768c8;
  margin-bottom: 1.5rem;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3d5d7e;
}

/* Delete Section */
.delete-section {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border-left: 4px solid #a94a66;
}

.delete-button {
  width: 100%;
  background: linear-gradient(135deg, #a94a66 0%, #d32f2f 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(169, 74, 102, 0.3);
}

.delete-button:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
}

.delete-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(169, 74, 102, 0.3);
}

/* PDF Section */
.pdf-section {
  flex: 1;
  max-width: 800px;
  min-width: 0;
  height: 800px;
  border: 2px solid #8a9eaf;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(61, 93, 126, 0.15);
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
  color: #3d5d7e;
}

.add-comment {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.add-comment textarea {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #8a9eaf;
  border-radius: 12px;
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
  background: linear-gradient(135deg, #3d5d7e 0%, #8768c8 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(61, 93, 126, 0.3);
}

.suggest-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(135, 104, 200, 0.4);
}

.suggest-btn:disabled {
  background: #8a9eaf;
  cursor: not-allowed;
  opacity: 0.6;
}

.add-comment button {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-comment button:hover:not(:disabled) {
  background: linear-gradient(135deg, #a94a66 0%, #feb503 100%);
  transform: translateY(-1px);
}

.add-comment button:disabled {
  background: #8a9eaf;
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  color: #a94a66;
  margin-top: 0.5rem;
  background-color: #ffe6f0;
  padding: 0.5rem;
  border-radius: 8px;
}

.suggest-tags-error {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.login-prompt {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid #8a9eaf;
  border-radius: 12px;
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
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid #8a9eaf;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(61, 93, 126, 0.1);
}

.comment:hover {
  border-color: #8768c8;
  box-shadow: 0 4px 10px rgba(135, 104, 200, 0.2);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #3d5d7e;
  font-weight: 600;
}

.comment-date {
  font-size: 0.9rem;
  color: #8a9eaf;
}

.comment-text {
  margin: 0.5rem 0;
  white-space: pre-wrap;
  color: #1a1a1a;
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.comment-tags .tag {
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(135, 104, 200, 0.2);
}

.delete-btn {
  background: linear-gradient(135deg, #a94a66 0%, #d45876 100%);
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
