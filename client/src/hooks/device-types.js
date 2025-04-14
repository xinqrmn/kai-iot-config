export const DEVICE_TYPES = {
    CONDITIONER: {
        name: 'Кондиционеры',
        params: [
            'airTemperature',
            'setpointAirTemperature',
            'supplyAirTemperature',
            'humidity',
            'setpointHumidity',
            'compressor1Status',
            'compressor2Status',
            'eev1Superheat',
            'eev2Superheat',
            'eev1ValveOpening',
            'eev2ValveOpening',
            'humidifierRunning',
            'fan1Running',
            'fan1Speed',
            'maintenanceDate',
            'OnOff',
        ]
    },
    DGU: {
        name: 'ДГУ',
        params: [
            'genVoltageL1N',
            'genVoltageL2N',
            'genVoltageL3N',
            'genVoltageL1L2',
            'genVoltageL2L3',
            'genVoltageL1L3',
            'genCurrentL1',
            'genCurrentL2',
            'genCurrentL3',
            'activePowerTotal',
            'reactivePowerTotal',
            'PF',
            'activePowerL1',
            'activePowerL2',
            'activePowerL3',
            'reactivePowerL1',
            'reactivePowerL2',
            'reactivePowerL3',
            'PFL1',
            'PFL2',
            'PFL3',
            'engineSpeed',
            'genFrequency',
            'batteryVoltage',
            'oilPressure',
            'coolantTemp',
            'fuelLevel',
            'gensetMode'
        ]
    },
    MIPS: {
        name: 'МИПС',
        params: [
            'voltageL1',
            'voltageL2',
            'voltageL3',
            'currentTotal',
            'currentL1',
            'currentL2',
            'currentL3',
            'fullPowerTotal',
            'fullPowerL1',
            'fullPowerL2',
            'fullPowerL3',
            'activePowerTotal',
            'activePowerL1',
            'activePowerL2',
            'activePowerL3',
            'reactivePowerTotal',
            'reactivePowerL1',
            'reactivePowerL2',
            'reactivePowerL3',
        ]
    },
    USDD: {
        name: 'УСДД',
        params: [
            'input1VoltageAvailable',
            'input2VoltageAvailable',
            'dguVoltageAvailable'
        ]
    },
    ALARMS: {
        name: 'Alarms',
        params: [
            'ackTs',
            'clearTs',
            'type',
            'startTs',
            'status'
        ]
    }
}