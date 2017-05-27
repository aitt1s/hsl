import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import mqtt from 'mqtt';
import update from 'immutability-helper';
import {withGoogleMap, GoogleMap, Marker, Polyline} from 'react-google-maps'
import withScriptjs from 'react-google-maps/lib/async/withScriptjs';
import _ from 'underscore';
import Pulser from './Pulser.svg';
//mqtt = require('mqtt');

const AsyncGettingStartedExampleGoogleMap = withScriptjs(
  withGoogleMap(
    props => (
      <GoogleMap
        ref={props.onMapLoad}
        defaultZoom={12}
        defaultCenter={{ lat: 60.205294, lng: 24.936092 }}
        onClick={props.onMapClick}
        options={{streetViewControl: false, mapTypeControl: false, styles: [
          {"featureType":"all","elementType":"labels.text.fill","stylers":[{"visibility": "off"}]},
          {"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility": "off"}]},
          {"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
          {"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},
          {"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},
          {"featureType":"poi","stylers":[{"visibility": "off"}]},
          {"featureType":"road","elementType":"labels","stylers":[{"visibility": "off"}]},
          {"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
          {"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},
          {"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
          {"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},
          {"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},
          {"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},
          {"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}
        ]}}

      >
        {props.markers.map(marker => (
          <Marker
            {...marker}
            onRightClick={() => props.onMarkerRightClick(marker)}
          />
        ))}
        <Polyline
          path={[
            {lat: 37.772, lng: -122.214},
            {lat: 21.291, lng: -157.821},
            {lat: -18.142, lng: 178.431},
            {lat: -27.467, lng: 153.027}
          ]}
        />
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
    axios.get('http://api.digitransit.fi/realtime/vehicle-positions/v1/hfp/journey/bus/#')
      .then((response) => {
        const ajaxdata = response.data;
        var arr = [];
        _.each(ajaxdata, (value, key) => {
            _.each(value, (value, key) => {
              let element = {
                veh: value.veh,
                position: {
                  lat: value.lat,
                  lng: value.long,
                },
                key: Math.random(),
                defaultAnimation: 2,
                label: {
                  text: value.desi,
                  color: 'white',
                  fontSize: "10px"
                },
                icon: Pulser,
                optimized: false
              }
              this.setState({
                markers: this.state.markers.concat(element)
              })
            });
        });
      })

    const mqtt_client = mqtt.connect('wss://mqtt.hsl.fi');

    mqtt_client.on('connect', function() {
        console.log('Connected');
    //    mqtt_client.subscribe('/hfp/#');
        mqtt_client.subscribe('/hfp/journey/bus/#');
    });

    mqtt_client.on('message', function(topic, message) {
      let data = JSON.parse(message);
      this.listVehicles(data);
    }.bind(this))
  }

  test() {
    console.log("test");
  }

  listVehicles(data) {
    let found = this.state.markers.some(function (el) {
      return el.veh === data.VP.veh;
    });
    if(found) {
      this.updateLocation(data);
    }
    if (!found) {
      let element = {
        veh: data.VP.veh,
        position: {
          lat: data.VP.lat,
          lng: data.VP.long,
        },
        key: Math.random(),
        defaultAnimation: 2,
        label: {
          text: data.VP.desi,
          color: 'white',
          fontSize: "10px"
        },
        icon: Pulser,
        optimized: false
      }
      this.setState({
        markers: this.state.markers.concat(element)
      }, function(){
        console.log(`Bussi ${data.VP.veh} linjalla ${data.VP.desi} lisätty kartalle.`)
      });
    }
  }

  updateLocation(data) {
    let index = this.state.markers.findIndex(x => x.veh==data.VP.veh);
    let markers = this.state.markers;
    markers[index].position = {
      lat: data.VP.lat,
      lng: data.VP.long
    };
    markers[index].oldpos = {
      lat: data.VP.lat,
      lng: data.VP.long
    };
    this.setState({
      markers: markers
    }, function(){
      console.log(`Bussi ${data.VP.veh} linjalla ${data.VP.desi} päivitti sijaintinsa.`)
    })
  }

  render() {
    return (
      <div className="App">
        <AsyncGettingStartedExampleGoogleMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDLkAy0RqEDrEcMNk0Ihe5MR_V8kX3dFqU&v=3.exp"
          loadingElement={
            <div style={{ height: "100%", width: "100%", }}>
              loading
            </div>
          }
          containerElement={
            <div style={{ height: "100%", width: "100%", position: "absolute" }}>map</div>
          }
          mapElement={
            <div style={{ height: "100%", width: "100%", }} />
          }
          onMapLoad={_.noop}
          onMapClick={_.noop}
          onMarkerRightClick={this.test.bind(this)}
          markers={this.state.markers}
          path={this.state.markers.position}
        />
      </div>
    );
  }
}


export default App;
