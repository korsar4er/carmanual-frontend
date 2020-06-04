<template>
  <v-app>
    <!-- <v-app-bar app dark src="./images/bar-background-62-2.jpg"> -->
    <v-app-bar app color="rgba(0,0,0,0.7)">
      <v-toolbar-title>
        <v-icon left>mdi-hammer-wrench</v-icon>
        <router-link to="/" tag="span" style="cursor: pointer">REPAIR PEUGEOT</router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn text small v-for="(link, i) in links" :key="i" :to="link.url">
          <v-icon left v-text="link.icon"></v-icon>
          {{ link.title }}
        </v-btn>

        <v-menu v-if="isAdmin" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text small v-on="on">
              Администрирование
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(link, i) in adminLinks" :key="i" :to="link.url">
              <v-icon left v-text="link.icon"></v-icon>
              <v-list-item-title v-text="link.title"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu v-if="isUserLoggedIn" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text small v-on="on">
              {{ userName }}
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(link, i) in userLinks" :key="i" :to="link.url">
              <v-icon left v-text="link.icon"></v-icon>
              <v-list-item-title v-text="link.title"></v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item to="/changepassword">
              <v-icon left>mdi-lock-reset</v-icon>
              <v-list-item-title>Изменить пароль</v-list-item-title>
            </v-list-item>

            <v-list-item @click="logout">
              <v-icon left>mdi-logout</v-icon>
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn v-if="!isUserLoggedIn" text small to="/login">
          <v-icon left>mdi-lock</v-icon>Войти
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-navigation-drawer app temporary right v-model="drawer">
      <v-card class="mx-auto" max-width="300" tile>
        <v-list>
          <v-list-item v-for="(link, i) in links" :key="i" :to="link.url">
            <v-icon left v-text="link.icon"></v-icon>
            <v-list-item-title v-text="link.title"></v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list v-if="isAdmin" subheader>
          <v-subheader>Администрирование</v-subheader>
          <v-list-item v-for="(link, i) in adminLinks" :key="i" :to="link.url">
            <v-icon left v-text="link.icon"></v-icon>
            <v-list-item-title v-text="link.title"></v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list v-if="isUserLoggedIn" subheader>
          <v-subheader>{{ userName }}</v-subheader>

          <v-list-item v-for="(link, i) in userLinks" :key="i" :to="link.url">
            <v-icon left v-text="link.icon"></v-icon>
            <v-list-item-title v-text="link.title"></v-list-item-title>
          </v-list-item>

          <v-list-item to="/changepassword">
            <v-icon left>mdi-lock-reset</v-icon>
            <v-list-item-title>Изменить пароль</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-icon left>mdi-logout</v-icon>
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-list v-if="!isUserLoggedIn">
          <v-list-item to="/login">
            <v-icon left>mdi-lock</v-icon>
            <v-list-item-title>Войти</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-navigation-drawer>

    <v-content>
      <v-container fluid id="conteiner">
        <router-view />
      </v-container>
    </v-content>

    <template>
      <Confirmer />
    </template>

    <v-footer padless color="rgba(0,0,0,0.7)">
      <v-row justify="center">
        {{ new Date().getFullYear() }} —
        <strong>It's for fun</strong>
      </v-row>
    </v-footer>

    <template v-if="error">
      <v-snackbar :multi-line="true" color="error" @input="closeError" :value="true" :timeout="0">
        {{ error }}
        <v-btn dark text @click="closeError">Закрыть</v-btn>
      </v-snackbar>
    </template>
  </v-app>
</template>

<script>
import Confirmer from "./components/shared/Confirmer.vue";

export default {
  name: "App",
  components: {
    Confirmer
  },
  data() {
    return {
      drawer: false,
      links: [{ title: "О сайте", icon: "mdi-information", url: "/about" }],
      adminLinks: [
        // { title: "Пользователи", icon: "mdi-account", url: "/users" },
        { title: "Автомобили", icon: "mdi-car", url: "/allcars" },
        { title: "Разделы", icon: "mdi-engine", url: "/parts" },
        { title: "Инструкции", icon: "mdi-text-box", url: "/alldocs" },
        { title: "Утверждение", icon: "mdi-check-circle", url: "/approve" }
      ],
      userLinks: [
        { title: "Мои автомобили", icon: "mdi-car", url: "/mycars" },
        { title: "Мои инструкции", icon: "mdi-text-box", url: "/mydocs" }
      ]
    };
  },
  computed: {
    isAdmin() {
      return (
        this.$store.getters.currentUser &&
        this.$store.getters.currentUser.isAdmin
      );
    },
    isUserLoggedIn() {
      return !!this.$store.getters.currentUser;
    },
    userName() {
      return this.$store.getters.currentUser
        ? this.$store.getters.currentUser.name
        : "";
    },
    error() {
      return this.$store.getters.error;
    }
  },
  methods: {
    logout() {
      this.$store
        .dispatch("logoutUser")
        .then(() => {
          if (this.$route.path !== "/") {
            this.$router.push("/");
          }
        })
        .catch(() => {});
    },
    closeError() {
      this.$store.dispatch("clearError");
    }
  },
  created() {
    // this.$store.dispatch("fetchCars");
    // this.$store.dispatch("fetchParts");
  },
  metaInfo: {
    title: "Инструкции по ремонту автомобилей",
    titleTemplate: "PSA fix | %s",
    meta: [
      // { "http-equiv": "Content-Type", content: "text/html; charset=utf-8" },
      // { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Инструкции по ремонту автомобиля. Описание как разобрать, заменить, установить части машины."
      }
    ]
  }
};
</script>

<style>
#app {
  /* background-image: url("../images/img1.jpg"); */
  background-image: url("./images/background_fhd.jpg");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
}
#conteiner {
  max-width: 1200px;
}
</style>
