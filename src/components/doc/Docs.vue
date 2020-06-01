<template>
  <div>
    <v-card>
      <div>
        <div>
          <v-data-table
            :headers="headers"
            :items="docs"
            :options.sync="options"
            :server-items-length="total"
            disable-filtering
            disable-sort
            :loading="loading"
            loading-text="Загрузка данных..."
            class="elevation-1"
            :footer-props="{
              pageText: '{0}-{1} из {2}',
              itemsPerPageAllText: 'Все',
              itemsPerPageText: 'Строк на странице:',
            }"
            no-data-text="Данные не найдены"
            dense
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Инструкции</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-switch v-model="forApprove" label="Для утверждения" class="mt-5 mr-5"></v-switch>
                <v-btn dark @click="addDoc">
                  <v-icon>mdi-plus</v-icon>Добавить
                </v-btn>
              </v-toolbar>
            </template>
            <template v-slot:item.approved="{ item }">
              <v-simple-checkbox v-model="item.approved" disabled></v-simple-checkbox>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                v-if="listType == 'allDocs' || !item.approved"
                @click="editDoc(item)"
              >mdi-pencil</v-icon>
              <v-icon class="mx-2" @click="deleteDoc(item)">mdi-delete</v-icon>
              <v-icon v-if="listType == 'allDocs'" @click="approveDoc(item)">mdi-check-circle</v-icon>
            </template>
          </v-data-table>
        </div>
        <!-- <div v-else>
          <v-row justify="center" class="pt-5">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-row>
        </div>-->
      </div>
    </v-card>
    <ModalEditCar @saveChanges="fetchDocs()" />
  </div>
</template>

<script>
import ModalEditCar from "./ModalDocEdit";

export default {
  components: {
    ModalEditCar
  },
  props: {
    listType: {
      type: String,
      required: true
    },
    notApproved: Boolean
  },
  data() {
    return {
      headers: [
        { text: "Имя", value: "name" },
        { text: "Идентификатор", value: "slug" },
        { text: "Автомобиль", value: "car.name" },
        { text: "Раздел", value: "part.name" },
        { text: "Утвержден", value: "approved" },
        { text: "Создал", value: "creator.name" },
        { text: "Действия", value: "actions" }
      ],
      options: {
        page: 1,
        itemsPerPage: 10
      },
      total: 0,
      watchOptions: true,
      forApprove: false
    };
  },
  computed: {
    docs() {
      return this.$store.getters["docs/page"];
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  watch: {
    options: {
      handler() {
        if (this.watchOptions) {
          // console.log("watch options");
          this.fetchDocs();
        }
      }
    },
    deep: true
  },
  methods: {
    fetchDocs() {
      const filter = {
        page: this.options.page,
        perPage: this.options.itemsPerPage
      };
      if (this.listType === "myDocs") {
        filter.creatorId = this.$store.getters.currentUser.id;
      }
      if (this.forApprove) {
        filter.approved = false;
      }
      this.watchOptions = false;
      this.$store
        .dispatch("docs/fetchPage", filter)
        .then(count => {
          this.total = count;
        })
        .catch(() => {
          if (this.$store.getters.sessionIsOver) {
            this.$router.push("/login");
            this.$store.dispatch("setError", "Время сессии истекло");
          }
        })
        .finally(() => {
          this.watchOptions = true;
        });
    },
    editDoc(doc) {
      this.watchOptions = false;
      this.$store.dispatch("docs/openEditDialog", doc.id).then(() => {
        this.watchOptions = true;
      });
    },
    addDoc() {
      this.$store.dispatch("docs/openEditDialog", null);
    },
    deleteDoc(doc) {
      this.$store
        .dispatch("confirmer/ask", `Удалить ${doc.name}?`)
        .then(answer => {
          if (answer) {
            this.$store
              .dispatch("docs/delete", doc.id)
              .then(() => {
                this.fetchDocs();
              })
              .catch(() => {
                if (this.$store.getters.sessionIsOver) {
                  this.$router.push("/login");
                  this.$store.dispatch("setError", "Время сессии истекло");
                }
              });
          }
        });
    },
    approveDoc(doc) {
      this.$store
        .dispatch("confirmer/ask", `Утвердить ${doc.name}?`)
        .then(answer => {
          if (answer) {
            this.$store
              .dispatch("docs/approve", doc.id)
              .then(() => {
                this.fetchDocs();
              })
              .catch(() => {
                if (this.$store.getters.sessionIsOver) {
                  this.$router.push("/login");
                  this.$store.dispatch("setError", "Время сессии истекло");
                }
              });
          }
        });
    }
  },
  // created() {
  // },
  mounted() {
    if (this.notApproved) {
      this.forApprove = true;
    }
    this.fetchDocs();
  }
};
</script>
