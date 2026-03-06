/**
 * S6S IoT Platform - Microcontroller Support Utilities
 * 
 * This module provides comprehensive support for various microcontroller families,
 * including firmware generation, configuration, and compatibility checks.
 */

// ============================================
// MICROCONTROLLER FAMILIES DEFINITION
// ============================================

export const MICROCONTROLLER_FAMILIES = {
  // Espressif Systems
  ESP32: {
    name: 'ESP32',
    manufacturer: 'Espressif Systems',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'MicroPython'],
  },
  'ESP32-S2': {
    name: 'ESP32-S2',
    manufacturer: 'Espressif Systems',
    architecture: 'Xtensa LX7',
    cores: 1,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '320KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'MicroPython'],
  },
  'ESP32-S3': {
    name: 'ESP32-S3',
    manufacturer: 'Espressif Systems',
    architecture: 'Xtensa LX7',
    cores: 2,
    frequency: '240 MHz',
    flash: '8MB',
    ram: '512KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'MicroPython'],
  },
  'ESP32-C3': {
    name: 'ESP32-C3',
    manufacturer: 'Espressif Systems',
    architecture: 'RISC-V',
    cores: 1,
    frequency: '160 MHz',
    flash: '4MB',
    ram: '400KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'MicroPython'],
  },
  ESP8266: {
    name: 'ESP8266',
    manufacturer: 'Espressif Systems',
    architecture: 'Xtensa L106',
    cores: 1,
    frequency: '80 MHz',
    flash: '4MB',
    ram: '80KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  // Arduino
  'arduino-uno-wifi': {
    name: 'Arduino Uno WiFi',
    manufacturer: 'Arduino',
    architecture: 'AVR',
    cores: 1,
    frequency: '16 MHz',
    flash: '48KB',
    ram: '6KB',
    wifi: true,
    bluetooth: false,
    voltage: '5V',
    programmingLanguages: ['Arduino'],
  },
  'arduino-nano-33-iot': {
    name: 'Arduino Nano 33 IoT',
    manufacturer: 'Arduino',
    architecture: 'ARM Cortex-M0+',
    cores: 1,
    frequency: '48 MHz',
    flash: '256KB',
    ram: '32KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  'arduino-mkr-wifi-1010': {
    name: 'Arduino MKR WiFi 1010',
    manufacturer: 'Arduino',
    architecture: 'ARM Cortex-M0+',
    cores: 1,
    frequency: '48 MHz',
    flash: '256KB',
    ram: '32KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino'],
  },
  // Raspberry Pi
  'raspberry-pi-pico': {
    name: 'Raspberry Pi Pico',
    manufacturer: 'Raspberry Pi',
    architecture: 'ARM Cortex-M0+',
    cores: 2,
    frequency: '133 MHz',
    flash: '2MB',
    ram: '264KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'C/C++ SDK'],
  },
  'raspberry-pi-pico-w': {
    name: 'Raspberry Pi Pico W',
    manufacturer: 'Raspberry Pi',
    architecture: 'ARM Cortex-M0+',
    cores: 2,
    frequency: '133 MHz',
    flash: '2MB',
    ram: '264KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'C/C++ SDK'],
  },
  // STMicroelectronics (STM32)
  'stm32-f401re': {
    name: 'STM32 F401RE',
    manufacturer: 'STMicroelectronics',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '84 MHz',
    flash: '512KB',
    ram: '96KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'STM32CubeIDE', 'PlatformIO'],
  },
  'stm32-l476rg': {
    name: 'STM32 L476RG',
    manufacturer: 'STMicroelectronics',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '80 MHz',
    flash: '1MB',
    ram: '128KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'STM32CubeIDE', 'PlatformIO'],
  },
  'stm32-wb55': {
    name: 'STM32WB55',
    manufacturer: 'STMicroelectronics',
    architecture: 'ARM Cortex-M4',
    cores: 2,
    frequency: '64 MHz',
    flash: '512KB',
    ram: '256KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['STM32CubeIDE', 'PlatformIO'],
  },
  // Nordic Semiconductor
  nrf52840: {
    name: 'nRF52840',
    manufacturer: 'Nordic Semiconductor',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '64 MHz',
    flash: '1MB',
    ram: '256KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'nRF5 SDK', 'PlatformIO'],
  },
  nrf52832: {
    name: 'nRF52832',
    manufacturer: 'Nordic Semiconductor',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '64 MHz',
    flash: '512KB',
    ram: '64KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'nRF5 SDK', 'PlatformIO'],
  },
  // Texas Instruments
  cc3220: {
    name: 'CC3220',
    manufacturer: 'Texas Instruments',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '80 MHz',
    flash: '2MB',
    ram: '256KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['TI SDK', 'PlatformIO'],
  },
  msp432: {
    name: 'MSP432',
    manufacturer: 'Texas Instruments',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '48 MHz',
    flash: '256KB',
    ram: '64KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['TI SDK', 'Energia', 'PlatformIO'],
  },
  // Microchip
  atmega4809: {
    name: 'ATmega4809',
    manufacturer: 'Microchip',
    architecture: 'AVR',
    cores: 1,
    frequency: '20 MHz',
    flash: '48KB',
    ram: '6KB',
    wifi: false,
    bluetooth: false,
    voltage: '5V',
    programmingLanguages: ['Arduino', 'AVR-GCC'],
  },
  samd21: {
    name: 'SAMD21',
    manufacturer: 'Microchip',
    architecture: 'ARM Cortex-M0+',
    cores: 1,
    frequency: '48 MHz',
    flash: '256KB',
    ram: '32KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'Atmel Studio'],
  },
  // Seeed Studio
  'seeed-xiao-esp32c3': {
    name: 'Seeed Studio XIAO ESP32C3',
    manufacturer: 'Seeed Studio',
    architecture: 'RISC-V',
    cores: 1,
    frequency: '160 MHz',
    flash: '4MB',
    ram: '400KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  'seeed-xiao-samd21': {
    name: 'Seeed Studio XIAO SAMD21',
    manufacturer: 'Seeed Studio',
    architecture: 'ARM Cortex-M0+',
    cores: 1,
    frequency: '48 MHz',
    flash: '256KB',
    ram: '32KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino'],
  },
  'seeed-xiao-rp2040': {
    name: 'Seeed Studio XIAO RP2040',
    manufacturer: 'Seeed Studio',
    architecture: 'ARM Cortex-M0+',
    cores: 2,
    frequency: '133 MHz',
    flash: '2MB',
    ram: '264KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'CircuitPython'],
  },
  // M5Stack
  'm5stack-core2': {
    name: 'M5Stack Core2',
    manufacturer: 'M5Stack',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '8MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'UIFlow'],
  },
  'm5stick-c': {
    name: 'M5Stick C',
    manufacturer: 'M5Stack',
    architecture: 'Xtensa LX6',
    cores: 1,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '320KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'UIFlow'],
  },
  // LilyGO
  'lilygo-t-display': {
    name: 'LilyGO TTGO T-Display',
    manufacturer: 'LilyGO',
    architecture: 'Xtensa LX6',
    cores: 1,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '320KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  'lilygo-t-s3': {
    name: 'LilyGO TTGO T-S3',
    manufacturer: 'LilyGO',
    architecture: 'Xtensa LX7',
    cores: 2,
    frequency: '240 MHz',
    flash: '8MB',
    ram: '512KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  // DFRobot
  'dfrobot-firebeetle-esp32': {
    name: 'DFRobot FireBeetle ESP32',
    manufacturer: 'DFRobot',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino'],
  },
  // Teensy
  'teensy-4.0': {
    name: 'Teensy 4.0',
    manufacturer: 'PJRC',
    architecture: 'ARM Cortex-M7',
    cores: 1,
    frequency: '600 MHz',
    flash: '2MB',
    ram: '1024KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'Teensyduino'],
  },
  'teensy-4.1': {
    name: 'Teensy 4.1',
    manufacturer: 'Raspberry Pi',
    architecture: 'ARM Cortex-M7',
    cores: 1,
    frequency: '600 MHz',
    flash: '8MB',
    ram: '1024KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'Teensyduino'],
  },
  // Arduino Mega/Due
  'arduino-mega-2560': {
    name: 'Arduino Mega 2560',
    manufacturer: 'Arduino',
    architecture: 'AVR',
    cores: 1,
    frequency: '16 MHz',
    flash: '256KB',
    ram: '8KB',
    wifi: false,
    bluetooth: false,
    voltage: '5V',
    programmingLanguages: ['Arduino'],
  },
  'arduino-due': {
    name: 'Arduino Due',
    manufacturer: 'Arduino',
    architecture: 'ARM Cortex-M3',
    cores: 1,
    frequency: '84 MHz',
    flash: '512KB',
    ram: '96KB',
    wifi: false,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino'],
  },
  // Particle
  'particle-argon': {
    name: 'Particle Argon',
    manufacturer: 'Particle',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '64 MHz',
    flash: '256KB',
    ram: '64KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Particle', 'Arduino'],
  },
  'particle-boron': {
    name: 'Particle Boron',
    manufacturer: 'Particle',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '64 MHz',
    flash: '256KB',
    ram: '64KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Particle', 'Arduino'],
  },
  // SparkFun
  'sparkfun-thing-plus-esp32': {
    name: 'SparkFun Thing Plus ESP32',
    manufacturer: 'SparkFun',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  // Adafruit
  'adafruit-feather-esp32': {
    name: 'Adafruit Feather ESP32',
    manufacturer: 'Adafruit',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'CircuitPython'],
  },
  'adafruit-feather-huzzah': {
    name: 'Adafruit Feather Huzzah',
    manufacturer: 'Adafruit',
    architecture: 'Xtensa L106',
    cores: 1,
    frequency: '80 MHz',
    flash: '4MB',
    ram: '80KB',
    wifi: true,
    bluetooth: false,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'CircuitPython'],
  },
  // ESP32 variants
  'esp32-c6': {
    name: 'ESP32-C6',
    manufacturer: 'Espressif Systems',
    architecture: 'RISC-V',
    cores: 1,
    frequency: '160 MHz',
    flash: '4MB',
    ram: '400KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'MicroPython'],
  },
  'esp32-h2': {
    name: 'ESP32-H2',
    manufacturer: 'Espressif Systems',
    architecture: 'RISC-V',
    cores: 1,
    frequency: '96 MHz',
    flash: '4MB',
    ram: '320KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF', 'Zigbee'],
  },
  // Wio Terminal
  'wio-terminal': {
    name: 'Wio Terminal',
    manufacturer: 'Seeed Studio',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '120 MHz',
    flash: '4MB',
    ram: '192KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython'],
  },
  // BBC Microbit
  'bbc-microbit-v2': {
    name: 'BBC micro:bit V2',
    manufacturer: 'BBC',
    architecture: 'ARM Cortex-M4',
    cores: 1,
    frequency: '64 MHz',
    flash: '512KB',
    ram: '128KB',
    wifi: false,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'MakeCode'],
  },
  // Portenta
  'arduino-portenta-h7': {
    name: 'Arduino Portenta H7',
    manufacturer: 'Arduino',
    architecture: 'ARM Cortex-M7',
    cores: 2,
    frequency: '480 MHz',
    flash: '2MB',
    ram: '1024KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'Mbed OS'],
  },
  // Nano ESP32
  'arduino-nano-esp32': {
    name: 'Arduino Nano ESP32',
    manufacturer: 'Arduino',
    architecture: 'Xtensa LX6',
    cores: 2,
    frequency: '240 MHz',
    flash: '4MB',
    ram: '520KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'MicroPython', 'CircuitPython'],
  },
  // Xiaomi
  'xiaomi-esp32-s3': {
    name: 'Xiaomi ESP32-S3 Smart Clock',
    manufacturer: 'Xiaomi',
    architecture: 'Xtensa LX7',
    cores: 2,
    frequency: '240 MHz',
    flash: '8MB',
    ram: '512KB',
    wifi: true,
    bluetooth: true,
    voltage: '3.3V',
    programmingLanguages: ['Arduino', 'ESP-IDF'],
  },
};

