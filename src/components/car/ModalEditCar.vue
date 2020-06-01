<template>
  <v-dialog v-model="dialog" persistent max-width="600">
    <template v-slot:activator="{ on }">
      <v-btn v-if="!car" class="mx-2" fab v-on="on">
        <v-icon dark>mdi-plus</v-icon>
      </v-btn>
      <v-btn v-else icon v-on="on">
        <v-icon color="grey lighten-1">mdi-pencil</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Форма автомобиля</v-card-title>
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
        <v-btn text @click="onCancel" :disabled="localLoading">Отмена</v-btn>
        <v-btn
          text
          @click="onSave"
          :disabled="!valid || localLoading"
          :loading="localLoading"
          >Записать</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { slugify } from "transliteration";

export default {
  props: {
    car: Object,
  },
  data() {
    return {
      dialog: false,
      valid: false,
      name: "",
      slug: "",
      image: null,
      imageSrc: "",
      localLoading: false,
      nameRules: [(v) => !!v || "Имя должно быть заполнено!"],
      imageRules: [
        (value) =>
          !value ||
          value.size < 1000000 ||
          "Изображение должно быть менее 1 MB!",
      ],
    };
  },
  methods: {
    onChangeName(value) {
      this.slug = slugify(value);
    },
    onCancel() {
      this.dialog = false;
      this.name = "";
      this.slug = "";
    },
    onSave() {
      if (this.$refs.form.validate()) {
        this.localLoading = true;
        if (this.car) {
          // update car
          console.log("update car");
        } else {
          // create car
          this.$store
            .dispatch("createCar", {
              name: this.name,
              slug: this.slug,
              imgUrl: "https://picsum.photos/200/100?random",
            })
            .finally(() => {
              this.onCancel();
            });
        }
      }
    },
    onImageChange(value) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(value);
    },
  },
  created() {
    if (this.car) {
      this.name = this.car.name;
      this.slug = this.car.slug;
      this.imageSrc = this.car.imgUrl;
    }
  },
};
</script>
