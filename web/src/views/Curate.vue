<template>
  <v-container>
    <Section>
      <template v-slot:title>
        Curate Tweets
        <v-spacer></v-spacer>
        <v-chip outlined dark>{{ count }} Tweets</v-chip>
      </template>

      <v-textarea
        v-model="displayTweet"
        outlined
        label="Tweet"
        counter
        :readonly="!editing"
        :disabled="currentLoading"
        :loading="loading"
      >
        <template v-slot:progress>
          <v-progress-linear absolute indeterminate></v-progress-linear>
        </template>
      </v-textarea>

      <template v-slot:actions>
        <v-btn
          :disabled="!tweetActionable"
          color="warning"
          @click="deleteAction"
        >
          Delete
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!tweetActionable"
          color="primary"
        >
          Edit
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!tweetActionable"
          color="success"
          @click="enqueueAction"
        >
          Enqueue
        </v-btn>
      </template>

    </Section>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Section from '@/components/Section.vue'
import { firestore, firebase } from '@/plugins/firebase'
import { State, Mutation } from 'vuex-class';

@Component({ components: { Section } })
export default class LoadView extends Vue {
  @State('uid', { namespace: 'auth' }) uid!: string;
  @Mutation('showError', { namespace: 'alert'}) showError!: Function;
  @Mutation('showSuccess', { namespace: 'alert'}) showSuccess!: Function;

  count = 0;
  currentId = "";
  currentTweet = "";
  currentDocRef: firebase.firestore.DocumentReference | null = null;

  nextId = "";
  nextTweet = "";
  nextDocRef: firebase.firestore.DocumentReference | null = null;

  editing = false;

  currentLoading = true;
  nextLoading = true;

  get loading() {
    return this.currentLoading || this.nextLoading;
  }

  get tweetActionable() {
    return !this.editing && this.currentTweet && !this.currentLoading;
  }

  get displayTweet() {
    if (this.currentTweet || this.loading) {
      return this.currentTweet;
    }
    return 'No more tweets loaded!';
  }
  set displayTweet(tweet: string) {
    this.currentTweet = tweet;
  }
  
  enqueueAction() {
    if (this.currentDocRef) {
      this.currentLoading = true

      this.currentDocRef.update({
        queued: true
      })
      .then(() => {
        return firestore.collection('users').doc(this.uid).update({
          newCount: firebase.firestore.FieldValue.increment(-1)
        });
      })
      .then(() => {
        this.currentLoading = false
        this.count -= 1;
        return this.advance()
      })
      .catch(err => {
        console.error(err)
        this.showError("Something went wrong, could not delete tweet");
      })
    }
  }


  deleteAction() {
    if (this.currentDocRef) {
      this.currentLoading = true

      this.currentDocRef.delete()
      .then(() => {
        return firestore.collection('users').doc(this.uid).update({
          newCount: firebase.firestore.FieldValue.increment(-1)
        });
      })
      .then(() => {
        this.currentLoading = false
        this.count -= 1;
        return this.advance()
      })
      .catch(err => {
        console.error(err)
        this.showError("Something went wrong, could not delete tweet");
      })
    }
  }

  advance(): any { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (this.nextLoading) {
      // if we're already loading, that means the next one will appear shortly,
      // so just clear display and wait
      this.currentId = "";
      this.currentTweet = "";
      this.currentDocRef = null;
      return
    }
    
    this.currentId = this.nextId;
    this.currentTweet = this.nextTweet;
    this.currentDocRef = this.nextDocRef;

    this.nextId = ""
    this.nextTweet = ""
    this.nextDocRef = null

    if (this.currentDocRef) {
      this.nextLoading = true;
      return firestore.collection('users').doc(this.uid).collection('tweets')
      .where('queued', '==', false).orderBy('added').limit(2).get()
      .then(query => {
        this.nextLoading = false;
        if (query.size > 1) {
          this.nextId = query.docs[1].id;
          this.nextTweet = query.docs[1].get("tweet");
          this.nextDocRef = query.docs[1].ref;

          if(!this.currentDocRef) { // in case current tweet was already dealt with while a document was being fetched
            return this.advance()
          }
        }
      })
      .catch(err => {
        console.error(err)
        this.showError("Something went wrong, could not load next tweet");
      })
    }
  }

  mounted() {
    firestore.collection('users').doc(this.uid).get()
    .then(doc => {
      this.count = doc?.get("newCount") || 0;
    })

    this.currentLoading = true;
    this.nextLoading = true;
    return firestore.collection('users').doc(this.uid).collection('tweets')
    .where('queued', '==', false).orderBy('added').limit(2).get()
    .then(query => {
      if (query.size) {
        this.currentId = query.docs[0].id;
        this.currentTweet = query.docs[0].get("tweet");
        this.currentDocRef = query.docs[0].ref;

        if (query.size > 1) {
          this.nextId = query.docs[1].id;
          this.nextTweet = query.docs[1].get("tweet");
          this.nextDocRef = query.docs[1].ref;
        }
      }
      this.currentLoading = false;
      this.nextLoading = false;
    })
    .catch(err => {
      console.error(err);
      this.showError("Something went wrong, could not load tweets");
    })
  }
}
</script>
