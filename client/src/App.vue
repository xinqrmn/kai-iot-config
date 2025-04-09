<script setup>
import {ref, reactive, watch} from 'vue';
import stringify from "json-stringify-pretty-compact";
import {DEVICE_TYPES} from "./hooks/device-types.js";

const DATA_TYPES = ['INTEGER', 'GAUGE', 'COUNTER', 'TIMETICKS', 'IPADDRESS', 'OBJECTID', 'STRING'];

const config = reactive({
  generalOID: ".1.3.6.1.4.1.46667",
  devices: []
});

const activeDeviceIndex = ref(-1);
const newDeviceType = ref('CONDITIONER');
const deviceTypeMap = ref(new Map());

const generateParamOID = (device, paramIndex) => {
  return `${device.deviceOID}.${paramIndex + 1}`;
}

const updateParamsOIDs = (device) => {
  const index = config.devices.indexOf(device);
  const type = deviceTypeMap.value.get(index);

  DEVICE_TYPES[type]?.params?.forEach((param, i) => {
    if (!device[param].isCustom)
      device[param].OID = generateParamOID(device, i);
  })
}

watch(() => config.devices.map(device => device.deviceOID), () => {
  config.devices.forEach(device => updateParamsOIDs(device));
}, {deep: true});

const createDeviceTemplate = type => {
  const device = {
    deviceOID: `${config.generalOID}.${config.devices.length + 1}`,
    deviceID: '',
  }

  DEVICE_TYPES[type].params.forEach((param, i) => {
    device[param] = {
      type: 'INTEGER',
      OID: generateParamOID(device, i),
      isCustom: false,
    };
  })

  return device;
}


const addDevice = () => {
  const newDevice = createDeviceTemplate(newDeviceType.value)
  config.devices.push(newDevice)
  deviceTypeMap.value.set(config.devices.length - 1, newDeviceType.value)
  activeDeviceIndex.value = config.devices.length - 1;
};

const removeDevice = (index) => {
  if (config.devices.length <= 1) return;

  config.devices.splice(index, 1);
  const newMap = new Map([...deviceTypeMap.value].filter(([i]) => i !== index));

  deviceTypeMap.value = newMap;
  activeDeviceIndex.value = Math.min(index, config.devices.length - 1);
};

const saveConfig = () => {
  try {
    updateParamsOIDs()
    config.devices.forEach((device, index) => updateParamsOIDs(device, index))

    const output = [
      {generalOID: config.generalOID},
      ...config.devices.map((device, index) => ({
        deviceOID: device.deviceOID,
        deviceID: device.deviceID,
        ...Object.fromEntries(
            DEVICE_TYPES[deviceTypeMap.value.get(index)].params.map(param => [
                  param,
                  {
                    type: device[param].type,
                    OID: device[param].OID
                  }
                ]
            )
        )

      })),
    ]

    const jsonString = stringify(output, {maxLength: 125})
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ошибка сохранения:', error);
    alert('Ошибка при сохранении конфигурации');
  }
};

const getDeviceType = index => {
  return deviceTypeMap.value.get(index) || 'CONDITIONER';
}

const markAsCustom = (device, param) => {
  device[param].isCustom = true;
};
</script>

