if (typeof window !== 'undefined') {
  window.storage = {
    get: async (key) => {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key, val) => {
      localStorage.setItem(key, val);
      return true;
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return true;
    },
    list: async (prefix) => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
      return { keys };
    }
  };
}
