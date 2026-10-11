importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBBfeMqpQe5D6-W3QzuX6Q5PHZdmm5FtD8",
  projectId: "top-spin-3ef01",
  messagingSenderId: "939869281373",
  appId: "1:939869281373:web:5b7fe5304f7052489401b4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging] Background message:", payload);

  const notificationTitle = payload.notification?.title || "TopSpin";
  const notificationOptions = {
    body: payload.notification?.body || "Новое уведомление",
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
