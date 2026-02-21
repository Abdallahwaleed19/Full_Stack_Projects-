import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import webpush from 'web-push';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn('Missing VAPID keys. Run: npm run generate-vapid and set .env');
}

webpush.setVapidDetails(
  'mailto:app@zad-elmuslim.local',
  VAPID_PUBLIC || '',
  VAPID_PRIVATE || ''
);

const subscriptions = new Map(); // endpoint -> { subscription, latitude, longitude, lastSent }

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.get('/api/vapid-public', (_, res) => {
  if (!VAPID_PUBLIC) return res.status(503).json({ error: 'VAPID not configured' });
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post('/api/push-subscribe', async (req, res) => {
  const { subscription, latitude, longitude, timeZone } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'subscription required' });
  }
  const key = subscription.endpoint;
  subscriptions.set(key, {
    subscription,
    latitude: latitude ?? 30.0444,
    longitude: longitude ?? 31.2357,
    timeZone: timeZone || 'Africa/Cairo',
    lastSent: {},
  });
  res.json({ ok: true });
});

app.post('/api/push-unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) subscriptions.delete(endpoint);
  res.json({ ok: true });
});

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_NAMES_AR = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };

async function getPrayerTimes(lat, lon) {
  const d = new Date();
  const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.data?.timings || null;
}

function getCurrentTimeInZone(timeZone) {
  const str = new Date().toLocaleString('en-CA', { timeZone, hour12: false, hour: '2-digit', minute: '2-digit' });
  const [h, m] = str.split(':');
  return { hours: parseInt(h, 10), minutes: parseInt(m, 10) };
}

function isPrayerTimeNow(timings, timeZone) {
  const { hours, minutes } = getCurrentTimeInZone(timeZone);
  const pad = (n) => String(n).padStart(2, '0');
  const currentStr = `${pad(hours)}:${pad(minutes)}`;
  for (const key of PRAYER_KEYS) {
    const t = timings[key];
    if (!t) continue;
    if (t === currentStr) return { prayer: key, nameAr: PRAYER_NAMES_AR[key] };
  }
  return null;
}

async function sendPushToSubscription(sub, payload) {
  try {
    await webpush.sendNotification(sub.subscription, JSON.stringify(payload), {
      TTL: 60,
    });
  } catch (e) {
    if (e.statusCode === 410 || e.statusCode === 404) subscriptions.delete(sub.subscription.endpoint);
  }
}

cron.schedule('* * * * *', async () => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  const now = new Date();
  const dateKey = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;

  for (const [endpoint, rec] of subscriptions.entries()) {
    try {
      const timings = await getPrayerTimes(rec.latitude, rec.longitude);
      if (!timings) continue;
      const hit = isPrayerTimeNow(timings, rec.timeZone);
      if (!hit) continue;
      const sentKey = `${dateKey}-${hit.prayer}`;
      if (rec.lastSent[sentKey]) continue;
      rec.lastSent[sentKey] = true;
      await sendPushToSubscription(rec, {
        title: 'وقت الصلاة',
        body: `أذان ${hit.nameAr}`,
        prayer: hit.prayer,
        url: '/',
      });
    } catch (e) {
      console.error('Cron push error', e.message);
    }
  }
});

app.listen(PORT, () => console.log(`Adhan push server on http://localhost:${PORT}`));