// ============================================
// FIRMWARE TEMPLATES
// ============================================

const getESP32Firmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - ESP32 Firmware
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

// Topics
#define MQTT_SENSORS_TOPIC "${deviceUuid}/sensors"
#define MQTT_STATUS_TOPIC "${deviceUuid}/status"
#define MQTT_COMMANDS_TOPIC "${deviceUuid}/commands"

WiFiClient espClient;
PubSubClient client(espClient);

// Sensor pins - Customize for your setup
${sensors.map(s => `const int ${s.identifier.toUpperCase()}_PIN = ${s.pin || 34};`).join('\n')}

// Timing
unsigned long lastMsg = 0;
const unsigned long PUBLISH_INTERVAL = 60000; // 1 minute

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Configure ADC
  analogReadResolution(12);
  
  // Setup MQTT
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqttCallback);
  
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  unsigned long now = millis();
  if (now - lastMsg > PUBLISH_INTERVAL) {
    lastMsg = now;
    publishSensorData();
    publishStatus();
  }
}

void publishSensorData() {
  StaticJsonDocument<256> doc;
  
  // Read and publish sensor values
  ${sensors.map(s => `doc["${s.identifier}"] = read${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  doc["timestamp"] = millis();
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(MQTT_SENSORS_TOPIC, buffer);
  Serial.println(buffer);
}

void publishStatus() {
  StaticJsonDocument<64> doc;
  doc["status"] = "online";
  doc["rssi"] = WiFi.RSSI();
  
  char buffer[128];
  serializeJson(doc, buffer);
  client.publish(MQTT_STATUS_TOPIC, buffer);
}

// Sensor reading functions - Implement based on your sensors
${sensors.map(s => `
float read${s.name.replace(/\s/g, '')}() {
  // TODO: Implement sensor reading for ${s.name}
  // Example for analog sensor:
  // int rawValue = analogRead(${s.identifier.toUpperCase()}_PIN);
  // return rawValue * (3.3 / 4095.0);
  return 0.0;
}`).join('\n')}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
  // Handle commands
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  if (!error) {
    const char* command = doc["command"];
    if (command) {
      if (strcmp(command, "restart") == 0) {
        ESP.restart();
      }
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      client.subscribe(MQTT_COMMANDS_TOPIC);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
`;
};

const getESP8266Firmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - ESP8266 Firmware
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

#define MQTT_SENSORS_TOPIC "${deviceUuid}/sensors"
#define MQTT_STATUS_TOPIC "${deviceUuid}/status"
#define MQTT_COMMANDS_TOPIC "${deviceUuid}/commands"

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define PUBLISH_INTERVAL 60000

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
  
  client.setServer(MQTT_SERVER, MQTT_PORT);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  unsigned long now = millis();
  if (now - lastMsg > PUBLISH_INTERVAL) {
    lastMsg = now;
    publishData();
  }
}

void publishData() {
  StaticJsonDocument<256> doc;
  ${sensors.map(s => `doc["${s.identifier}"] = read${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(MQTT_SENSORS_TOPIC, buffer);
  
  doc.clear();
  doc["status"] = "online";
  doc["rssi"] = WiFi.RSSI();
  serializeJson(doc, buffer);
  client.publish(MQTT_STATUS_TOPIC, buffer);
}

${sensors.map(s => `
float read${s.name.replace(/\s/g, '')}() {
  // TODO: Implement sensor reading
  return 0.0;
}`).join('\n')}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message: ");
  for (int i = 0; i < length; i++) Serial.print((char)payload[i]);
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP8266_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      client.subscribe(MQTT_COMMANDS_TOPIC);
    } else {
      delay(5000);
    }
  }
}
`;
};

const getMicroPythonFirmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
# S6S IoT Platform - MicroPython Firmware
# Device UUID: ${deviceUuid}
# Generated: ${new Date().toISOString()}

import network
import ujson
from umqtt.simple import MQTTClient
import utime

# Configuration
WIFI_SSID = "Your_WiFi_SSID"
WIFI_PASSWORD = "Your_WiFi_Password"

MQTT_SERVER = "${mqttServer}"
MQTT_PORT = 1880
MQTT_CLIENT_ID = "${deviceUuid}"
MQTT_USER = "${mqttUsername}"
MQTT_PASSWORD = "${mqttPassword}"

SENSORS_TOPIC = b"${deviceUuid}/sensors"
STATUS_TOPIC = b"${deviceUuid}/status"
COMMANDS_TOPIC = b"${deviceUuid}/commands"

# WiFi connection
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            utime.sleep(0.5)
    print('WiFi connected:', wlan.ifconfig())

# Sensor reading functions
${sensors.map(s => `def read_${s.identifier}():
    # TODO: Implement sensor reading for ${s.name}
    return 0.0`).join('\n\n')}

# MQTT callback
def mqtt_callback(topic, msg):
    print('Received:', topic, msg)
    # Handle commands here

def main():
    connect_wifi()
    
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_SERVER, MQTT_PORT, 
                        MQTT_USER, MQTT_PASSWORD)
    client.set_callback(mqtt_callback)
    client.connect()
    
    print('MQTT connected')
    client.subscribe(COMMANDS_TOPIC)
    
    while True:
        # Read sensors
        sensor_data = {
            ${sensors.map(s => `"${s.identifier}": read_${s.identifier}()`).join(',\n            ')}
        }
        
        # Publish sensor data
        client.publish(SENSORS_TOPIC, ujson.dumps(sensor_data))
        
        # Publish status
        client.publish(STATUS_TOPIC, b'{"status": "online"}')
        
        utime.sleep(60)  # Publish every 60 seconds

if __name__ == "__main__":
    main()
`;
};

const getArduinoFirmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - Arduino Firmware
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT
const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

#define SENSORS_TOPIC "${deviceUuid}/sensors"
#define STATUS_TOPIC "${deviceUuid}/status"
#define COMMANDS_TOPIC "${deviceUuid}/commands"

WiFiClient wifiClient;
PubSubClient client(wifiClient);

unsigned long lastPublish = 0;
const unsigned long INTERVAL = 60000;

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
  
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  if (millis() - lastPublish > INTERVAL) {
    lastPublish = millis();
    publishData();
  }
}

void publishData() {
  StaticJsonDocument<256> doc;
  ${sensors.map(s => `doc["${s.identifier}"] = readSensor${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(SENSORS_TOPIC, buffer);
  
  doc.clear();
  doc["status"] = "online";
  serializeJson(doc, buffer);
  client.publish(STATUS_TOPIC, buffer);
}

${sensors.map(s => `float readSensor${s.name.replace(/\s/g, '')}() {
  // TODO: Implement for ${s.name}
  return 0.0;
}`).join('\n\n')}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message: ");
  for (int i = 0; i < length; i++) Serial.print((char)payload[i]);
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting...");
    if (client.connect("Arduino_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      client.subscribe(COMMANDS_TOPIC);
    } else {
      delay(5000);
    }
  }
}
`;
};

const getRaspberryPiPicoFirmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - Raspberry Pi Pico Firmware (Arduino)
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT
const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

#define SENSORS_TOPIC "${deviceUuid}/sensors"
#define STATUS_TOPIC "${deviceUuid}/status"
#define COMMANDS_TOPIC "${deviceUuid}/commands"

WiFiClient wifiClient;
PubSubClient client(wifiClient);

unsigned long lastPublish = 0;
const unsigned long INTERVAL = 60000;

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println("WiFi connected");
  
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  if (millis() - lastPublish > INTERVAL) {
    lastPublish = millis();
    publishData();
  }
}

void publishData() {
  StaticJsonDocument<256> doc;
  ${sensors.map(s => `doc["${s.identifier}"] = readSensor${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(SENSORS_TOPIC, buffer);
}

${sensors.map(s => `float readSensor${s.name.replace(/\s/g, '')}() {
  // TODO: Implement for ${s.name}
  return 0.0;
}`).join('\n\n')}

void callback(char* topic, byte* payload, unsigned int length) {}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("Pico_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      client.subscribe(COMMANDS_TOPIC);
    } else {
      delay(5000);
    }
  }
}
`;
};

const getSTM32Firmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - STM32 Firmware
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 * 
 * Note: STM32 requires additional WiFi module (ESP8266/ESP32) or Ethernet shield
 */

#include <Arduino.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// MQTT Configuration (via external WiFi module)
const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

#define SENSORS_TOPIC "${deviceUuid}/sensors"
#define STATUS_TOPIC "${deviceUuid}/status"

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastPublish = 0;
const unsigned long INTERVAL = 60000;

void setup() {
  Serial.begin(115200);
  
  // Note: Add WiFi initialization for external WiFi module
  // WiFi.init(&Serial1); // Example for ESP8266 AT commands
  
  client.setServer(MQTT_SERVER, MQTT_PORT);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  if (millis() - lastPublish > INTERVAL) {
    lastPublish = millis();
    publishData();
  }
}

void publishData() {
  StaticJsonDocument<256> doc;
  ${sensors.map(s => `doc["${s.identifier}"] = readSensor${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(SENSORS_TOPIC, buffer);
}

