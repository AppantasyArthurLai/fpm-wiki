export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 註冊成功:', registration);
        })
        .catch((error) => {
          console.log('Service Worker 註冊失敗:', error);
        });
    });
  }
}
