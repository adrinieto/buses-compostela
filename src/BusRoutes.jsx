import React, { Component } from 'react';
import axios from 'axios';
import loading_icon from './loading.svg'
import alert_icon from './alert.svg'
import IncidencesModal from './IncidencesModal'
import {ENDPOINT_ROUTES, ENDPOINT_ROUTE_ID} from './constants';


function AlertIcon(props) {
    return (
        <img id="alert_icon"
            onClick={() => props.onClick()}
            className="clickable"
            src={alert_icon} alt="alert" />
    )
}

function LoadingIcon(props) {
    return (
        <img id="loading_icon" src={loading_icon} alt="loading" />
    )
}

function BusStop(props) {
    const stop = props.stop;
    const zona = stop.zona ? `(${stop.zona}) ` : "";
    return (
        <li>
            {stop.codigo}- {zona}{stop.nombre}
        </li>
    )
}

function RouteDirection(props) {
    const direction = props.direction;
    const stops = direction.paradas.map(stop => {
        return <BusStop key={stop.id} stop={stop} />
    })
    return (
        <div key={direction.routeId + direction.nombre}>
            <h3 className="selectable"
                onClick={() => props.onClick()}>
                {direction.sentido}: {direction.nombre}
            </h3>
            {props.display &&
                <ul>{stops}</ul>
            }
        </div>
    )
}

class Route extends Component {
    constructor() {
        super();
        this.state = {
            details: null,
            loading: false,
            displayDirectionId: null,
            showIncidences: null,

        }
    }
    loadData() {
        this.setState({
            loading: true
        })
        axios.get(ENDPOINT_ROUTE_ID + this.props.route.id)
            .then(response => {
                this.setState({
                    loading: false,
                    details: response.data,
                })
            }).catch(function (error) {
                console.log(error);
            });
    }
    handleClickOnHeader() {
        this.setState({
            displayDirection: null
        });
        if (!this.state.loading && !this.state.details) {
            this.loadData()
        }
        this.props.onClick();
    }
    handleClickOnDirection(directionId) {
        this.setState({
            displayDirectionId: directionId === this.state.displayDirectionId ? null : directionId
        })
    }
    handleClickOnAlert(routeId) {
        if (!this.state.details){
            this.loadData();
        }
        this.setState({
            showIncidences: routeId
        })
    }
    handleCloseModal() {
        this.setState({
            showIncidences: null,
        })
    }
    render() {
        const route = this.props.route;
        const incidencias = route.incidencias ?
            <AlertIcon onClick={() => this.handleClickOnAlert(route.id)} /> : null;
        var directions = null;
        if (this.props.display && this.state.details) {
            directions = this.state.details.trayectos.map(direction => {
                return <RouteDirection
                    onClick={() => this.handleClickOnDirection(direction.sentido)}
                    display={this.state.displayDirectionId === direction.sentido}
                    key={route.id + direction.sentido}
                    routeId={route.id}
                    direction={direction} />
            });
        }
        return (
            <div>
                <h2 className="clickable" style={{ color: route.estilo }}
                    onClick={() => this.handleClickOnHeader()}>
                    {route.sinoptico}- {route.nombre}
                </h2>
                {incidencias}
                {this.state.loading &&
                    <LoadingIcon />
                }
                {this.props.display && this.state.details &&
                    <ul>{directions}</ul>
                }
                {this.state.showIncidences && this.state.details &&
                    <IncidencesModal incidences={this.state.details.incidencias} onClose={() => this.handleCloseModal()} />
                }
            </div>
        )
    }
}

class BusRoutes extends Component {
    constructor() {
        super();
        this.state = {
            routes: [],
            selectedRouteId: null,
        }
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
    handleClick(routeId) {
        this.setState({
            selectedRouteId: routeId === this.state.selectedRouteId ? null : routeId
        })
    }
    render() {
        const routes = this.state.routes.map(route => {
            return <Route
                key={route.id}
                route={route}
                display={route.id === this.state.selectedRouteId}
                onClick={() => this.handleClick(route.id)}
                />
        });
        return (
            <div>{routes}</div>
        );
    }
}

export default BusRoutes;