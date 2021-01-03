<template>
  <v-snackbar
    v-model="alertState.isOpen"
    :color="alertState.color"
    :timeout="alertState.timeout"
  >
    {{ alertState.message }}
    <template v-slot:action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="close()"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { AlertState } from '@/store/alert/types';

@Component
export default class SnackbarComponent extends Vue {
  @State(state => state, { namespace: 'alert'}) alertState!: AlertState;
  @Mutation('close', { namespace: 'alert'}) close!: Function;
}
</script>