import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Map, Marker, Popup, TileLayer, CircleMarker } from 'react-leaflet';
import Leaflet from 'leaflet';
import { ENDPOINT_ROUTES, ENDPOINT_ROUTE_ID } from './constants';

Leaflet.Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/'

export default class BusesMap extends Component {
  state = {
    selectedRoute: null,
    routes: {}
  }
  constructor(){
    super();
    this.handleOnClick = this.handleOnClick.bind(this);
  }
  handleOnClick(routeId) {
    console.log("handleOnClick: " + routeId);
    this.setState({
      selectedRoute: routeId
    });

    if (!this.state.routes[routeId]) {
      axios.get(ENDPOINT_ROUTE_ID + routeId)
        .then(response => {
          this.state.routes[routeId] = response.data;
          this.setState({
            routes: this.state.routes
          });
        }).catch(function (error) {
          console.log(error);
        });
    }
  }
  render() {
    return (
      <div>
        <RouteSelector onClick={this.handleOnClick} />
        <BusRouteMap busRoute={this.state.routes[this.state.selectedRoute]} />
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
      return <li
        key={route.id}
        onClick={() => this.props.onClick && this.props.onClick(route.id)}
        className="selectable"
        style={{ color: route.estilo }}
        >{route.sinoptico}: {route.nombre}</li>
    });
    return (
      <ul id="route-selector">
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
    if (this.props.busRoute) {
      stops = this.props.busRoute.trayectos.map(trayecto => {
        return trayecto.paradas.map(parada => {
          return <StopMarker key={parada.id} busstop={parada} />
        })
      });
    }

    return (
      <div id="map-container">
        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            url='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            subdomains='abcd'
            maxZoom={19}
            />

          {stops}
        </Map>
      </div>
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

