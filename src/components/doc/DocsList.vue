<template>
  <v-card class="mx-auto" max-width="1000">
    <v-row no-gutters>
      <v-col cols="3">
        <v-navigation-drawer permanent>
          <v-card class="mx-auto" max-width="300">
            <v-list>
              <v-list-item
                class="title"
                :to="{name: 'DocsList', params: { car: carSlug }}"
              >{{ car.name }}</v-list-item>
              <v-divider />
              <v-list-item-group v-model="currentPartIndex">
                <v-list-item
                  v-for="p in parts"
                  :key="p.id"
                  :to="{ name: 'DocsListPart', params: { car: carSlug , part: p.slug } }"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ p.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-navigation-drawer>
      </v-col>
      <v-col cols="9" class="d-flex">
        <v-img v-if="!partSlug" class="ma-5" :src="car.img_src"></v-img>
        <v-list>
          <v-list-item-group>
            <v-list-item
              link
              dense
              v-for="doc in docs"
              :key="doc.id"
              :to="{ name: 'Doc', params: { car: carSlug , part: partSlug, doc: doc.slug } }"
            >
              <v-list-item-content>
                <v-list-item-title>{{ doc.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      currentPartIndex: 0
    };
  },
  computed: {
    parts() {
      return this.$store.getters.parts;
    },
    allDocs() {
      return this.$store.getters["docs/list"];
    },
    docs() {
      return this.allDocs.filter(d => d.part.slug === this.partSlug);
    },
    carSlug() {
      return this.$route.params.car;
    },
    partSlug() {
      return this.$route.params.part;
    },
    car() {
      return this.$store.getters.car;
    }
  },
  methods: {},
  mounted() {
    this.$store.dispatch("fetchCarBySlug", this.carSlug);
    this.$store.dispatch("docs/fetchList", this.$route.params.car);
    this.$store.dispatch("fetchParts");
  }
};
</script>
