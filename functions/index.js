/* ТОП-СПИН Cloud Functions
   Отправляет push при создании новой тренировки */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();

/**
 * Триггер: новая тренировка в /topspin/trainings/{id}
 * Отправляет push всем сохранённым FCM-токенам
 */
exports.onTrainingCreated = functions.database
  .ref('/topspin/trainings/{tid}')
  .onCreate(async (snapshot, context) => {
    const tr = snapshot.val();
    if (!tr) return null;

    try {
      const tokensSnap = await db.ref('/topspin/pushTokens').once('value');
      const tokensData = tokensSnap.val() || {};
      const tokens = [];
      Object.keys(tokensData).forEach((k) => {
        const t = tokensData[k] && tokensData[k].token;
        // Не отправляем создателю, если у него тот же токен
        if (t) tokens.push(t);
      });

      if (!tokens.length) {
        console.log('Нет push-токенов. Тренировка создана без уведомлений.');
        return null;
      }

      const creatorName = tr.createdBy || 'Игрок';
      const dateStr = formatDate(tr.date, tr.time);

      const message = {
        notification: {
          title: '🏓 Новая тренировка',
          body: `${creatorName} · ${dateStr}`
        },
        data: {
          type: 'training',
          trainingId: context.params.tid,
          url: './',
          tag: 'topspin-training-' + context.params.tid
        },
        webpush: {
          fcmOptions: { link: './' }
        }
      };

      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        ...message
      });

      console.log(`Push отправлен: ${response.successCount}/${tokens.length}`);

      // Удаляем невалидные токены
      const toDelete = [];
      response.responses.forEach((r, i) => {
        if (!r.success && r.error) {
          const code = r.error.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            toDelete.push(tokens[i]);
          }
        }
      });

      if (toDelete.length) {
        const updates = {};
        Object.keys(tokensData).forEach((k) => {
          if (toDelete.includes(tokensData[k].token)) {
            updates['/topspin/pushTokens/' + k] = null;
          }
        });
        if (Object.keys(updates).length) {
          await db.ref().update(updates);
          console.log(`Удалено невалидных токенов: ${toDelete.length}`);
        }
      }

      return null;
    } catch (err) {
      console.error('Ошибка отправки push:', err);
      return null;
    }
  });

/**
 * Триггер: новое сообщение в /topspin/messages/{id}
 * Отправляет push получателю
 */
exports.onMessageCreated = functions.database
  .ref('/topspin/messages/{mid}')
  .onCreate(async (snapshot, context) => {
    const msg = snapshot.val();
    if (!msg) return null;

    const to = msg.to;
    if (!to) return null; // broadcast — не обрабатываем здесь

    try {
      const key = String(to).replace(/[.#$/\[\]]/g, '_');
      const snap = await db.ref('/topspin/pushTokens/' + key).once('value');
      const rec = snap.val();
      if (!rec || !rec.token) return null;

      const message = {
        notification: {
          title: '💬 ' + (msg.fromName || 'Сообщение'),
          body: String(msg.text || '').slice(0, 120)
        },
        data: {
          type: 'message',
          from: msg.from || '',
          url: './',
          tag: 'topspin-msg-' + context.params.mid
        },
        token: rec.token,
        webpush: { fcmOptions: { link: './' } }
      };

      await admin.messaging().send(message);
      console.log('Push о сообщении отправлен');
      return null;
    } catch (err) {
      console.error('Ошибка отправки push-сообщения:', err);
      return null;
    }
  });

function formatDate(d, t) {
  if (!d) return t || '';
  const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  const parts = String(d).split('-');
  const day = parseInt(parts[2], 10) || '';
  const mon = months[(parseInt(parts[1], 10) || 1) - 1] || '';
  return `${day} ${mon}${t ? ' в ' + t : ''}`;
}
