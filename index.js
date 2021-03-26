import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import webPush from 'web-push';
import { insert, update, select } from 'easy-db-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const vapidKeys = {
  publicKey:
    'BHbth4HUOsN3uP6ZlHQg-mVCzaf78Vwxxn8Hq7A_ilbb3jNKDkDzmchPm7JiadjRRYSDD9DLqjQ0KxiBai_wStc',
  privateKey: 'SlzT_VuHInPPnEhe_y8z_zX9THP35L1G1AzeYNP7Gu0',
}

webPush.setVapidDetails(
  'mailto:ssemenkoff@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const port = 3005;

const sendNotification = async (notification) => {
  const rows = await select('subscriptions');
  for (let i in rows) {
    const payload = notification ? JSON.stringify(notification) 
      : JSON.stringify({
        title: 'Hello there',
        body: 'General kenobi',
        icon: 'https://static.wikia.nocookie.net/star-wars-memes/images/f/fe/General_Kenobi%21.jpg',
      });
    try {
      await webPush.sendNotification(rows[i], payload);
    } catch (e) {
    }
  }
};

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/save-sub', async (req, res) => {
  const subscription = req.body;
  await insert('subscriptions', subscription);
  res.sendStatus(200);
});

// curl --request GET http://localhost:3005/notification-webhook
app.get('/notification-webhook', async (req, res) => {
  try {
    await sendNotification();
  } catch (e) {
    console.log(e);
  }
  res.sendStatus(200);
});

app.post('/notification-webhook', async (req, res) => {
  const notification = req.body;
  try {
    await sendNotification(notification);
  } catch (e) {
    console.log(e);
  }
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});