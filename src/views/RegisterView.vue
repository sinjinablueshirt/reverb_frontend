<template>
  <div class="register-view">
    <div class="background-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <Register />
  </div>
</template>

<script>
import Register from '@/components/Register.vue'

export default {
  name: 'RegisterView',
  components: {
    Register
  }
}
</script>

<style scoped>
.register-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.background-elements {
  position: absolute;
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
  opacity: 0.4;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #feb503, #a94a66);
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, #8768c8, #3d5d7e);
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, #a94a66, #8768c8);
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
</style>
