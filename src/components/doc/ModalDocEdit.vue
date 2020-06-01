<template>
  <v-dialog v-model="dialog" persistent scrollable max-width="1000">
    <v-card class="mx-auto" light>
      <v-card-title>{{ title }} {{ name }}</v-card-title>
      <v-divider></v-divider>
      <v-row>
        <v-btn
          small
          text
          @click="showMainProperties = !showMainProperties"
          :outlined="!showMainProperties"
          class="mx-1"
        >
          <v-icon v-if="showMainProperties">mdi-minus</v-icon>
          <v-icon v-else>mdi-plus</v-icon>
          Наименование, автомобиль, раздел...
        </v-btn>
      </v-row>

      <v-form
        v-show="showMainProperties"
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-row class="mx-1 pt-3">
          <v-col cols="12" md="6" class="py-1">
            <v-text-field
              class="my-0 py-0"
              name="name"
              label="Наименование"
              v-model="name"
              type="text"
              :rules="[(v) => !!v || 'Имя не может пустым!']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="py-1">
            <v-text-field
              class="my-0 py-0"
              name="slug"
              label="Идентификатор"
              v-model="slug"
              type="text"
              :rules="[(v) => !!v || 'Идентификатор не может пустым!']"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row class="mx-1">
          <v-col cols="12" md="6" class="py-1">
            <v-select
              class="my-0 py-0"
              label="Автомобиль"
              v-model="carId"
              :items="carItems"
              :rules="[(v) => !!v || 'Автомобиль не может пустым!']"
            />
          </v-col>
          <v-col cols="12" md="6" class="py-1">
            <v-select
              class="my-0 py-0"
              label="Раздел"
              v-model="partId"
              :items="partItems"
              :rules="[(v) => !!v || 'Раздел не может пустым!']"
            />
          </v-col>
        </v-row>
      </v-form>

      <v-row v-if="doc" class="mx-1">
        <v-col class="py-1">
          <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
            <div>
              <v-btn-toggle multiple dense>
                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.bold() }"
                  @click="commands.bold"
                >
                  <v-icon>mdi-format-bold</v-icon>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.italic() }"
                  @click="commands.italic"
                >
                  <v-icon>mdi-format-italic</v-icon>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.strike() }"
                  @click="commands.strike"
                >
                  <v-icon>mdi-format-strikethrough</v-icon>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.underline() }"
                  @click="commands.underline"
                >
                  <v-icon>mdi-format-underline</v-icon>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                  @click="commands.heading({ level: 1 })"
                >
                  <b>H1</b>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                  @click="commands.heading({ level: 2 })"
                >
                  <b>H2</b>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                  @click="commands.heading({ level: 3 })"
                >
                  <b>H3</b>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.bullet_list() }"
                  @click="commands.bullet_list()"
                >
                  <v-icon>mdi-format-list-bulleted</v-icon>
                </v-btn>

                <v-btn
                  icon
                  class="mr-1"
                  :class="{ 'is-active': isActive.ordered_list() }"
                  @click="commands.ordered_list()"
                >
                  <v-icon>mdi-format-list-numbered</v-icon>
                </v-btn>

                <v-btn icon class="mr-1" @click="commands.horizontal_rule()">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>

                <v-btn text icon @click="loadImage()">
                  <v-icon>mdi-image</v-icon>
                </v-btn>
              </v-btn-toggle>
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept="image/*"
                @change="onFileChange"
              />
            </div>
          </editor-menu-bar>
        </v-col>
      </v-row>
      <v-card-text v-if="doc">
        <v-row class="mt-1 d-block">
          <v-card min-height="200" class="pa-1">
            <editor-content class="editor-box" :editor="editor" />
          </v-card>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text small @click="onSave">Записать</v-btn>
        <v-btn text small @click="onCancel">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { slugify } from "transliteration";
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import {
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Italic,
  Strike,
  Underline,
  Image,
} from "tiptap-extensions";

export default {
  components: {
    EditorContent,
    EditorMenuBar,
  },
  data() {
    return {
      valid: false,
      name: "",
      editor: null,
      editorHtml: "",
      carId: null,
      partId: null,
      showMainProperties: true,
    };
  },
  computed: {
    dialog() {
      return this.$store.getters["docs/editDialog"];
    },
    title() {
      return this.doc ? "Редактирование" : "Добавление";
    },
    slug() {
      return slugify(this.name);
    },
    carItems() {
      return this.$store.getters.cars.map((c) => ({
        text: c.name,
        value: c.id,
      }));
    },
    partItems() {
      return this.$store.getters.parts.map((p) => ({
        text: p.name,
        value: p.id,
      }));
    },
    doc() {
      return this.$store.getters["docs/doc"];
    },
  },
  methods: {
    onCancel() {
      this.$store.dispatch("docs/closeEditDialog");
    },
    onSave() {
      if (!this.$refs.form.validate()) {
        return;
      }
      const doc = {
        name: this.name,
        slug: this.slug,
        car_id: this.carId,
        part_id: this.partId,
      };
      if (this.doc) {
        doc.id = this.doc.id;
        doc.text = this.editorHtml;
      }
      this.$store
        .dispatch("docs/edit", { doc: doc, isCreate: !this.doc })
        .then(() => {
          this.$store.dispatch("docs/closeEditDialog");
          this.$emit("saveChanges");
        })
        .catch(() => {
          if (this.$store.getters.sessionIsOver) {
            this.$router.push("/login");
            this.$store.dispatch("setError", "Время сессии истекло");
          }
        });
    },
    loadImage() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const value = e.target.files[0];
      // console.log(value);
      this.$store
        .dispatch("uploadImage", {
          objectType: "doc",
          objectId: this.doc.id,
          image: value,
        })
        .then((url) =>
          this.editor.commands.image({
            src: "http://localhost:5000/static/upload" + url,
          })
        )
        .catch(() => {
          if (this.$store.getters.sessionIsOver) {
            this.$router.push("/login");
            this.$store.dispatch("setError", "Время сессии истекло");
          }
        });
      // const reader = new FileReader();
      // reader.onload = () => {
      //   this.editor.commands.image({
      //     src: reader.result,
      //   });
      // };
      // reader.readAsDataURL(value);
    },
    initEditor() {
      this.editor = new Editor({
        content: "",
        extensions: [
          new BulletList(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline(),
          new Image(),
        ],
        onUpdate: ({ getHTML }) => {
          this.editorHtml = getHTML();
        },
      });
    },
  },
  watch: {
    dialog(val) {
      if (val) {
        if (this.doc) {
          this.name = this.doc.name;
          this.carId = this.doc.car_id;
          this.partId = this.doc.part_id;
          this.editor.setContent(this.doc.text);
        } else {
          this.name = "";
          this.carId = null;
          this.partId = null;
          this.editor.setContent("");
          if (this.$refs.form) {
            this.$refs.form.resetValidation();
          }
        }
      }
    },
  },
  created() {
    this.initEditor();
  },
  mounted() {
    this.$store.dispatch("fetchCars");
    this.$store.dispatch("fetchParts");
  },
  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>

<style>
.editor-box > * {
  color: black;
  line-height: normal;
  font-size: initial;
}
.is-active {
  border-color: grey;
  border-style: solid;
  border-width: 1px;
}
*:focus {
  outline: none;
}
</style>
