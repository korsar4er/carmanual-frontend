<template>
  <v-card class="mx-auto" max-width="500" light>
    <v-toolbar flat>
      <v-toolbar-title>Форма входа</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form v-model="valid" ref="form" lazy-validation>
        <v-text-field
          label="Логин"
          name="login"
          prepend-icon="mdi-account"
          type="text"
          v-model="login"
          :rules="loginRules"
        />

        <v-text-field
          id="password"
          label="Пароль"
          name="password"
          prepend-icon="mdi-lock"
          type="password"
          v-model="password"
          :rules="passwordRules"
          v-on:keyup.enter="onSubmit()"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn small text to="/Registration">Регистрация</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        @click="onSubmit()"
        :disabled="!valid || loading"
        :loading="loading"
        >Войти</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      login: "",
      password: "",
      valid: false,
      loginRules: [
        (v) => !!v || "Необходимо ввести логин",
        // v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      passwordRules: [
        (v) => !!v || "Необходимо ввести пароль",
        // v => (v && v.length > 5) || "Пароль должен быть не короче 6 символов"
      ],
    };
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
  },
  methods: {
    onSubmit() {
      if (this.$refs.form.validate()) {
        const cred = {
          name: this.login,
          password: this.password,
        };
        this.$store
          .dispatch("loginUser", cred)
          .then(() => {
            this.$router.push("/");
          })
          .catch(() => {});
      }
    },
  },
  created() {
    if (this.$route.query["loginError"]) {
      this.$store.dispatch("setError", "Необходимо залогиниться!");
    }
  },
};
</script>
