<template>
  <div class="upload-view">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <div class="content">
      <h1>{{ isEditing ? 'Edit' : 'Upload' }} Composition</h1>

      <!-- Loading Overlay -->
      <div v-if="isUploading" class="upload-overlay">
        <div class="upload-modal">
          <div class="upload-spinner"></div>
          <p class="upload-text">{{ uploadStatus }}</p>
          <p class="upload-subtext">Please wait, this may take a moment...</p>
        </div>
      </div>

      <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="composition.title" required />
      </div>
      <div>
        <label for="description">Description</label>
        <textarea id="description" v-model="composition.description"></textarea>
      </div>
      <div>
        <label for="tags">Tags (comma-separated)</label>
        <input type="text" id="tags" v-model="tags" />
      </div>
      <div>
        <label for="public">Public</label>
        <input type="checkbox" id="public" v-model="composition.isPublic" />
      </div>
      <div>
        <label for="file">File</label>
        <input type="file" id="file" @change="onFileChange" />
      </div>
      <button type="submit">{{ isEditing ? 'Update' : 'Post' }}</button>
    </form>
    <div v-if="fileStore.error" class="error">{{ fileStore.error }}</div>
    <div v-if="compositionStore.error" class="error">{{ compositionStore.error }}</div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompositionStore } from '@/stores/composition';
import { useAuthStore } from '@/stores/auth';

import { useFileStore } from '@/stores/file';

const compositionStore = useCompositionStore();
const authStore = useAuthStore();
const fileStore = useFileStore();
const route = useRoute();
const router = useRouter();

const composition = ref({
  title: '',
  description: '',
  isPublic: true,
  owner: '',
  fileId: null,
});
const tags = ref('');
const selectedFile = ref(null);
const isUploading = ref(false);
const uploadStatus = ref('');

const isEditing = computed(() => route.name === 'edit-composition');

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const submitForm = async () => {
  isUploading.value = true;
  uploadStatus.value = 'Uploading file...';

  if (selectedFile.value) {
    const fileId = await fileStore.uploadFile(selectedFile.value, composition.value.title);
    if (fileId) {
      composition.value.fileId = fileId;
    } else {
      // Handle file upload error
      console.error('File upload failed:', fileStore.error);
      isUploading.value = false;
      return;
    }
  }

  uploadStatus.value = 'Creating composition...';
  composition.value.owner = authStore.user;

  // Parse user-entered tags
  let compositionTags = tags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

  // Add "public" tag if composition is public
  if (composition.value.isPublic && !compositionTags.includes('public')) {
    compositionTags.push('public');
  }

  // Remove "public" tag if composition is private
  if (!composition.value.isPublic) {
    compositionTags = compositionTags.filter(tag => tag !== 'public');
  }

  const compositionData = {
    ...composition.value,
    tags: compositionTags,
  };

  if (isEditing.value) {
    await compositionStore.updateComposition({ id: route.params.id, data: compositionData });
  } else {
    await compositionStore.createComposition(compositionData);
  }

  if (!compositionStore.error) {
    router.push('/');
  } else {
    isUploading.value = false;
  }
};

onMounted(async () => {
  if (isEditing.value) {
    await compositionStore.fetchComposition(route.params.id);
    if (compositionStore.currentComposition) {
      composition.value = { ...compositionStore.currentComposition };
      // Filter out "public" tag from display and set isPublic based on its presence
      const hasPublicTag = composition.value.tags.includes('public');
      composition.value.isPublic = hasPublicTag;
      tags.value = composition.value.tags.filter(t => t !== 'public').join(', ');
    }
  }
});
</script>

<style scoped>
.upload-view {
  position: relative;
  min-height: 100vh;
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

.content {
  position: relative;
  z-index: 1;
}

/* Upload Loading Overlay */
.upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.upload-modal {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(253, 245, 232, 0.95));
  padding: 3rem 4rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(135, 104, 200, 0.3);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  animation: slideUp 0.4s ease;
}

.upload-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, #8768c8, #a94a66, #feb503);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: borderGlow 2s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.upload-spinner {
  width: 80px;
  height: 80px;
  border: 6px solid rgba(135, 104, 200, 0.2);
  border-top: 6px solid #8768c8;
  border-right: 6px solid #a94a66;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-text {
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #8768c8 0%, #a94a66 50%, #feb503 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.upload-subtext {
  color: #3d5d7e;
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.8;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
