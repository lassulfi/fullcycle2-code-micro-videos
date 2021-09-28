// @flow 
import React, { useEffect, useMemo, useState } from 'react';
import LoadingContext from './LoadingContext';
import { addGlobalRequestInterceptors, addGlobalResponseInterceptors, removeGlobalRequestInterceptors, removeGlobalResponseInterceptors } from '../../utils/http';

const LoadingProvider = (props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countRequest, setCountRequest] = useState(0);

    useMemo(() => {
        let isSubscribed = true;
        const requestIds = addGlobalRequestInterceptors(config => {
            if(isSubscribed) {
                setLoading(true);
                setCountRequest((prevCountRequest) => prevCountRequest + 1);
            }
            return config;
        });
        // axios.interceptors.request.use();
    
        const responseIds = addGlobalResponseInterceptors(response => {
            if(isSubscribed) {
                decrementCountRequest();
            }
            return response;
        }, 
        error => {
            if(isSubscribed) {
                decrementCountRequest();
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

    useEffect(() => {
        if (!countRequest) {
            setLoading(false);
        }
    }, [countRequest])

    function decrementCountRequest() {
        setCountRequest((prevCountRequest) => prevCountRequest - 1);
    }

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;