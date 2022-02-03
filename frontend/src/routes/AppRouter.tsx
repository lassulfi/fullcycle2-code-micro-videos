// @flow 
import React from 'react';
import { Route as ReactRoute, Switch } from 'react-router-dom';
import routes from './index';
import PrivateRoute from './PrivateRoute';

const AppRouter: React.FC = () => {
    return (
        <Switch>
            {
                routes.map(
                    (route, key) => {
                        const Route = route.auth === true ? PrivateRoute : ReactRoute;
                        const routeParams = {
                            key,
                            component: route.component!,
                            ...(route.path && { path: route.path }),
                            ...(route.exact && { exact: route.exact }),
                        };
                        return <Route {...routeParams}/>
                    }
                )
            }
        </Switch>
    );
};

export default AppRouter;