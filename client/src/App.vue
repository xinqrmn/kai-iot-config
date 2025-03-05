<script setup>
import axios from "axios";
import {reactive} from "vue";

const config = reactive({
  deviceName: 'test',
  temperature: '10',
  humidity: '89',
})

const saveConfig = async () => {
  try {
    const response = await axios.post("/api/configs", config);
    console.log('Saved: ', response.data);
  } catch (error) {
    console.error('Error: ', error.response.data);
  }
}

</script>

<template>
  <div class="container">
    <nav class="navigation">
      <a href="">КАИ Iot</a>
      <a href="">Прагма</a>
      <a href="">Сигма</a>
      <button type="submit" @click="saveConfig">Save</button>
    </nav>
  </div>
</template>

<style scoped>

</style>
