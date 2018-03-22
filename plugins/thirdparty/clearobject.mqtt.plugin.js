// # A Freeboard Plugin for MQTT based on Paho
// Thanks to IBM, Eclipse, and OASIS for making MQTT and Paho great
// Special thanks to Al Stockdill-Mander, IBM for original implementation: https://github.com/alsm/freeboard-mqtt/
// Fork by Benjamin Chodroff benjamin.chodroff@clearobject.com

(function() {
  // ### Datasource Definition
  // -------------------
  freeboard.loadDatasourcePlugin({
    "type_name": "mqtt",
    "display_name": "MQTT",
    "external_scripts": [
      "https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js"
    ],
    "settings": [{
        "name": "topic",
        "display_name": "Topic",
        "type": "text",
        "required": true,
      },
      {
        "name": "server",
        "display_name": "URL",
        "type": "text",
        "required": true,
      },
      {
        "name": "port",
        "display_name": "Port",
        "type": "number",
        "required": true,
        "default_value": 443
      },
      {
        "name": "client_id",
        "display_name": "Client Id",
        "type": "text",
        "required": true,
      },
      {
        "name": "json_data",
        "display_name": "JSON messages?",
        "type": "boolean",
        "default_value": true
      }
    ],
    newInstance: function(settings, newInstanceCallback, updateCallback) {
      newInstanceCallback(new mqttDatasourcePlugin(settings, updateCallback));
    }
  });


  // ### Datasource Implementation
  //
  // -------------------
  var mqttDatasourcePlugin = function(settings, updateCallback) {
    var self = this;
    var data = {};

    var currentSettings = settings;

    function onConnect() {
      console.log("Subscribing to topic: " + currentSettings.topic);
      client.subscribe(currentSettings.topic);
    };

    function onConnectionLost(responseObject) {
      console.log("Connection Lost");
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost: " + responseObject.errorMessage);
      var client = new Paho.MQTT.Client(currentSettings.server, currentSettings.port, 'a:' + currentSettings.client_id + ': ' + (new Date().getTime()).toString());
      client.connect({
        onSuccess: onConnect,
        userName: "",
        password: "",
        useSSL: true,
        timeout: 10,
        cleanSession: true,
        onFailure: function(message) {
          console.log("Connection failed: " + message.errorMessage);
        }
      });
    };

    function onMessageArrived(message) {
      var device = message.destinationName.split('/')[4];
      var msg = "";
      if (currentSettings.json_data) {
        msg = JSON.parse(message.payloadString);
      } else {
        msg = message.payloadString;
      }
      data[device] = msg;
      updateCallback(data);
    };

    // **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
    self.onSettingsChanged = function(newSettings) {
      try {
        client.disconnect();
      } catch (err) {
        console.log("Could not disconnect client: " + err);
      }

      data = {};
      currentSettings = newSettings;
      var client = new Paho.MQTT.Client(currentSettings.server, currentSettings.port, 'a:' + currentSettings.client_id + ': ' + (new Date().getTime()).toString());
      client.connect({
        onSuccess: onConnect,
        userName: "",
        password: "",
        useSSL: true,
        timeout: 10,
        cleanSession: true,
        onFailure: function(message) {
          console.log("Connection failed: " + message.errorMessage);
        }
      });
    }

    // **updateNow()** (required) : A public function we must implement that will be called when the user wants to manually refresh the datasource
    self.updateNow = function() {
      console.log("Forcing Update");
      try {
        client.disconnect();
      } catch (err) {
        console.log("Could not disconnect client: " + err);
      }
      var client = new Paho.MQTT.Client(currentSettings.server, currentSettings.port, 'a:' + currentSettings.client_id + ': ' + (new Date().getTime()).toString());
      client.connect({
        onSuccess: onConnect,
        userName: "",
        password: "",
        useSSL: true,
        timeout: 10,
        cleanSession: true,
        onFailure: function(message) {
          console.log("Connection failed: " + message.errorMessage);
        }
      });
    }

    // **onDispose()** (required) : A public function we must implement that will be called when this instance of this plugin is no longer needed. Do anything you need to cleanup after yourself here.
    self.onDispose = function() {
      if (client.isConnected()) {
        client.disconnect();
      }
      client = {};
    }

    console.log("Creating Paho client at timestamp=" + (new Date().getTime()).toString());
    var client = new Paho.MQTT.Client(currentSettings.server, currentSettings.port, 'a:' + currentSettings.client_id + ': ' + (new Date().getTime()).toString());
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({
      onSuccess: onConnect,
      userName: "",
      password: "",
      useSSL: true,
      timeout: 10,
      cleanSession: true,
      onFailure: function(message) {
        console.log("Connection failed: " + message.errorMessage);
      }
    });
  }
}());