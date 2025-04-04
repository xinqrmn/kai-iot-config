<script setup>
import {ref, reactive} from 'vue';
import stringify from "json-stringify-pretty-compact";

const DATA_TYPES = ['INTEGER', 'GAUGE', 'COUNTER', 'TIMETICKS', 'IPADDRESS', 'OBJECTID', 'STRING'];

const config = reactive({
  generalOID: ".1.3.6.1.4.1.999",
  devices: [{
    deviceId: "3676ef20-e206-11ef-a67f-35241716acb1",
    deviceOID: "1.3.6.1.2.1.999",
    dateTime: {type: "INTEGER", OID: 0},
    voltageCoef: {type: "INTEGER", OID: 0},
    currentCoef: {type: "INTEGER", OID: 0},
    voltagePhaseA: {type: "INTEGER", OID: 0},
    voltagePhaseB: {type: "INTEGER", OID: 0},
    voltagePhaseC: {type: "INTEGER", OID: 0},
    currentPhaseA: {type: "INTEGER", OID: 0},
    currentPhaseB: {type: "INTEGER", OID: 0},
    currentPhaseC: {type: "INTEGER", OID: 0},
    totalActivePower: {type: "INTEGER", OID: 0},
    activePowerPhaseA: {type: "INTEGER", OID: 0},
    activePowerPhaseB: {type: "INTEGER", OID: 0},
    activePowerPhaseC: {type: "INTEGER", OID: 0},
    totalReactivePower: {type: "INTEGER", OID: 0},
    reactivePowerPhaseA: {type: "INTEGER", OID: 0},
    reactivePowerPhaseB: {type: "INTEGER", OID: 0},
    reactivePowerPhaseC: {type: "INTEGER", OID: 0},
    totalApparentPower: {type: "INTEGER", OID: 0},
    apparentPowerPhaseA: {type: "INTEGER", OID: 0},
    apparentPowerPhaseB: {type: "INTEGER", OID: 0},
    apparentPowerPhaseC: {type: "INTEGER", OID: 0},
    powerFactor: {type: "INTEGER", OID: 0},
    frequency: {type: "INTEGER", OID: 0},
    energyActive: {type: "INTEGER", OID: 0},
    energyReactive: {type: "INTEGER", OID: 0}
  }]
});

const deviceParams = Object.keys(config.devices[0]).filter(
    key => !['deviceId', 'deviceOID'].includes(key)
);

const activeDeviceIndex = ref(0);

const addDevice = () => {
  const newDevice = JSON.parse(JSON.stringify(config.devices[0]));
  newDevice.deviceId = '';
  newDevice.deviceOID = '';


  deviceParams.forEach((param) => {
    newDevice[param] = {...config.devices[0][param]};
    const paramIndex = deviceParams.indexOf(param);
    newDevice[param].OID = `${newDevice.deviceOID}.${paramIndex}`;
  })

  config.devices.push(newDevice);
  activeDeviceIndex.value = config.devices.length - 1;
};

const removeDevice = (index) => {
  if (config.devices.length <= 1) return;
  config.devices.splice(index, 1);

  if (activeDeviceIndex.value >= index) {
    activeDeviceIndex.value = Math.max(0, activeDeviceIndex.value - 1);
  }
};

const saveConfig = () => {
  try {
    const output = [
      {
        generalOID: config.generalOID
      },
      ...config.devices.map(device => {
        const deviceConfig = {
          deviceId: device.deviceId,
          deviceOID: device.deviceOID,
        }

        deviceParams.forEach((param) => {
          deviceConfig[param] = {...device[param]};
        })

        return deviceConfig;
      })
    ];

    const jsonString = stringify(output, {maxLength: 125})
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Save error:', error);
    alert('Ошибка при сохранении конфигурации');
  }
};
</script>

<template>
  <div class="config-app">
    <header class="app-header">
      <h1>Конфигуратор устройств энергомониторинга</h1>
      <div class="actions">
        <button @click="addDevice" class="btn primary">
          ➕ Добавить устройство
        </button>
        <button @click="saveConfig" class="btn success">
          💾 Сохранить конфиг
        </button>
      </div>
    </header>

    <div class="general-settings">
      <div class="form-group">
        <label>General OID:</label>
        <input v-model="config.generalOID" type="text">
      </div>
    </div>

    <div class="device-tabs">
      <div
          v-for="(device, index) in config.devices"
          :key="index"
          class="tab"
          :class="{ active: activeDeviceIndex === index }"
          @click="activeDeviceIndex = index"
      >
        Устройство {{ index + 1 }}
        <button
            v-if="config.devices.length > 1"
            @click.stop="removeDevice(index)"
            class="close-btn"
        >
          ×
        </button>
      </div>
    </div>

    <div class="device-form" v-if="config.devices.length > 0">
      <fieldset>
        <legend>Основные параметры устройства</legend>
        <div class="form-grid">
          <div class="form-group">
            <label>Device OID:</label>
            <input v-model="config.devices[activeDeviceIndex].deviceOID" type="text">
          </div>
          <div class="form-group">
            <label>Device ID:</label>
            <input v-model="config.devices[activeDeviceIndex].deviceId" type="text">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Параметры устройства</legend>
        <div class="form-grid">
          <div class="form-group" v-for="param in deviceParams">
            <label>{{ param }}:</label>
            <div class="param-control">
              <select v-model="config.devices[activeDeviceIndex][param].type">
                <option v-for="type in DATA_TYPES" :value="type">{{ type }}</option>
              </select>
              <input v-model="config.devices[activeDeviceIndex][param].OID" type="number">
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

.device-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.tab {
  padding: 8px 16px;
  background: var(--tab-bg);
  border-radius: 4px 4px 0 0;
  border: 1px solid transparent;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  color: var(--text-color);
}

.tab.active {
  background: var(--bg-color);
  border: 1px solid;
  border-color: var(--border-color);
  border-bottom-color: transparent;
}

.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #FF4444FF;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 23px;
  font-size: 10px;
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
  margin-bottom: 10px;
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
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 8px;
  align-items: center;
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