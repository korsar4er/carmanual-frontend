<template>
  <v-card>
    <div>
      <div v-if="!loading">
        <v-data-table
          :headers="headers"
          :items="cars"
          :items-per-page="10"
          :search="search"
          :sort-by="['name']"
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
              <v-toolbar-title>Автомобили</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-switch v-model="forApprove" label="Для утверждения" class="mt-5 mr-5"></v-switch>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Поиск"
                single-line
                hide-details
                class="mr-5"
              ></v-text-field>
              <v-btn dark @click="addCar">
                <v-icon>mdi-plus</v-icon>Добавить
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.approved="{ item }">
            <v-simple-checkbox v-model="item.approved" disabled></v-simple-checkbox>
          </template>
          <template v-slot:item.img_src="{ item }">
            <v-img :src="item.img_src" max-height="20" max-width="30" />
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon v-if="listType == 'allCars' || !item.approved" @click="editCar(item)">mdi-pencil</v-icon>
            <v-icon class="mx-2" @click="deleteCar(item)">mdi-delete</v-icon>
            <v-icon v-if="listType == 'allCars'" @click="approveCar(item)">mdi-check-circle</v-icon>
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
                          label="Модель"
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
                      <v-row>
                        <v-file-input
                          v-model="image"
                          :rules="imageRules"
                          accept="image/png, image/jpeg, image/gif"
                          prepend-icon="mdi-image"
                          label="Изображение автомобиля"
                          @change="onImageChange"
                        ></v-file-input>
                      </v-row>
                      <v-row justify="center">
                        <v-img
                          v-if="imageSrc"
                          :src="imageSrc"
                          alt="car image"
                          height="100"
                          max-width="150"
                        />
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
        { text: "Имя", value: "name", sortable: true },
        { text: "Идентификатор", value: "slug", sortable: true },
        { text: "Изображение", value: "img_src", sortable: false },
        { text: "Утвержден", value: "approved", sortable: false },
        { text: "Создал", value: "creator.name", sortable: false },
        { text: "Действия", value: "actions", sortable: false }
      ],
      search: "",
      forApprove: false,
      dialog: false,
      editedCar: null,
      name: "",
      slug: "",
      image: null,
      imageSrc: "",
      valid: false,
      localLoading: false,
      nameRules: [v => !!v || "Имя должно быть заполнено!"],
      imageRules: [
        value =>
          !value ||
          value.size < 1000000 ||
          "Изображение должно быть менее 1 MB!"
      ]
    };
  },
  computed: {
    cars() {
      return this.$store.getters[this.listType].filter(
        c => !this.forApprove || !c.approved
      );
    },
    loading() {
      return this.$store.getters.loading;
    },
    dialogTitle() {
      return this.editedCar
        ? "Редактирование автомобиля"
        : "Добавить автомобиль";
    }
  },
  methods: {
    editCar(car) {
      this.dialog = true;
      this.name = car.name;
      this.slug = car.slug;
      this.image = null;
      this.imageSrc = car.img_src;
      this.editedCar = car;
    },
    addCar() {
      this.dialog = true;
    },
    deleteCar(car) {
      this.$store
        .dispatch("confirmer/ask", `Удалить ${car.name}?`)
        .then(answer => {
          if (answer) {
            this.$store
              .dispatch("deleteCar", car.id)
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
      this.image = null;
      this.imageSrc = "";
      this.editedCar = null;
      this.localLoading = false;
    },
    onSave() {
      this.localLoading = true;
      const car = {
        name: this.name,
        slug: this.slug,
        image: this.image
      };
      let action = "createCar";
      if (this.editedCar) {
        car.id = this.editedCar.id;
        action = "updateCar";
      }
      this.$store
        .dispatch(action, car)
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
    onImageChange(value) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(value);
    },
    onChangeName(value) {
      this.slug = slugify(value);
    },
    approveCar(car) {
      this.$store
        .dispatch("confirmer/ask", `Утвердить ${car.name}?`)
        .then(answer => {
          if (answer) {
            this.$store
              .dispatch("approveCar", car.id)
              .then(() => {})
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
  mounted() {
    this.$store.dispatch("fetchCars");
    if (this.notApproved) {
      this.forApprove = true;
    }
  }
};
</script>
