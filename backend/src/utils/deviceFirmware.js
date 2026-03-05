/**
 * S6S IoT Platform - ESP32/ESP8266 Firmware Examples
 * 
 * This file contains example firmware code for ESP32 and ESP8266 devices
 * to connect to the S6S IoT platform via MQTT.
 */

// ============================================
// ESP32 FIRMWARE EXAMPLE (Arduino C++)
// ============================================

/*
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuration - Replace with your values
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_PASSWORD";

// MQTT Broker Configuration
const char* MQTT_SERVER = "your-s6s-server.com";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "DEV-XXXXXXXX";  // Device UUID from dashboard
const char* MQTT_PASSWORD = "device_mqtt_password";  // MQTT password from dashboard

// Device topics
#define MQTT_DEVICE_TOPIC "DEV-XXXXXXXX/sensors"
#define MQTT_STATUS_TOPIC "DEV-XXXXXXXX/status"

WiFiClient espClient;
PubSubClient client(espClient);

// Sensor pins
const int TEMP_SENSOR_PIN = 34;
const int HUMIDITY_SENSOR_PIN = 35;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  
  // Configure ADC
  analogReadResolution(12);
  
  // Setup MQTT
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqttCallback);
  
  // Connect to MQTT broker
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["timestamp"] = millis();
  
  // Serialize and publish
  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(MQTT_DEVICE_TOPIC, buffer);
  
  // Publish status
  client.publish(MQTT_STATUS_TOPIC, "{\"status\":\"online\"}");
  
  // Wait before next reading (adjust as needed)
  delay(60000);  // Send data every minute
}

float readTemperature() {
  // Example: Read from analog sensor
  // Replace with your actual sensor reading code
  int rawValue = analogRead(TEMP_SENSOR_PIN);
  float voltage = rawValue * (3.3 / 4095.0);
  float temperature = (voltage - 0.5) * 100;
  return temperature;
}

float readHumidity() {
  // Example: Read from analog sensor
  int rawValue = analogRead(HUMIDITY_SENSOR_PIN);
  float humidity = map(rawValue, 0, 4095, 0, 100);
  return humidity;
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Handle incoming messages if needed
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32_Client", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
      client.subscribe("DEV-XXXXXXXX/commands");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
*/

// ============================================
// ESP8266 FIRMWARE EXAMPLE (Arduino C++)
// ============================================

/*
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuration
const char* WIFI_SSID = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_PASSWORD";

const char* MQTT_SERVER = "your-s6s-server.com";
const int MQTT_PORT = 1883;
const char* MQTT_USERNAME = "DEV-XXXXXXXX";
const char* MQTT_PASSWORD = "device_mqtt_password";

#define MQTT_DEVICE_TOPIC "DEV-XXXXXXXX/sensors"
#define MQTT_STATUS_TOPIC "DEV-XXXXXXXX/status"

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  client.setServer(MQTT_SERVER, MQTT_PORT);
  reconnect();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors
  float temperature = readTemperature();
  float humidity = readHumidity();
  
  // Publish JSON
  char buffer[256];
  snprintf(buffer, sizeof(buffer), 
    "{\"temperature\":%.2f,\"humidity\":%.2f}",
    temperature, humidity);
  
  client.publish(MQTT_DEVICE_TOPIC, buffer);
  client.publish(MQTT_STATUS_TOPIC, "{\"status\":\"online\"}");
  
  delay(60000);
}

float readTemperature() {
  // Implement sensor reading
  return 25.0;
}

float readHumidity() {
  // Implement sensor reading
  return 60.0;
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP8266_Client", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}
*/

// ============================================
// MICROPYTHON FIRMWARE EXAMPLE (ESP32/ESP8266)
// ============================================

/*
# main.py - MicroPython firmware for S6S IoT Platform

import network
import ujson
from umqtt.simple import MQTTClient
import utime

# Configuration
WIFI_SSID = "Your_WiFi_SSID"
WIFI_PASSWORD = "Your_WiFi_PASSWORD"

MQTT_SERVER = "your-s6s-server.com"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "ESP32_XXXXXXXX"
MQTT_USER = "DEV-XXXXXXXX"
MQTT_PASSWORD = "device_mqtt_password"

DEVICE_TOPIC = b"DEV-XXXXXXXX/sensors"
STATUS_TOPIC = b"DEV-XXXXXXXX/status"

# WiFi connection
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            utime.sleep(0.5)
    print('WiFi connected:', wlan.ifconfig())

# MQTT callback
def mqtt_callback(topic, msg):
    print('Received:', topic, msg)

# Main function
def main():
    connect_wifi()
    
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_SERVER, MQTT_PORT, 
                        MQTT_USER, MQTT_PASSWORD)
    client.set_callback(mqtt_callback)
    client.connect()
    
    print('MQTT connected')
    
    while True:
        # Read sensors (implement your sensor reading)
        temperature = 25.0
        humidity = 60.0
        
        # Create payload
        payload = ujson.dumps({
            "temperature": temperature,
            "humidity": humidity
        })
        
        # Publish
        client.publish(DEVICE_TOPIC, payload)
        client.publish(STATUS_TOPIC, b'{"status":"online"}')
        
        utime.sleep(60)  # Wait 60 seconds

if __name__ == "__main__":
    main()
*/

// ============================================
// MQTT TOPIC STRUCTURE
// ============================================

/*
Topic Structure:
================

Publish (Device → Platform):
-----------------------------
{device_uuid}/sensors     - Sensor data (JSON)
{device_uuid}/status      - Device status (online/offline)
{device_uuid}/config      - Configuration response
{device_uuid}/telemetry   - Same as sensors (alias)

Subscribe (Platform → Device):
------------------------------
{device_uuid}/commands    - Commands from platform
{device_uuid}/config      - Configuration updates
{device_uuid}/ota         - OTA update commands

Message Formats:
================

Sensor Data (Publish):
----------------------
Single sensor:
{ "temperature": 25.5 }

Multiple sensors:
{ "temperature": 25.5, "humidity": 60.0, "pressure": 1013.25 }

With array format:
[
  { "identifier": "temperature", "value": 25.5 },
  { "identifier": "humidity", "value": 60.0 }
]

With timestamp:
{ "temperature": 25.5, "timestamp": "2024-01-15T10:30:00Z" }

Status (Publish):
------------------
{ "status": "online" }
{ "status": "offline" }
{ "status": "error", "message": "Sensor disconnected" }

Commands (Subscribe):
---------------------
{ "command": "restart" }
{ "command": "get_config" }
{ "command": "ota", "url": "http://..." }
{ "command": "set_interval", "value": 30000 }
*/

// Export topic utilities
export const getDeviceTopics = (deviceUuid) => ({
  sensors: `${deviceUuid}/sensors`,
  status: `${deviceUuid}/status`,
  config: `${deviceUuid}/config`,
  commands: `${deviceUuid}/commands`,
  telemetry: `${deviceUuid}/telemetry`,
});

export const parseSensorPayload = (payload) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return {
      sensors: data,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse sensor payload:', error);
    return null;
  }
};

export const createStatusPayload = (status, message = null) => {
  const payload = { status };
  if (message) payload.message = message;
  return JSON.stringify(payload);
};

export default {
  getDeviceTopics,
  parseSensorPayload,
  createStatusPayload,
};
