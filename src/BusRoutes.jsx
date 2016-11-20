import React, { Component } from 'react';
import axios from 'axios';

class RouteDirection extends Component {
    render() {
        const direction = this.props.direction;
        return (
            <li key={direction.routeId + direction.nombre}>
                {direction.sentido}: {direction.nombre}
            </li>
        )
    }
}

class Route extends Component {
    constructor() {
        super();
        this.state = {
            details: null
        }
    }
    componentDidMount() {
        axios.get(`https://app.tussa.org/tussa/api/lineas/${this.props.route.id}`)
            .then(response => {
                this.setState({
                    details: response.data
                })
            }).catch(function (error) {
                console.log(error);
            });
    }
    render() {
        const route = this.props.route;
        const incidencias = route.incidencias ?
            ' (Con incidencias)' : null;
        var directions = null;
        if (this.state.details) {
            directions = this.state.details.trayectos.map((direction) => {
                return <RouteDirection
                    key={route.id + direction.sentido}
                    routeId={route.id}
                    direction={direction} />
            });
        }

        return (
            <div>
                <h2 style={{ color: route.estilo }}>
                    {route.sinoptico}- {route.nombre}
                    {incidencias}
                </h2>
                <ul>{directions}</ul>

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
        const routes = this.state.routes.map((route) => {
            return <Route key={route.id} route={route} />
        });
        return (
            <div>{routes}</div>
        );
    }
}

export default BusRoutes;