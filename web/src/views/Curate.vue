<template>
  <v-container>
    <Section>
      <template v-slot:title>
        Curate Tweets
        <v-spacer></v-spacer>
        <v-chip outlined dark>{{ count }} tweets to curate</v-chip>
      </template>

      <v-textarea
        v-model="displayTweet"
        outlined
        label="Tweet"
        counter
        :readonly="!editing"
        :disabled="currentLoading"
        :loading="loading"
        v-touch="{
          left: () => deleteAction(true),
          right: () => enqueueAction(true),
        }"
        @click="editAction"
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
          v-if="editing"
          color="primary"
          @click="saveAction"
        >
          Save
        </v-btn>
        <v-btn
          v-else
          :disabled="!tweetActionable"
          color="primary"
          @click="editAction"
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
import { State, Mutation, Action, namespace} from 'vuex-class';

const authModule = namespace('auth')
const alertModule = namespace('alert')


@Component({ components: { Section } })
export default class LoadView extends Vue {
  @authModule.State uid!: string;
  @authModule.Action markActive!: Function;
  @alertModule.Mutation showError!: Function;
  @alertModule.Mutation showSuccess!: Function;
  @alertModule.Mutation showWarning!: Function;

  count = 0;
  currentId = "";
  currentTweet = "";
  currentDoc: firebase.firestore.DocumentSnapshot | null = null;

  nextId = "";
  nextTweet = "";
  nextDoc: firebase.firestore.DocumentSnapshot | null = null;

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

  editAction() {
    if (this.currentDoc) {
      this.editing = true;
    }
  }

  saveAction() {
    if (this.currentDoc && this.editing && this.currentTweet) {
      this.currentLoading = true;

      return this.currentDoc.ref.update({
        tweet: this.currentTweet
      })
      .then(() => {
        this.currentLoading = false;
        this.editing = false;
      })
      .catch(err => {
        console.error(err)
        this.showError("Something went wrong, could not edit tweet");
      })
    }
  }
  
  enqueueAction(alert = false) {
    if (this.currentDoc && !this.editing) {
      this.currentLoading = true;

      return this.currentDoc.ref.update({
        queued: true
      })
      .then(() => {
        return firestore.collection('users').doc(this.uid).update({
          newCount: firebase.firestore.FieldValue.increment(-1)
        });
      })
      .then(() => {
        this.currentLoading = false;
        this.count -= 1;
        if (alert) {
          this.showSuccess("Tweet enqueued")
        }
        this.markActive();
        return this.advance();
      })
      .catch(err => {
        console.error(err);
        this.showError("Something went wrong, could not delete tweet");
      })
    }
  }


  deleteAction(alert = false) {
    if (this.currentDoc && !this.editing) {
      this.currentLoading = true;

      return this.currentDoc.ref.delete()
      .then(() => {
        return firestore.collection('users').doc(this.uid).update({
          newCount: firebase.firestore.FieldValue.increment(-1)
        });
      })
      .then(() => {
        this.currentLoading = false;
        this.count -= 1;
        if (alert) {
          this.showWarning("Tweet deleted");
        }
        return this.advance();
      })
      .catch(err => {
        console.error(err);
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
      this.currentDoc = null;
      return
    }
    
    this.currentId = this.nextId;
    this.currentTweet = this.nextTweet;
    this.currentDoc = this.nextDoc;

    this.nextId = "";
    this.nextTweet = "";
    this.nextDoc = null;

    if (this.currentDoc) {
      this.nextLoading = true;
      return firestore.collection('users').doc(this.uid).collection('tweets')
      .where('queued', '==', false).orderBy('added').startAfter(this.currentDoc).limit(1).get()
      .then(query => {
        this.nextLoading = false;
        if (query.size) {
          this.nextId = query.docs[0].id;
          this.nextTweet = query.docs[0].get("tweet");
          this.nextDoc = query.docs[0];

          if(!this.currentDoc) { // in case current tweet was already dealt with while a document was being fetched
            return this.advance();
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
        this.currentDoc = query.docs[0];

        if (query.size > 1) {
          this.nextId = query.docs[1].id;
          this.nextTweet = query.docs[1].get("tweet");
          this.nextDoc = query.docs[1];
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
