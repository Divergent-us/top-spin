<artifact identifier="firebase-messaging-sw-final" type="application/vnd.ant.code" language="javascript" title="firebase-messaging-sw.js — содержимое файла">
// =====================================================
// ТОП-СПИН — сервис-воркер для фоновых уведомлений
// Файл должен лежать в КОРНЕ сайта, рядом с index.html
// =====================================================


// Подключаем Firebase (те же версии, что и в index.html)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');


// Инициализация Firebase — тот же конфиг, что и в index.html
firebase.initializeApp({
  apiKey: "AIzaSyBBfeMqpQe5D6-W3QzuX6Q5PHZdmm5FtD8",
  authDomain: "top-spin-3ef01.firebaseapp.com",
  projectId: "top-spin-3ef01",
  messagingSenderId: "939869281373",
  appId: "1:939869281373:web:5b7fe5304f7052489401b4"
});


// Получаем экземпляр Cloud Messaging
var messaging = firebase.messaging();


// Обработчик фоновых сообщений (когда приложение ЗАКРЫТО или в фоне)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw] Получено фоновое сообщение', payload);


  var notification = payload.notification || {};
  var title = notification.title || 'ТОП-СПИН';
  var body  = notification.body  || 'Новое уведомление';
  var icon  = notification.icon  || 'apple-touch-icon.png';


  // Показываем уведомление поверх всех окон
  self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: icon,
    tag: 'topspin-notification'
  });
});


// Клик по уведомлению — открываем приложение
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      return clients.openWindow('./');
    })
  );
});
</artifact>
