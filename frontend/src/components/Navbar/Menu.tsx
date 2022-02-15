// @flow 
import { Divider, IconButton, Menu as MuiMenu, MenuItem, Link as MuiLink } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useKeycloak } from '@react-keycloak/web';
import * as React from 'react';
import { Link } from 'react-router-dom';
import routes, { MyRouteProps } from '../../routes';

const listRoutes = {
    'dashboard': 'Dashboard',
    'categories.list': 'Categorias',
    'genres.list': 'Gêneros',
    'cast_members.list': 'Membros de elenco',
    'videos.list': 'Vídeos',
    'uploads': 'Uploads',
};

const menuRoutes = routes.filter(route => Object.keys(listRoutes).includes(route.name));

export const Menu = () => {
    const { keycloak, initialized } = useKeycloak();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: any) => setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    const isNotInitializedOrAuthenticated = () => (
        !initialized || !keycloak.authenticated
    )

    if (isNotInitializedOrAuthenticated()) {
        return null;
    }

    return (
        <React.Fragment>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <MenuIcon />
            </IconButton>
            <MuiMenu
                id="menu-appbar"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                getContentAnchorEl={null}
            >
                {
                    Object.keys(listRoutes).map(
                        (routeName, key) => {
                            const route = menuRoutes.find(route => route.name === routeName) as MyRouteProps;
                            return (
                                <MenuItem
                                    key={key}
                                    component={Link}
                                    to={route.path as string}
                                    onClick={handleClose}
                                >
                                    {listRoutes[routeName]}
                                </MenuItem>
                            )
                        }
                    )
                }
                <Divider />
                <MenuItem
                    component={MuiLink}
                    href={"http://"}
                    rel="noopener"
                    target="_blank"
                    color={"textPrimary"}
                    onClick={handleClose}
                >
                    Usuários
                </MenuItem>
            </MuiMenu>
        </React.Fragment>
    );
};