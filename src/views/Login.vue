<template>
  <div class="login-container">
    <div class="login-panel">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="username">Username:</label>
          <input id="username" v-model="username" type="text" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <button type="submit" class="green-button">Log In</button> <!-- Añade la clase .btn -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import './Login.css';
import { ref } from "vue";
import { useLoginStore } from "../store/login.store";
import { useRouter } from "vue-router";

export default {
  name: "Login",
  setup() {
    const username = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const loginStore = useLoginStore();
    const router = useRouter();

    const handleLogin = async () => {
      const success = await loginStore.login(username.value, password.value);

      if (success) {
        router.push("/main");
      } else {
        errorMessage.value = "Invalid username or password";
      }
    };

    return {
      username,
      password,
      errorMessage,
      handleLogin,
    };
  },
};
</script>
