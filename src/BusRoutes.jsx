import React, { Component } from 'react';
import axios from 'axios';
import loading from './loading.svg'

function LoadingIcon(props) {
    return (
        <img id="loading" src={loading} alt="loading" />
    )
}


function BusStop(props) {
    const stop = props.stop;
    return (
        <li>
            {stop.codigo}- ({stop.zona}) {stop.nombre}
        </li>
    )
}

class RouteDirection extends Component {
    render() {
        const direction = this.props.direction;
        const stops = direction.paradas.map(stop => {
            return <BusStop key={stop.id} stop={stop} />
        })
        return (
            <li key={direction.routeId + direction.nombre}
                onClick={() => this.props.onClick()}>
                {direction.sentido}: {direction.nombre}
                {this.props.display &&
                    <ul>{stops}</ul>
                }
            </li>
        )
    }
}

class Route extends Component {
    constructor() {
        super();
        this.state = {
            details: null,
            loading: false,
            displayDetails: false,
            displayDirection: null
        }
    }
    handleClickOnHeader() {
        this.setState({
            displayDetails: !this.state.displayDetails,
            displayDirection: null
        });
        if (!this.state.details) {
            this.setState({
                loading: true
            })
            axios.get(`https://app.tussa.org/tussa/api/lineas/${this.props.route.id}`)
                .then(response => {
                    this.setState({
                        loading: false,
                        details: response.data,
                    })
                }).catch(function (error) {
                    console.log(error);
                });
        }
    }
    handleClickOnDirection(directionId) {

        this.setState({
            displayDirection: directionId === this.state.displayDirection ? null : directionId
        })
    }
    render() {
        const route = this.props.route;
        const incidencias = route.incidencias ?
            ' (Con incidencias)' : null;
        var directions = null;
        if (this.state.displayDetails && this.state.details) {
            directions = this.state.details.trayectos.map(direction => {
                return <RouteDirection
                    onClick={() => this.handleClickOnDirection(direction.sentido)}
                    display={this.state.displayDirection === direction.sentido}
                    key={route.id + direction.sentido}
                    routeId={route.id}
                    direction={direction} />
            });
        }

        return (
            <div>
                <h2 style={{ color: route.estilo }}
                    onClick={() => this.handleClickOnHeader()}>
                    {route.sinoptico}- {route.nombre}
                    {incidencias}
                </h2>
                {this.state.loading &&
                    <LoadingIcon />
                }
                {this.state.displayDetails && this.state.details &&
                    <ul>{directions}</ul>
                }

            </div>
        )
    }
}

class BusRoutes extends Component {
    constructor() {
        super();
        this.state = {
            routes: []
        }
    }
    componentDidMount() {
        axios.get('https://app.tussa.org/tussa/api/lineas')
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
            return <Route key={route.id} route={route} />
        });
        return (
            <div>{routes}</div>
        );
    }
}

export default BusRoutes;