// @flow 
import React, { useMemo, useState } from 'react';
import LoadingContext from './LoadingContext';
import { addGlobalRequestInterceptors, addGlobalResponseInterceptors, removeGlobalRequestInterceptors, removeGlobalResponseInterceptors } from '../../utils/http';

const LoadingProvider = (props) => {
    const [loading, setLoading] = useState<boolean>(false);

    useMemo(() => {
        let isSubscribed = true;
        const requestIds = addGlobalRequestInterceptors(config => {
            if(isSubscribed) {
                setLoading(true);
            }
            return config;
        });
        // axios.interceptors.request.use();
    
        const responseIds = addGlobalResponseInterceptors(response => {
            if(isSubscribed) {
                setLoading(false);
            }
            return response;
        }, 
        error => {
            if(isSubscribed) {
                setLoading(false);
            }
            return Promise.reject(error);
        })
        // axios.interceptors.response.use();
        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptors(requestIds);
            removeGlobalResponseInterceptors(responseIds);
        }
    }, [true]);

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;