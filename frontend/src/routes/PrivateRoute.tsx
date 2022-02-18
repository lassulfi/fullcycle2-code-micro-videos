import * as React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Redirect, Route, RouteComponentProps, RouteProps } from 'react-router-dom';
import { useCallback } from 'react';
import { useHasRealmRole } from '../hooks/useHasRole';
import NotAuthorized from '../pages/NotAuthorized';

interface PrivateRouteProps extends RouteProps {
    component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}
 
const PrivateRoute: React.FC<PrivateRouteProps> = (props) => {
    const { component: Component, ...rest } = props;
    const { keycloak } = useKeycloak();
    const hasCatalogAdmin = useHasRealmRole('catalog_admin');
    const render = useCallback((props) => {
        if (keycloak.authenticated) {
            return hasCatalogAdmin ? <Component {...props}/> : <NotAuthorized />;
        }

        return <Redirect 
            to={{
                pathname: "/login",
                state: { from: props.location }
            }}
        />
    }, [hasCatalogAdmin]);

    return ( 
        <Route {...rest} render={render}/>
    );
}
 
export default PrivateRoute;