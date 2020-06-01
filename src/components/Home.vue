<template>
  <v-card class="mx-auto" color="rgba(255,255,255,0)" flat>
    <v-row>
      <v-col
        class="d-flex justify-center"
        v-for="car in cars"
        :key="car.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-badge overlap color="grey" :content="car.docsCount" :value="false">
          <v-card :to="{ name: 'DocsList', params: { car: car.slug } }" max-width="250" outlined>
            <v-img :src="car.img_src" height="150" width="250"></v-img>
            <p class="text-center text-uppercase mt-2">{{ car.name }}</p>
          </v-card>
        </v-badge>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  computed: {
    cars() {
      return this.$store.getters.cars;
    }
  },
  created() {
    this.$store.dispatch("fetchCars");
  }
};
</script>
