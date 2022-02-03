import * as React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router-dom';
import { useCallback } from 'react';

interface PrivateRouteProps extends RouteProps {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}
 
const PrivateRoute: React.FC<PrivateRouteProps> = (props) => {
    const { component: Component, ...rest } = props;
    const { keycloak } = useKeycloak();
    const render = useCallback((props) => {
        if (keycloak.authenticated) {
            return <Component {...props}/>
        }

        return <Redirect 
            to={{
                pathname: "/login",
                // state: { from: props.location }
            }}
        />
    }, []);

    return ( 
        <Route {...rest} render={render}/>
    );
}
 
export default PrivateRoute;