<template>
  <v-container>
    <Section v-for="(item, idx) in tweets" :key="item.id">
      <template v-slot:title>
        Queued Tweet
        <v-spacer></v-spacer>
        <v-chip outlined dark>{{ idx + 1 }}</v-chip>
        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="deleteAction(idx)">
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
            <v-list-item  @click="curateAction(idx)">
              <v-list-item-title>Send to Curate</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <v-textarea
        :value="item.tweet"
        counter
        auto-grow
        rows=2
        readonly
      >
      </v-textarea>
    </Section>

    <Container>
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
      <v-btn v-else-if="!listComplete" color="primary" @click="loadMore()">Load more</v-btn>
      <v-btn v-else disabled>No more to load</v-btn>
    </Container>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Section from '@/components/Section.vue'
import Container from '@/components/Container.vue'
import { firestore, firebase } from '@/plugins/firebase'
import { State, Mutation } from 'vuex-class';

interface TweetData {
  tweet: string;
  id: string;
  doc: firebase.firestore.DocumentSnapshot;
}

const pagesize = 10

@Component({ components: { Section, Container } })
export default class LoadView extends Vue {
  @State('uid', { namespace: 'auth' }) uid!: string;
  @Mutation('showError', { namespace: 'alert'}) showError!: Function;
  @Mutation('showSuccess', { namespace: 'alert'}) showSuccess!: Function;
  @Mutation('showWarning', { namespace: 'alert'}) showWarning!: Function;
  @Mutation('showInfo', { namespace: 'alert'}) showInfo!: Function;

  tweets: Array<TweetData> = [];
  loading = true;
  listComplete = false;

  deleteAction(idx: number) {
    return this.tweets[idx].doc.ref.delete()
    .then(() => {
      this.tweets.splice(idx, 1);
      this.showWarning("Tweet Deleted");
    })
    .catch(err => {
      console.error(err);
      this.showError("Something went wrong, could not delete tweet");
    })
  }

  curateAction(idx: number) {
    return this.tweets[idx].doc.ref.update({
      queued: false
    })
    .then(() => {
      return firestore.collection('users').doc(this.uid).update({
        newCount: firebase.firestore.FieldValue.increment(1)
      });
    })
    .then(() => {
      this.tweets.splice(idx, 1);
      this.showInfo("Tweet moved back to Curate");
    })
    .catch(err => {
      console.error(err);
      this.showError("Something went wrong, could not delete tweet");
    })
  }

  loadTweetsFromQuery(query: firebase.firestore.QuerySnapshot) {
    if (query.size < pagesize) {
      this.listComplete = true;
    }

    query.forEach(doc => {
      this.tweets.push({
        tweet: doc.get("tweet"),
        id: doc.id,
        doc: doc
      })
    })
  }

  loadMore() {
    this.loading = true;
    const lastDoc = this.tweets[this.tweets.length - 1].doc;

    return firestore.collection('users').doc(this.uid).collection('tweets')
    .where('queued', '==', true).orderBy('added').startAfter(lastDoc).limit(pagesize).get()
    .then(this.loadTweetsFromQuery)
    .catch(err => {
      console.error(err);
      this.showError("Something went wrong, could not load tweets");
    })
    .finally(() => {
      this.loading = false;
    })
  }

  mounted() {
    this.loading = true;
    return firestore.collection('users').doc(this.uid).collection('tweets')
    .where('queued', '==', true).orderBy('added').limit(pagesize).get()
    .then(this.loadTweetsFromQuery)
    .catch(err => {
      console.error(err);
      this.showError("Something went wrong, could not load tweets");
    })
    .finally(() => {
      this.loading = false;
    })
  }
}
</script>
