import { defineStore } from 'pinia';
import axios from 'axios';
import { useUsersStore } from '../store/user.store';
import { User } from '../interfaces/User';

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

export const useLoginStore = defineStore('login', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {

    async login(username: string, password: string): Promise<boolean> {
      try {
        const response = await axios.post('/api/users/login', {
          username,
          password,
        });


        if (response.data.user) {
          const user = response.data.user;


          this.user = user;


          const userStore = useUsersStore();
          userStore.setUser(user);

          return true;
        } else {
          this.user = null;
          return false;
        }
      } catch (error) {
        console.error("Error during login:", error);


        this.user = null;
        const userStore = useUsersStore();
        userStore.clearUser();

        return false;
      }
    },

    logout() {
      this.user = null;
      const userStore = useUsersStore();
      userStore.clearUser();
    },
  },
});