<template>
  <div class="config-app">
    <header class="app-header">
      <h1>Конфигуратор устройств энергомониторинга</h1>
      <div class="actions">
        <button @click="saveConfig" class="btn success">
          💾 Сохранить конфиг
        </button>
        <div class="device-types">
          <button @click="addDevice" class="btn primary"> ➕ Добавить устройство</button>
          <select v-model="newDeviceType">
            <option v-for="(type, key) in DEVICE_TYPES" :value="key" :key="key">
              {{ type.name }}
            </option>
          </select>
        </div>
      </div>
    </header>

    <div class="general-settings">
      <div class="form-group">
        <label>General OID:</label>
        <input v-model="config.generalOID" type="text">
      </div>
    </div>

    <div class="device-tabs-container">
      <div class="device-tabs-scroll">
        <div class="device-tabs">
          <div
              v-for="(_, index) in config.devices"
              :key="index"
              class="tab"
              :class="{ active: activeDeviceIndex === index }"
              @click="activeDeviceIndex = index"
          >
            <span class="tab-label"> Устройство {{ index + 1 }} ({{ DEVICE_TYPES[getDeviceType(index)].name }}) </span>
            <button
                v-if="config.devices.length > 1"
                @click.stop="removeDevice(index)"
                class="close-btn"
            >
              X
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="device-form" v-if="activeDeviceIndex !== -1">
      <fieldset>
        <legend>Основные параметры устройства</legend>
        <div class="form-grid">
          <div class="form-group">
            <label>Device ID:</label>
            <input v-model="config.devices[activeDeviceIndex].deviceID" type="text">
          </div>
          <div class="form-group">
            <label>Device OID:</label>
            <input
                v-model="config.devices[activeDeviceIndex].deviceOID"
                type="text"
            >
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Параметры устройства</legend>
        <div class="form-grid">
          <div
              class="form-group"
              v-for="param in DEVICE_TYPES[getDeviceType(activeDeviceIndex)].params"
              :key="param"
          >
            <label>{{ param }}:</label>
            <div class="param-control">
              <select v-model="config.devices[activeDeviceIndex][param].type">
                <option v-for="type in DATA_TYPES" :value="type">{{ type }}</option>
              </select>
              <input
                  v-model="config.devices[activeDeviceIndex][param].OID"
                  @input="markAsCustom(config.devices[activeDeviceIndex], param)"
              >
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bg-color: #ffffff;
  --text-color: #2c3e50;
  --border-color: #e0e0e0;
  --surface-color: #f8f9fa;
  --primary-color: #42b983;
  --secondary-color: #2196F3;
  --danger-color: #ff4444;
  --input-bg: #ffffff;
  --input-text: #495057;
  --tab-bg: #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --border-color: #404040;
    --surface-color: #2d2d2d;
    --primary-color: #2c7d59;
    --secondary-color: #1565c0;
    --danger-color: #c62828;
    --input-bg: #333333;
    --input-text: #f8f9fa;
    --tab-bg: #333333;
  }

  input, select {
    color-scheme: dark;
  }
}

.device-types {
  display: flex;
  gap: 10px;
}

.config-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
}

.app-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.app-header h1 {
  margin: 0;
  color: var(--text-color);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid;
  border-color: var(--border-color);
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: filter 0.2s;
  color: var(--text-color);

}

.device-tabs-container {
  position: relative;
  margin-bottom: 20px;
}

.device-tabs-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 2px;
}

.device-tabs {
  display: inline-flex;
  gap: 15px;
  min-width: 100%;
  margin-bottom: 20px;
}

.tab {
  position: relative;
  padding: 12px 30px;
  background: var(--tab-bg);
  border-radius: 4px 4px 0 0;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  color: var(--text-color);
  transition: background 0.2s;
}

.tab.active {
  background: var(--bg-color);
  border: 1px solid;
  border-color: var(--border-color);
  border-bottom-color: transparent;
}

.tab-label {
  display: block;
  text-overflow: ellipsis;
}

.device-tabs-scroll::-webkit-scrollbar {
  height: 6px;
}

.device-tabs-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background-color: firebrick;
  color: white;
  border: none;
  border-radius: 50%;
  width: 15px;
  height: 28px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.device-form {
  background: var(--surface-color);
  padding: 20px;
  border-radius: 4px;
  border: 1px solid;
  border-color: var(--border-color);
}

fieldset {
  border: 1px solid;
  border-color: var(--border-color);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

legend {
  padding: 0 10px;
  font-weight: bold;
  color: var(--text-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 8px;
  background-color: var(--input-bg);
  border: 1px solid;
  border-color: var(--border-color);
  border-radius: 4px;
  box-sizing: border-box;
  color: var(--input-text);
}

.param-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

select {
  padding: 6px;
  border: 1px solid;
  border-color: var(--border-color);
  border-radius: 4px;
  background: var(--input-bg);
  color: var(--input-text);
}

select option {
  color: black;
}

input[type="number"] {
  text-align: right;
}

::-webkit-scrollbar {
  width: 8px;
  background: var(--surface-color);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
</style>