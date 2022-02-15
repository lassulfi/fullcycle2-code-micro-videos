import { Button } from '@material-ui/core';
import { useKeycloak } from '@react-keycloak/web';
import * as React from 'react';

interface LoginButtonProps {
    
}
 
const LoginButton: React.FC<LoginButtonProps> = (props) => {
    const { keycloak, initialized } = useKeycloak(); 

    const isInitializedOrAuthenticated = () => (
        initialized || keycloak.authenticated
    )

    if (isInitializedOrAuthenticated()) {
        return null;
    }

    return ( 
        <Button color="inherit">Login</Button>
    );
}
 
export default LoginButton;