// Device Types / Microcontrollers Data
// This file contains all supported microcontroller types for the S6S IoT Platform

export const DEVICE_TYPES = [
  // Espressif Systems
  { id: 'ESP32', name: 'ESP32', manufacturer: 'Espressif Systems' },
  { id: 'ESP32-S2', name: 'ESP32-S2', manufacturer: 'Espressif Systems' },
  { id: 'ESP32-S3', name: 'ESP32-S3', manufacturer: 'Espressif Systems' },
  { id: 'ESP32-C3', name: 'ESP32-C3', manufacturer: 'Espressif Systems' },
  { id: 'ESP32-C6', name: 'ESP32-C6', manufacturer: 'Espressif Systems' },
  { id: 'ESP32-H2', name: 'ESP32-H2', manufacturer: 'Espressif Systems' },
  { id: 'ESP8266', name: 'ESP8266', manufacturer: 'Espressif Systems' },
  
  // Arduino
  { id: 'arduino-uno-wifi', name: 'Arduino Uno WiFi', manufacturer: 'Arduino' },
  { id: 'arduino-nano-33-iot', name: 'Arduino Nano 33 IoT', manufacturer: 'Arduino' },
  { id: 'arduino-mkr-wifi-1010', name: 'Arduino MKR WiFi 1010', manufacturer: 'Arduino' },
  { id: 'arduino-mega-2560', name: 'Arduino Mega 2560', manufacturer: 'Arduino' },
  { id: 'arduino-due', name: 'Arduino Due', manufacturer: 'Arduino' },
  { id: 'arduino-nano-esp32', name: 'Arduino Nano ESP32', manufacturer: 'Arduino' },
  { id: 'arduino-portenta-h7', name: 'Arduino Portenta H7', manufacturer: 'Arduino' },
  
  // Raspberry Pi
  { id: 'raspberry-pi-pico', name: 'Raspberry Pi Pico', manufacturer: 'Raspberry Pi' },
  { id: 'raspberry-pi-pico-w', name: 'Raspberry Pi Pico W', manufacturer: 'Raspberry Pi' },
  
  // STMicroelectronics
  { id: 'stm32-f401re', name: 'STM32 F401RE', manufacturer: 'STMicroelectronics' },
  { id: 'stm32-l476rg', name: 'STM32 L476RG', manufacturer: 'STMicroelectronics' },
  { id: 'stm32-wb55', name: 'STM32WB55', manufacturer: 'STMicroelectronics' },
  
  // Nordic Semiconductor
  { id: 'nrf52840', name: 'nRF52840', manufacturer: 'Nordic Semiconductor' },
  { id: 'nrf52832', name: 'nRF52832', manufacturer: 'Nordic Semiconductor' },
  
  // Seeed Studio
  { id: 'seeed-xiao-esp32c3', name: 'Seeed XIAO ESP32C3', manufacturer: 'Seeed Studio' },
  { id: 'seeed-xiao-samd21', name: 'Seeed XIAO SAMD21', manufacturer: 'Seeed Studio' },
  { id: 'seeed-xiao-rp2040', name: 'Seeed XIAO RP2040', manufacturer: 'Seeed Studio' },
  { id: 'wio-terminal', name: 'Wio Terminal', manufacturer: 'Seeed Studio' },
  
  // M5Stack
  { id: 'm5stack-core2', name: 'M5Stack Core2', manufacturer: 'M5Stack' },
  { id: 'm5stick-c', name: 'M5Stick C', manufacturer: 'M5Stack' },
  
  // LilyGO
  { id: 'lilygo-t-display', name: 'LilyGO TTGO T-Display', manufacturer: 'LilyGO' },
  { id: 'lilygo-t-s3', name: 'LilyGO TTGO T-S3', manufacturer: 'LilyGO' },
  
  // DFRobot
  { id: 'dfrobot-firebeetle-esp32', name: 'DFRobot FireBeetle ESP32', manufacturer: 'DFRobot' },
  
  // Teensy
  { id: 'teensy-4.0', name: 'Teensy 4.0', manufacturer: 'PJRC' },
  { id: 'teensy-4.1', name: 'Teensy 4.1', manufacturer: 'PJRC' },
  
  // Particle
  { id: 'particle-argon', name: 'Particle Argon', manufacturer: 'Particle' },
  { id: 'particle-boron', name: 'Particle Boron', manufacturer: 'Particle' },
  
  // SparkFun
  { id: 'sparkfun-thing-plus-esp32', name: 'SparkFun Thing Plus ESP32', manufacturer: 'SparkFun' },
  
  // Adafruit
  { id: 'adafruit-feather-esp32', name: 'Adafruit Feather ESP32', manufacturer: 'Adafruit' },
  { id: 'adafruit-feather-huzzah', name: 'Adafruit Feather Huzzah', manufacturer: 'Adafruit' },
  
  // BBC
  { id: 'bbc-microbit-v2', name: 'BBC micro:bit V2', manufacturer: 'BBC' },
  
  // Texas Instruments
  { id: 'cc3220', name: 'CC3220', manufacturer: 'Texas Instruments' },
  { id: 'msp432', name: 'MSP432', manufacturer: 'Texas Instruments' },
  
  // Microchip
  { id: 'atmega4809', name: 'ATmega4809', manufacturer: 'Microchip' },
  { id: 'samd21', name: 'SAMD21', manufacturer: 'Microchip' },
  
  // Xiaomi
  { id: 'xiaomi-esp32-s3', name: 'Xiaomi ESP32-S3 Smart Clock', manufacturer: 'Xiaomi' },
];

export default DEVICE_TYPES;
