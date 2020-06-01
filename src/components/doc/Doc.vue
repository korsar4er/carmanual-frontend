<template>
  <v-card light>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="3" class="py-0">
          <v-btn @click="onBack">Назад</v-btn>
        </v-col>
        <v-col cols="12" sm="7" class="align-center py-0">
          <v-breadcrumbs class="pt-3" :items="breadcrumbsItems" />
        </v-col>
        <v-col cols="12" sm="2" class="d-flex justify-end py-0">
          <v-card-subtitle>Добавил: {{ doc.creator.name }}</v-card-subtitle>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center py-0">
          <v-card-title class="pa-0">{{ doc.name }}</v-card-title>
        </v-col>
      </v-row>
      <v-card-text class="html-text" v-html="doc.text"></v-card-text>
    </v-container>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbsItems: []
    };
  },
  computed: {
    doc() {
      const d = this.$store.getters["docs/doc"];
      return d ? d : { name: "", text: "", creator: { name: "" } };
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1);
    },
    fetchDoc() {
      this.$store
        .dispatch("docs/fetchDocBySlug", {
          docSlug: this.$route.params.doc,
          carSlug: this.$route.params.car,
          partSlug: this.$route.params.part
        })
        .then(() => {
          this.setBreadcrumbsItems();
        });
    },
    setBreadcrumbsItems() {
      const a = this.$route.path.split("/");
      const items = [];
      items.push({
        text: this.doc.car.name,
        disabled: false,
        href: a.slice(0, 3).join("/")
      });
      items.push({
        text: this.doc.part.name,
        disabled: false,
        href: a.slice(0, 4).join("/")
      });
      items.push({
        text: this.doc.name,
        disabled: true,
        href: ""
      });
      this.breadcrumbsItems = items;
    }
  },
  mounted() {
    this.fetchDoc();
  }
};
</script>

<style scoped>
.html-text >>> img {
  display: block;
  margin: auto;
}
</style>