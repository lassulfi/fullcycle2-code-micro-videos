const { createStore, applyMiddleware } = require('redux');
const { default: createSagaMiddleware } = require('redux-saga');
const { take, put, call }  = require('redux-saga/effects');
const axios = require('axios');

function reducer(state = {value: 1}, action) {
    if (action.type === 'acaoX') return { value: action.value };

    return state;
}

function* helloWorldSaga() {
    console.log('Hello, World!');
    while(true) {
        console.log('antes da acao Y');
        const action = yield take('acaoY'); // '*' Todas as actions types
        const search = action.value;

        try {
            const {data} = yield call(
                // (search) => axios.get('http://nginx/api/videos?search=' + search), search
                axios.get, 'http://nginx/api/videos?search=' + search 
            );
            console.log(data);
    
            // logica ------------------
            const result = yield put({
                type: 'acaoX',
                value: data
            });
        } catch (error) {
            const result = yield put({
                type: 'acaoX',
                error
            });
        }
    }
        
    // pegar os dados de action type
    // fazer uma requisicao ajax
    // atualizar state
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(helloWorldSaga);

const action = (type, value) => store.dispatch({ type, value });

action('acaoY', 'a');
action('acaoY', 'a');
action('acaoW', 'a');

console.log(store.getState());