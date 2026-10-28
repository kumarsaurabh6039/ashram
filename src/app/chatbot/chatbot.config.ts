/** Deploy: put your Render server URL below (with /api at the end), then run `npm run build`.
 *  On localhost (`npm start`) the dev proxy is used, so nothing else changes. */
const RENDER_API = 'https://YOUR-SERVICE-NAME.onrender.com/api';
const local = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

export const CHATBOT = {
  apiBase: local ? '/api' : RENDER_API,
  libraryUrl: 'assets/chatbot/library.json',
};
