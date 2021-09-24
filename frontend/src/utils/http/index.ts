import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const httpVideo = axios.create({
    baseURL: process.env.REACT_APP_MICRO_VIDEO_API_URL
});

const instances = [httpVideo];

export function addGlobalRequestInterceptors(
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>, 
    onRejected?: (error: any) => any
) {
    const ids: number[] = [];
    for(let i of instances) {
        const id = i.interceptors.request.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalRequestInterceptors(ids: number[]) {
    ids.forEach((id, index) => instances[index].interceptors.request.eject(id));
}

export function addGlobalResponseInterceptors(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>, 
    onRejected?: (error: any) => any
) {
    const ids: number[] = [];
    for(let i of instances) {
        const id = i.interceptors.response.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalResponseInterceptors(ids: number[]) {
    ids.forEach((id, index) => instances[index].interceptors.response.eject(id));
}