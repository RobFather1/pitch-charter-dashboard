const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) throw new Error('VITE_API_BASE_URL is not set. Check your .env file.');

export const API_KEY = import.meta.env.VITE_API_KEY ?? '';

export default API_BASE;
