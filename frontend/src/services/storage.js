// In-memory fallback if localStorage is blocked by browser security/privacy policies
const memoryStore = {};

const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem is blocked, using memory fallback for key:", key, e);
      return memoryStore[key] || null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem is blocked, using memory fallback for key:", key, e);
      memoryStore[key] = String(value);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage.removeItem is blocked, using memory fallback for key:", key, e);
      delete memoryStore[key];
    }
  }
};

export default safeLocalStorage;
