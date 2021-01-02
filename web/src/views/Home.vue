<template>
  <v-container>
    <Section>
      <template v-slot:title>Welcome to CurateBot</template>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc faucibus nulla massa, sed porta dui pretium ut. Aenean vulputate laoreet dapibus. Vestibulum lacinia nibh at lectus semper pretium. Pellentesque semper ut ante eget finibus. Ut scelerisque velit neque. Ut porta ex orci, vitae eleifend ante pellentesque in. 
      </p>
    </Section>
  </v-container>
</template>

<script>
// @ is an alias to /src
import Section from '@/components/Section.vue'

export default {
  name: 'Home',
  components: {
    Section
  }
}
</script>
