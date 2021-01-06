# CurateBot

![CurateBot Logo](web/public/curatebot_preview.png)

CurateBot is a simple bot to curate tweets, and post them on a schedule.

1. Load a big list of tweets as a JSON
1. Curate tweets by deciding whether to delete or enqueue
1. Set up a schedule for tweets to be posted
1. The bot will automatically tweet from your queued tweets on the schedule!

# Stack
Curatebot is written in Vue 2 Typescript, using vuex, vue-router, and Vuetify. And deployed on Firebase hosting, using Firebase Functions (Typescript), and Google Cloud Scheduler.

You can read more about the development in [Yuan's blog here](https://dev.to/meseta/curatebot-devlog-0-simple-interface-for-curating-and-scheduling-ai-generated-tweets-8f3)