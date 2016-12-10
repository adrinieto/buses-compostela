import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Map, Marker, Popup, TileLayer, CircleMarker } from 'react-leaflet';
import Leaflet from 'leaflet';
import { ENDPOINT_ROUTES, ENDPOINT_ROUTE_ID } from './constants';

Leaflet.Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/'

export default class BusesMap extends Component {
  state = {}
  componentDidMount() {
    axios.get(ENDPOINT_ROUTE_ID + "1")
      .then(response => {
        this.setState({
          busroute: response.data
        })
      }).catch(function (error) {
        console.log(error);
      });
  }
  render() {
    return (
      <div>
        <RouteSelector />
        <BusRouteMap busroute={this.state.busroute} />
      </div>
    );
  }
}

class RouteSelector extends Component {
  state = {
    routes: []
  }
  componentDidMount() {
    axios.get(ENDPOINT_ROUTES)
      .then(response => {
        this.setState({
          routes: response.data
        })
      }).catch(function (error) {
        console.log(error);
      });
  }
  render() {
    const routes = this.state.routes.map(route => {
      return <li key={route.id}>{route.nombre}</li>
    });
    return (
      <ul>
        {routes}
      </ul>
    );
  }
}

class BusRouteMap extends Component {
  state = {
    lat: 42.880556,
    lng: -8.544861,
    zoom: 13,
  }

  render() {
    const position = [this.state.lat, this.state.lng]

    var stops = null;
    if (this.props.busroute) {
      stops = this.props.busroute.trayectos[0].paradas.map(parada => {
        return <StopMarker key={parada.id} busstop={parada} />
      });
    }

    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
          subdomains='abcd'
          maxZoom={19}
          />

        {stops}
      </Map>
    )
  }
}

function StopMarker(props) {
  const {busstop} = props;
  var color = busstop.extraordinaria ? '#db6f31' : '#2c8dc5';
  return (
    <CircleMarker center={[busstop.coordenadas.latitud, busstop.coordenadas.longitud]} radius={5} fillOpacity={0.8} color={color}>
      <Popup>
        <span>
          <b>{busstop.nombre}</b>
          {busstop.extraordinaria && ' [E]'}
        </span>
      </Popup>
    </CircleMarker>
  )
}

