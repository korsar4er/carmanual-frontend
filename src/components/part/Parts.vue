<template>
  <v-card>
    <div>
      <div v-if="!loading">
        <v-data-table
          :headers="headers"
          :items="parts"
          :items-per-page="10"
          :search="search"
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
              <v-toolbar-title>Разделы</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Поиск"
                single-line
                hide-details
                class="mr-5"
              ></v-text-field>
              <v-btn dark @click="addPart">
                <v-icon>mdi-plus</v-icon>Добавить
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon @click="editPart(item)">mdi-pencil</v-icon>
            <v-icon class="mx-2" @click="deletePart(item)">mdi-delete</v-icon>
          </template>

          <template v-slot:body.append>
            <v-dialog v-model="dialog" max-width="500px">
              <v-card outlined>
                <v-card-title>{{ dialogTitle }}</v-card-title>
                <v-form v-model="valid" ref="form" lazy-validation>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-text-field
                          label="Наименование"
                          name="name"
                          v-model="name"
                          type="text"
                          @change="onChangeName"
                          :rules="nameRules"
                        ></v-text-field>
                      </v-row>
                      <v-row>
                        <v-text-field
                          label="Идентификатор"
                          name="slug"
                          v-model="slug"
                          type="text"
                          disabled
                        ></v-text-field>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-form>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    @click="onSave"
                    :disabled="!valid || localLoading"
                    :loading="localLoading"
                  >Записать</v-btn>
                  <v-btn text @click="onCancel" :disabled="localLoading">Отмена</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-data-table>
      </div>
      <div v-else>
        <v-row justify="center" class="pt-5">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-row>
      </div>
    </div>
  </v-card>
</template>

<script>
import { slugify } from "transliteration";

export default {
  data() {
    return {
      headers: [
        { text: "Имя", value: "name", sortable: true },
        { text: "Идентификатор", value: "slug", sortable: true },
        { text: "Действия", value: "actions", sortable: false }
      ],
      search: "",
      dialog: false,
      editedPart: null,
      name: "",
      slug: "",
      valid: false,
      localLoading: false,
      nameRules: [v => !!v || "Имя должно быть заполнено!"]
    };
  },
  computed: {
    parts() {
      return this.$store.getters.parts;
    },
    loading() {
      return this.$store.getters.loading;
    },
    dialogTitle() {
      return this.editedPart ? "Редактирование раздела" : "Добавить раздел";
    }
  },
  methods: {
    editPart(part) {
      this.dialog = true;
      this.name = part.name;
      this.slug = part.slug;
      this.editedPart = part;
    },
    addPart() {
      this.dialog = true;
    },
    deletePart(part) {
      this.$store
        .dispatch("confirmer/ask", `Удалить ${part.name}?`)
        .then(answer => {
          if (answer) {
            this.$store
              .dispatch("deletePart", part.id)
              .then(() => {})
              .catch(() => {
                if (this.$store.getters.sessionIsOver) {
                  this.$router.push("/login");
                  this.$store.dispatch("setError", "Время сессии истекло");
                }
              });
          }
        });
    },
    onCancel() {
      this.dialog = false;
      this.name = "";
      this.slug = "";
      this.editedPart = null;
      this.localLoading = false;
    },
    onSave() {
      this.localLoading = true;
      const part = {
        name: this.name,
        slug: this.slug
      };
      let action = "createPart";
      if (this.editedPart) {
        part.id = this.editedPart.id;
        action = "updatePart";
      }
      this.$store
        .dispatch(action, part)
        .then(() => {
          this.onCancel();
        })
        .catch(() => {
          this.localLoading = false;
          if (this.$store.getters.sessionIsOver) {
            this.$router.push("/login");
            this.$store.dispatch("setError", "Время сессии истекло");
          }
        });
    },
    onChangeName(value) {
      this.slug = slugify(value);
    }
  },
  created() {
    this.$store.dispatch("fetchParts");
  },
  metaInfo: {
    title: "Разделы"
  }
};
</script>
