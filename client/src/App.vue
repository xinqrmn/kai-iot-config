<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const devices = reactive({
  iot: {
    deviceName: '',
    temperature: '',
    humidity: ''
  },
  snmpConverter: {
    ipAddress: '',
    community: 'public',
    version: '2c'
  },
  snmpPublisher: {
    brokerUrl: '',
    topic: '',
    interval: 60
  }
});

const activeTab = ref('iot');
const config = reactive({ ...devices.iot });

const switchTab = (tab) => {
  activeTab.value = tab;
  Object.assign(config, devices[tab]);
};

const saveConfig = async () => {
  try {
    const response = await axios.post("http://localhost:3000/api/configs",
      config,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
    );
    console.log('Saved:', response.data);
    alert('Конфигурация успешно сохранена!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    alert('Ошибка сохранения: ' + (error.response?.data?.error || error.message));
  }
};
</script>

<template>
  <div class="container">
    <nav class="navigation">
      <button @click="switchTab('iot')">КАИ IoT</button>
      <button @click="switchTab('snmpConverter')">SNMP Конвертер</button>
      <button @click="switchTab('snmpPublisher')">Publish SNMP</button>
    </nav>

    <div v-if="activeTab === 'iot'" class="device-config">
      <h2>Конфигурация КАИ IoT</h2>
      <input v-model="config.deviceName" placeholder="Имя устройства">
      <input v-model="config.temperature" type="number" placeholder="Температура">
      <input v-model="config.humidity" type="number" placeholder="Влажность">
    </div>

    <div v-if="activeTab === 'snmpConverter'" class="device-config">
      <h2>Конфигурация SNMP Конвертера</h2>
      <input v-model="config.ipAddress" placeholder="IP Адрес">
      <input v-model="config.community" placeholder="Community">
      <select v-model="config.version">
        <option value="1">SNMP v1</option>
        <option value="2c">SNMP v2c</option>
        <option value="3">SNMP v3</option>
      </select>
    </div>

    <div v-if="activeTab === 'snmpPublisher'" class="device-config">
      <h2>Конфигурация SNMP Publisher</h2>
      <input v-model="config.brokerUrl" placeholder="Broker URL">
      <input v-model="config.topic" placeholder="Топик">
      <input v-model="config.interval" type="number" placeholder="Интервал (сек)">
    </div>

    <button @click="saveConfig" class="save-button">Сохранить конфигурацию</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.navigation button {
  padding: 10px 20px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}

.navigation button:hover {
  background-color: #ddd;
}

.device-config {
  margin-bottom: 20px;
}

.device-config input,
.device-config select {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}
</style>