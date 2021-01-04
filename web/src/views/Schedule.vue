<template>
  <v-container>
    <Section>
      <template v-slot:title>Schedule</template>
      <p>
      When to post? CurateBot will post sometime within each hour. Times are UTC. Current hour is marked with "now"
      </p>
      <v-simple-table dense>
        <thead>
          <tr>
            <th class="text-center">Time</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
            <th>Sun</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="hourIdx in 24"
            :key="(hourIdx-1)/24"
          >
            <td class="text-center">
              <v-chip v-if="hourIdx == current" small color="primary">{{ hourIdx-1 }}:00 now</v-chip>
              <span v-else>{{ hourIdx-1 }}:00</span>
            </td>
            <td v-for="dayIdx in 7" :key="(dayIdx-1)*24+hourIdx-1">
              <v-simple-checkbox
                :disabled="loading"
                v-model="schedule[(dayIdx-1)*24+hourIdx-1]"
                color="primary"
                :ripple="false"
              ></v-simple-checkbox>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <template v-slot:actions>
        <v-btn
          :disabled="loading"
          color="warning"
          @click="clearAction"
        >
          Clear Schedule
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="loading"
          color="success"
          @click="saveAction"
        >
          Save Schedule
        </v-btn>
      </template>
    </Section>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Section from '@/components/Section.vue'
import { firestore } from '@/plugins/firebase'
import { State, Mutation } from 'vuex-class';


@Component({ components: { Section } })
export default class LoadView extends Vue {
  @State('uid', { namespace: 'auth' }) uid!: string;
  @Mutation('showError', { namespace: 'alert'}) showError!: Function;
  @Mutation('showSuccess', { namespace: 'alert'}) showSuccess!: Function;

  schedule: Array<boolean> = new Array(24*7).fill(false);
  current = new Date().getUTCHours();
  loading = true;

  clearAction() {
    this.schedule = new Array(24*7).fill(false);
    this.saveAction();
  }

  saveAction() {
    if (!this.loading) {
      this.loading = true;

      const enabled = [];
      for (const idx in this.schedule) {
        if (this.schedule[idx]) {
          enabled.push(idx);
        }
      }

      return firestore.collection('users').doc(this.uid).update({
        scheduleEnabled: enabled
      })
      .then(() => {
        this.showSuccess("Schedule updated");
        this.loading = false;
      })
      .catch(err => {
        console.error(err);
        this.showError("Something went wrong, could not update schedule");
      })
    }
  }

  mounted() {
    this.loading = true;
    return firestore.collection('users').doc(this.uid).get()
    .then(doc => {
      const scheduleEnabled = doc.get("scheduleEnabled")
      if (scheduleEnabled) {
        this.schedule = new Array(24*7).fill(false);
        for (const idx of scheduleEnabled) {
          this.schedule[idx] = true;
        }
      }
    })
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