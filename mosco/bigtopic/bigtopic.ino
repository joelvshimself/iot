#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <MAX30105.h>
#include <heartRate.h>
#include <spo2_algorithm.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <TinyGPSPlus.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Configuración WiFi
const char* ssid = "Totalplay-CEA1";
const char* password = "CEA16BF74EjV44UN";

// Configuración MQTT
const char* mqttServer = "192.168.100.226";
const int mqttPort = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Pines y configuraciones de sensores
#define ONE_WIRE_BUS D5
const int uvSensorPin = A0;
int RXPin = 13;
int TXPin = 15;
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET    -1

OneWire oneWire(ONE_WIRE_BUS);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
SoftwareSerial neogps(RXPin, TXPin);
DallasTemperature sensors(&oneWire);
TinyGPSPlus gps;
MAX30105 particleSensor;

uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t spo2 = 0; 
int8_t validSPO2 = 0;
int32_t heartRate = 0;
int8_t validHeartRate = 0;

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");
  Serial.println("Dirección IP: ");
  Serial.println(WiFi.localIP());
  client.setServer(mqttServer, mqttPort);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    if (client.connect("ESP8266Client")) {
      Serial.println("conectado");
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" intentar de nuevo en 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  sensors.begin();
  pinMode(uvSensorPin, INPUT);
  neogps.begin(9600);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 no encontrado. Por favor, verifica el cableado.");
    while (1);
  }
  particleSensor.setup(0x1F, 4, 2, 200, 411, 4096);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("No se pudo iniciar la pantalla OLED"));
    while(1);
  }
  display.display();
  display.clearDisplay();
  delay(2000);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  sensors.requestTemperatures(); 
  int sensorValue = analogRead(uvSensorPin);

  int i = 0;
  while (i < 100) {
    long redValue, irValue;
    while (particleSensor.available() == false) particleSensor.check();
    redValue = particleSensor.getRed();
    irValue = particleSensor.getIR();
    if (irValue > 0 && redValue > 0) {
      irBuffer[i] = irValue;
      redBuffer[i] = redValue;
      i++;
    }
    particleSensor.nextSample();
  }

  maxim_heart_rate_and_oxygen_saturation(irBuffer, 100, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

  boolean newData = false;
  for (unsigned long start = millis(); millis() - start < 1000;) {
    while (neogps.available()) {
      if (gps.encode(neogps.read())) {
        newData = true;
      }
    }
  }

  // Mostrar datos en el monitor serial y en la pantalla OLED
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);

  if (validSPO2 && validHeartRate) {
    Serial.print("Frecuencia Cardíaca: ");
    Serial.print(heartRate);
    Serial.print(" lpm, Saturación de Oxígeno: ");
    Serial.print(spo2);
    Serial.println(" %");

    display.print("HR: ");
    display.print(heartRate);
    display.print(" lpm, SpO2: ");
    display.print(spo2);
    display.println("%");
  } else {
    Serial.println("Lectura no válida");
    display.println("Lectura no válida");
  }

  Serial.print("Temperatura: ");
  Serial.print(sensors.getTempCByIndex(0));
  Serial.println(" C");
  display.print("Temp: ");
  display.print(sensors.getTempCByIndex(0));
  display.println(" C");

  Serial.print("IRV: ");
  Serial.println(sensorValue);
  display.print("IRV: ");
  display.print(sensorValue);  
  display.println(" nm");

  if (newData) {
    Serial.print("Lat: ");
    Serial.println(gps.location.lat(), 10);
    Serial.print("Lng: ");
    Serial.println(gps.location.lng(), 10);
  }

  display.display();

  // Enviar datos a MQTT
  StaticJsonDocument<256> doc;
  doc["heartRate"] = heartRate;
  doc["spo2"] = spo2;
  doc["lat"] = gps.location.lat();
  doc["lng"] = gps.location.lng();
  doc["temp"] = sensors.getTempCByIndex(0);
  doc["uv"] = sensorValue;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish("bigtopic", buffer);
}