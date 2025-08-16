import { defineStore } from 'pinia';

export const useContactsStore = defineStore('contacts', {
  state: () => ({ contacts: [] }),
  actions: {
    addContact(name, address) {
      this.contacts.push({ name, address });
    },
  },
  persist: true, // Requires pinia-plugin-persistedstate; install if missing
});
