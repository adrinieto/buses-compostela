import React, { Component } from 'react';
import axios from 'axios';
import { Map, Popup, TileLayer, CircleMarker } from 'react-leaflet';
import { ENDPOINT_ROUTES, ENDPOINT_ROUTE_ID } from './constants';

export default class BusesMap extends Component {
  state = {
    busRoutesSummary: {},
    busRoutes: {},
    selectedRoute: null
  }
  constructor() {
    super();
    this.handleOnClick = this.handleOnClick.bind(this);
  }
  componentDidMount() {
    axios.get(ENDPOINT_ROUTES)
      .then(response => {
        this.setState({
          busRoutesSummary: response.data,
          selectedRoute: response.data[0].id
        })
      }).catch(function (error) {
        console.log(error);
      });
  }
  handleOnClick(routeId) {
    console.log("handleOnClick: " + routeId);
    this.setState({
      selectedRoute: routeId
    });

    if (!this.state.busRoutes[routeId]) {
      axios.get(ENDPOINT_ROUTE_ID + routeId)
        .then(response => {
          var busRoutes = this.state.busRoutes;
          busRoutes[routeId] = response.data;
          this.setState({
            busRoutes: this.state.busRoutes
          });
        }).catch(function (error) {
          console.log(error);
        });
    }
  }
  render() {
    return (
      <div>
        <RouteSelector
          routes={this.state.busRoutesSummary}
          selectedRoute={this.state.selectedRoute}
          onClick={this.handleOnClick} />
        <BusRouteMap
          busRoute={this.state.busRoutes[this.state.selectedRoute]} />
      </div>
    );
  }
}

function RouteSelector(props) {
  const routes = props.routes && Object.values(props.routes).map(route => {
    return <li
      key={route.id}
      onClick={() => props.onClick && props.onClick(route.id)}
      className={props.selectedRoute === route.id && 'selected'}
      style={{ color: route.estilo }}
      >{route.sinoptico}: {route.nombre}</li>
  });
  return (
    <div id="route-selector">
      <p>Selecciona la línea a visualizar:</p>
      <ul>
        {routes}
      </ul>
    </div>
  );
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
          return <BusStopMarker key={parada.id} busstop={parada} />
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

function BusStopMarker(props) {
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
