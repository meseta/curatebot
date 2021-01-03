<template>
  <v-container>
    <Section>
      <template v-slot:title>Load Data</template>

      <v-textarea
        v-model="input"
        outlined
        label="Paste JSON of tweets to load (Array of Strings)"
        :placeholder="placeholder"
        counter
        :counter-value="getCount"
        :rules="[validate]"
        :disabled="uploading"
        :loading="uploading"
      >
        <template v-slot:progress>
          <v-progress-linear absolute :value="progress"></v-progress-linear>
        </template>
      </v-textarea>

      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!decoded.length"
          color="primary"
          @click="upload"
        >
          Load {{ decoded.length }} Tweets
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

  placeholder = '[\n   "This is a tweet",\n    "Another tweet"\n]';
  input = '';
  decoded: Array<string> = [];

  progress = 0;
  uploading = false;

  getCount(input: string) {
    try {
      return JSON.parse(input).length || 0;
    } catch(err) {
      return 0;
    }
  }

  validate(input: string) {
    if (!input) {
      return true
    }

    let tryDecode;
    try {
      tryDecode = JSON.parse(input)
    } catch(err) {
      this.decoded = [];
      return err.message
    }
          
    if (!Array.isArray(tryDecode)) {
      this.decoded = [];
      return 'JSON parent was not Array';
    }
    
    this.decoded = tryDecode.map(String);
    return true
  }

  hash(input: string) {
    const msgUint8 = new TextEncoder().encode(input);
    return crypto.subtle.digest('SHA-1', msgUint8)
    .then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    });
  }

  upload() {
    if (this.validate(this.input) !== true) {
      return
    }

    if (!this.decoded.length) {
      return
    }

    this.uploading = true;
    const len = this.decoded.length;
    let updated = 0;
    this.progress = 100/len;

    const promises = this.decoded.map((tweet) => {
      return this.hash(tweet)
      .then(hashHex => {
        firestore.collection('users').doc(this.uid).collection('tweets').doc(hashHex).set({
          tweet,
          added: firebase.firestore.FieldValue.serverTimestamp(),
          queued: false
        }, {merge: true})
      })
      .then(() => {
        updated += 1;
        this.progress += 100/len;
      })
    })

    Promise.all(promises)
    .then(() => {
      this.showSuccess(`Completed uploading ${updated} tweets`)
      this.input = '';
      this.$router.push('/curate')
    })
    .catch(err => {
      console.log(err)
      this.showError(`Could not load all tweets, ${updated} were updated`)
    })
    .finally(() => {
      firestore.collection('users').doc(this.uid).update({
        newCount: firebase.firestore.FieldValue.increment(updated)
      });
    })

  }
}
</script>
