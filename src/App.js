import React, { Component } from 'react';
import './App.css';
import mqtt from 'mqtt';
//mqtt = require('mqtt');

var msgs=0;

const mqtt_client = mqtt.connect('wss://mqtt.hsl.fi');
mqtt_client.on('connect', function() {
    console.log('Connected');
//    mqtt_client.subscribe('/hfp/#');
    mqtt_client.subscribe('/hfp/journey/bus/1310/#');
});
mqtt_client.on('message', function(topic, message) {
    msgs++;
    if (msgs<1000) {
        console.log(topic, message.toString());
    }
});

class App extends Component {
  render() {
    return (
      <div className="App">

      </div>
    );
  }
}

export default App;
