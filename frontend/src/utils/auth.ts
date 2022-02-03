import Keycloak from 'keycloak-js';
import { AuthClientInitOptions } from '@react-keycloak/core';

export interface KeycloakCredentials {
    realm: string;
    'auth-server-url': string;
    'ssl-required': string;
    resource: string;
    'public-client': boolean;
    'confidential-port': number;
}

const keycloakCredentials: KeycloakCredentials = JSON.parse(process.env.REACT_APP_KEYCLOAK_JSON!);

export const keycloak = Keycloak({
    url: keycloakCredentials['auth-server-url'],
    realm: keycloakCredentials['realm'],
    clientId: keycloakCredentials['resource'],
});

export const keycloakConfig: AuthClientInitOptions = {
    onload: 'check-sso',
}