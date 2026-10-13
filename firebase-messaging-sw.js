/* firebase-messaging-sw.js
   Service Worker для push-уведомлений ТОП-СПИН
   Лежит рядом с index.html */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBBfeMqpQe5D6-W3QzuX6Q5PHZdmm5FtD8",
  authDomain: "top-spin-3ef01.firebaseapp.com",
  databaseURL: "https://top-spin-3ef01-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "top-spin-3ef01",
  storageBucket: "top-spin-3ef01.firebasestorage.app",
  messagingSenderId: "939869281373",
  appId: "1:939869281373:web:5b7fe5304f7052489401b4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  const title = (payload.notification && payload.notification.title) || 'ТОП-СПИН';
  const body = (payload.notification && payload.notification.body) || '';
  const options = {
    body: body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    tag: (payload.data && payload.data.tag) || 'topspin'
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