${sensors.map(s => `float readSensor${s.name.replace(/\s/g, '')}() {
  // TODO: Implement for ${s.name}
  return 0.0;
}`).join('\n\n')}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("STM32_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}
`;
};

const getNRF52Firmware = (config) => {
  const { deviceUuid, mqttUsername, mqttPassword, mqttServer, sensors } = config;
  return `
/**
 * S6S IoT Platform - nRF52 Firmware
 * Device UUID: ${deviceUuid}
 * Generated: ${new Date().toISOString()}
 * 
 * Note: nRF52 uses BLE, requires external WiFi for MQTT
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// MQTT via external WiFi module
const char* MQTT_SERVER = "${mqttServer}";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "${mqttUsername}";
const char* MQTT_PASSWORD = "${mqttPassword}";

#define SENSORS_TOPIC "${deviceUuid}/sensors"
#define STATUS_TOPIC "${deviceUuid}/status"

WiFiClient wifiClient;
PubSubClient client(wifiClient);

unsigned long lastPublish = 0;
const unsigned long INTERVAL = 60000;

void setup() {
  Serial.begin(115200);
  
  // Initialize BLE (if needed for local communication)
  // BLE setup code here...
  
  // Initialize WiFi and MQTT
  client.setServer(MQTT_SERVER, MQTT_PORT);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  if (millis() - lastPublish > INTERVAL) {
    lastPublish = millis();
    publishData();
  }
}

void publishData() {
  StaticJsonDocument<256> doc;
  ${sensors.map(s => `doc["${s.identifier}"] = readSensor${s.name.replace(/\s/g, '')}();`).join('\n  ')}
  
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(SENSORS_TOPIC, buffer);
}

${sensors.map(s => `float readSensor${s.name.replace(/\s/g, '')}() {
  // TODO: Implement for ${s.name}
  return 0.0;
}`).join('\n\n')}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("NRF52_${deviceUuid}", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}
`;
};

// ============================================
// FIRMWARE GENERATOR FUNCTION
// ============================================

export const generateFirmware = (microcontrollerType, config) => {
  const mc = MICROCONTROLLER_FAMILIES[microcontrollerType];
  if (!mc) {
    throw new Error(`Unsupported microcontroller type: ${microcontrollerType}`);
  }

  // Map microcontroller families to firmware generators
  const firmwareGenerators = {
    'ESP32': getESP32Firmware,
    'ESP32-S2': getESP32Firmware,
    'ESP32-S3': getESP32Firmware,
    'ESP32-C3': getESP32Firmware,
    'ESP8266': getESP8266Firmware,
    'arduino-uno-wifi': getArduinoFirmware,
    'arduino-nano-33-iot': getArduinoFirmware,
    'arduino-mkr-wifi-1010': getArduinoFirmware,
    'raspberry-pi-pico': getRaspberryPiPicoFirmware,
    'raspberry-pi-pico-w': getRaspberryPiPicoFirmware,
    'stm32-f401re': getSTM32Firmware,
    'stm32-l476rg': getSTM32Firmware,
    'stm32-wb55': getSTM32Firmware,
    'nrf52840': getNRF52Firmware,
    'nrf52832': getNRF52Firmware,
    'cc3220': getArduinoFirmware,
    'msp432': getArduinoFirmware,
    'atmega4809': getArduinoFirmware,
    'samd21': getArduinoFirmware,
  };

  const generator = firmwareGenerators[microcontrollerType];
  if (!generator) {
    // Default to Arduino-style firmware
    return getArduinoFirmware(config);
  }

  return generator(config);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getMicrocontrollerInfo = (type) => {
  return MICROCONTROLLER_FAMILIES[type] || null;
};

export const getAllMicrocontrollers = () => {
  return Object.entries(MICROCONTROLLER_FAMILIES).map(([slug, info]) => ({
    slug,
    ...info,
  }));
};

export const getMicrocontrollersByManufacturer = () => {
  const manufacturers = {};
  for (const [slug, info] of Object.entries(MICROCONTROLLER_FAMILIES)) {
    if (!manufacturers[info.manufacturer]) {
      manufacturers[info.manufacturer] = [];
    }
    manufacturers[info.manufacturer].push({ slug, ...info });
  }
  return manufacturers;
};

export const getMicrocontrollersWithWiFi = () => {
  return Object.entries(MICROCONTROLLER_FAMILIES)
    .filter(([, info]) => info.wifi)
    .map(([slug, info]) => ({ slug, ...info }));
};

export const getMicrocontrollersWithBluetooth = () => {
  return Object.entries(MICROCONTROLLER_FAMILIES)
    .filter(([, info]) => info.bluetooth)
    .map(([slug, info]) => ({ slug, ...info }));
};

export const checkMicrocontrollerCompatibility = (type, features) => {
  const mc = MICROCONTROLLER_FAMILIES[type];
  if (!mc) {
    return { compatible: false, reasons: ['Unknown microcontroller type'] };
  }

  const reasons = [];
  
  if (features.requiresWiFi && !mc.wifi) {
    reasons.push(`${mc.name} does not have built-in WiFi`);
  }
  
  if (features.requiresBluetooth && !mc.bluetooth) {
    reasons.push(`${mc.name} does not have built-in Bluetooth`);
  }

  return {
    compatible: reasons.length === 0,
    reasons,
  };
};

export const getProgrammingGuide = (type) => {
  const mc = MICROCONTROLLER_FAMILIES[type];
  if (!mc) return null;

  const guides = {
    'ESP32': {
      arduino: 'https://docs.espressif.com/projects/arduino-esp32/',
      espIdf: 'https://docs.espressif.com/projects/esp-idf/',
      micropython: 'https://docs.micropython.org/en/latest/esp32/',
    },
    'ESP8266': {
      arduino: 'https://arduino-esp8266.readthedocs.io/',
      micropython: 'https://docs.micropython.org/en/latest/esp8266/',
    },
    'raspberry-pi-pico': {
      arduino: 'https://arduino-pico.readthedocs.io/',
      micropython: 'https://docs.micropython.org/en/latest/rp2/',
      sdk: 'https://raspberry-pi-pico.readthedocs.io/',
    },
  };

  return guides[type] || null;
};

export default {
  MICROCONTROLLER_FAMILIES,
  generateFirmware,
  getMicrocontrollerInfo,
  getAllMicrocontrollers,
  getMicrocontrollersByManufacturer,
  getMicrocontrollersWithWiFi,
  getMicrocontrollersWithBluetooth,
  checkMicrocontrollerCompatibility,
  getProgrammingGuide,
};
