import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.amber.darken2,
        warning: colors.deepOrange.base,
        error: colors.red.darken2,
        success: colors.lightGreen.base,
      }
    }
  }
});
