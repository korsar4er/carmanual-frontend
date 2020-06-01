<template>
  <v-layout v-if="confirmer.active" row justify-center>
    <v-dialog :value="confirmer.active" persistent max-width="350">
      <v-card outlined>
        <!-- <v-card-title>{{confirmer.title}}</v-card-title> -->
        <v-card-text v-if="confirmer.body" class="title">{{
          confirmer.body
        }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirm">Да</v-btn>
          <v-btn @click="cancel">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  computed: {
    confirmer() {
      return this.$store.state.confirmer;
    },
  },
  methods: {
    confirm() {
      this.confirmer.resolve(true);
      this.$store.commit("confirmer/deactivate");
    },
    cancel() {
      this.confirmer.resolve(false);
      this.$store.commit("confirmer/deactivate");
    },
  },
};
</script>
