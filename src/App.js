import React, {Component} from 'react';
import './App.css';
import mqtt from 'mqtt';
import {withGoogleMap, GoogleMap, Marker} from 'react-google-maps'
import withScriptjs from 'react-google-maps/lib/async/withScriptjs';
import _ from 'underscore';
//mqtt = require('mqtt');

const AsyncGettingStartedExampleGoogleMap = withScriptjs(
  withGoogleMap(
    props => (
      <GoogleMap
        ref={props.onMapLoad}
        defaultZoom={12}
        defaultCenter={{ lat: 60.205294, lng: 24.936092 }}
        onClick={props.onMapClick}
      >
        {props.markers.map(marker => (
          <Marker
            {...marker}
            onRightClick={() => props.onMarkerRightClick(marker)}
          />
        ))}
      </GoogleMap>
    )
  )
);

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: {VP:{dir:""}},
      markers: []
    };
  }

  componentDidMount() {
    const mqtt_client = mqtt.connect('wss://mqtt.hsl.fi');

    mqtt_client.on('connect', function() {
        console.log('Connected');
    //    mqtt_client.subscribe('/hfp/#');
        mqtt_client.subscribe('/hfp/journey/bus/+/2550/#');
    });

    mqtt_client.on('message', function(topic, message) {
      let data = JSON.parse(message);
      this.setState({
        data
      });

      let newelement = {
        position: {
          lat: data.VP.lat,
          lng: data.VP.long,
        },
        key: Math.random(),
        defaultAnimation: 2,
      }
      this.setState({
        markers: this.state.markers.concat([newelement])
      })
    }.bind(this))
  }

  render() {
  console.log(this.state.markers);
    return (
      <div className="App">
        <h2>{this.state.markers.position}</h2>
        <h2>{this.state.data.VP.lat}</h2>
        <h2>{this.state.data.VP.long}</h2>
        <AsyncGettingStartedExampleGoogleMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDLkAy0RqEDrEcMNk0Ihe5MR_V8kX3dFqU&v=3.exp"
          loadingElement={
            <div style={{ height: `500px` }}>
              loading
            </div>
          }
          containerElement={
            <div style={{ height: `500px` }} />
          }
          mapElement={
            <div style={{ height: `500px` }} />
          }
          onMapLoad={_.noop}
          onMapClick={_.noop}
          onMarkerRightClick={_.noop}
          markers={this.state.markers}
        />
      </div>
    );
  }
}

export default App;
