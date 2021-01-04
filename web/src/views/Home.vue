<template>
  <v-container>
    <Section>
      <template v-slot:title>Welcome to CurateBot</template>
      <p>
        CurateBot is a simple bot to curate tweets, and post them on a schedule.
      </p>
      <ol>
        <li>Load a big list of tweets as a JSON</li>
        <li>Curate tweets by deciding whether to delete or enqueue</li>
        <li>Set up a schedule for tweets to be posted</li>
        <li>The bot will automatically tweet from your queued tweets on the schedule!</li>
      </ol>
    </Section>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Section from '@/components/Section.vue'

@Component({ components: { Section } })
export default class HomeView extends Vue {}
</script>
