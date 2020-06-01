<template>
  <v-card>
    <v-card-title>Доступ запрещен!</v-card-title>
    <v-card-subtitle>Ошибка 403</v-card-subtitle>
    <v-card-actions>
      <v-btn @click="onBack()">Назад</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  methods: {
    onBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style>
</style>