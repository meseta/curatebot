import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';

admin.initializeApp();

const runtimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 120,
  memory: "128MB",
}

const logger = functions.logger;
const firestore = admin.firestore();
const apiKey = functions.config().twitter.api_key;
const apiSecret = functions.config().twitter.api_secret;

async function processUser(doc: admin.firestore.DocumentSnapshot): Promise<any> {
  const uid = doc.id;
  const userKey = doc.get('accessToken');
  const userSecret = doc.get('secret');

  return doc.ref.collection('tweets').where('queued', '==', true).orderBy('added').limit(1).get()
  .then((query: admin.firestore.QuerySnapshot) => {
    if (query.size) {
      const tweetDoc = query.docs[0];
      const tweetText = tweetDoc.get('tweet');

      logger.info("Got tweet for user", {uid, tweetText});

      if (tweetText) {
        const client = new Twitter({
          consumer_key: apiKey,
          consumer_secret: apiSecret,
          access_token_key: userKey,
          access_token_secret: userSecret,
        });
        
        return client.post('statuses/update', {status: tweetText})
        .then(tweet => {
          logger.info("Tweet sent!", {tweet});
          return firestore.collection('system').doc('stats').update({
            tweetsSent: admin.firestore.FieldValue.increment(1),
          })
        })
        .then(() => {
          return tweetDoc.ref.delete();
        })

      }
      return tweetDoc.ref.delete();
    }
  
    logger.info("No more scheduled tweets for user", {uid});
    return doc.ref.update({
      isActive: false,
    });
  })
}

export const tweetScan = functions.runWith(runtimeOpts).pubsub.schedule('every 1 hours').onRun(async (context) => {
  const currentHour = new Date().getUTCHours();
  const currentDay = new Date().getUTCDay();
  const currentIdx = currentDay*24+currentHour;

  logger.info("Starting scan", {currentHour, currentDay, currentIdx});

  await firestore.collection('users').where('isActive', '==', true)
  .where('scheduleEnabled', 'array-contains', currentIdx.toString()).get()
  .then((query: admin.firestore.QuerySnapshot) => {

    const promises: Array<Promise<any>> = [];
    query.forEach((doc: admin.firestore.DocumentSnapshot ) => {
      promises.push(processUser(doc));
    })

    return Promise.all(promises);
  })
  .then(() => {
    return firestore.collection('system').doc('stats').update({
      lastRun: admin.firestore.FieldValue.serverTimestamp(),
    })
  })
  .then(() => {
    logger.info("Done scan");
  })
  .catch((err: Error) => {
    logger.error(err);
  })
});
