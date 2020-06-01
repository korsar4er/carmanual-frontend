<template>
  <v-card class="mx-auto" max-width="500" light>
    <v-toolbar flat>
      <v-toolbar-title>Форма регистрации</v-toolbar-title>
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
          label="E-mail"
          name="email"
          prepend-icon="mdi-at"
          type="email"
          v-model="email"
          :rules="emailRules"
        />

        <v-text-field
          id="password"
          label="Пароль"
          name="password"
          prepend-icon="mdi-lock"
          type="password"
          v-model="password"
          :rules="passwordRules"
        />

        <v-text-field
          id="confirmPassword"
          label="Подтверждение пароля"
          name="confirmPassword"
          prepend-icon="mdi-lock"
          type="password"
          v-model="confirmPassword"
          :rules="confirmPasswordRules"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        @click="onSubmit()"
        :disabled="!valid || loading"
        :loading="loading"
        >Создать учетную запись</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      login: "",
      email: "",
      password: "",
      confirmPassword: "",
      valid: false,
      loginRules: [
        (v) => !!v || "Необходимо ввести логин",
        (v) => (v && v.length > 4) || "Логин должен быть не короче 5 символов",
      ],
      emailRules: [
        (v) => !!v || "Необходимо ввести e-mail",
        (v) => /.+@.+\..+/.test(v) || "E-mail должен быть корректным",
      ],
      passwordRules: [
        (v) => !!v || "Необходимо ввести пароль",
        (v) => (v && v.length > 5) || "Пароль должен быть не короче 6 символов",
      ],
      confirmPasswordRules: [
        (v) => !!v || "Необходимо ввести подтверждение пароля",
        (v) =>
          v === this.password || "Подтверждение пароля не совпадает с паролем",
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
          email: this.email,
          password: this.password,
        };
        this.$store
          .dispatch("registerUser", cred)
          .then((res) => {
            if (res.confirmRequired) {
              alert("Требуется подтверждение email!");
            } else {
              alert("Учетная запись создана!");
              this.$router.push("/login");
            }
          })
          .catch(() => {});
      }
    },
  },
};
</script>
