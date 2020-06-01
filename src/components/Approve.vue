<template>
  <div>
    <Cars listType="allCars" notApproved />
    <v-divider />
    <Docs class="mt-3" listType="allDocs" notApproved />
  </div>
</template>

<script>
import Cars from "./car/Cars";
import Docs from "./doc/Docs";

export default {
  components: {
    Cars,
    Docs
  },
  metaInfo: {
    title: "Утверждение"
  }
};
</script>
