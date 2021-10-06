const { createStore, applyMiddleware } = require("redux");
const { default: createSagaMiddleware } = require("redux-saga");
const {
  take,
  put,
  call,
  actionChannel,
  debounce,
  select,
  all,
  fork,
} = require("redux-saga/effects");
const axios = require("axios");

function reducer(state = { value: 1 }, action) {
  if (action.type === "acaoY") return { ...state, text: action.value };
  if (action.type === "acaoX") return { value: action.value };

  return state;
}

function* sagaNonBlocking() {
    console.log('antes do call');
    const {data} = yield call(
        // (search) => axios.get('http://nginx/api/videos?search=' + search), search
        axios.get,
        "http://nginx/api/videos"
      );
      console.log('depois do call');
    //   yield put();
}

function* searchData(action) {
  // console.log('Hello, World!');
  // const channel = yield actionChannel('acaoY');
  // console.log(channel);
  // while(true) {
  console.log(yield select((state) => state.text));
  console.log("antes da acao Y");
  // const action = yield take('acaoY'); // '*' Todas as actions types
  // const action = yield take(channel); // '*' Todas as actions types
  const search = action.value;

  try {

    yield fork(sagaNonBlocking);
    console.log('depois do fork');

    // const [response1, response2] = yield all([
    //   call(
    //     // (search) => axios.get('http://nginx/api/videos?search=' + search), search
    //     axios.get,
    //     "http://nginx/api/videos?search=" + search
    //   ),
    //   call(
    //     // (search) => axios.get('http://nginx/api/videos?search=' + search), search
    //     axios.get,
    //     "http://nginx/api/categories?search=" + search
    //   ),
    // ]);
    // console.log(JSON.stringify(response1.data), JSON.stringify(response2.data));
    // const {data} = yield call(
    //     // (search) => axios.get('http://nginx/api/videos?search=' + search), search
    //     axios.get, 'http://nginx/api/videos?search=' + search
    // );
    // const {data1} = yield call(
    //     // (search) => axios.get('http://nginx/api/videos?search=' + search), search
    //     axios.get, 'http://nginx/api/categories?search=' + search
    // );
    console.log(search);

    // logica ------------------
    const result = yield put({
      type: "acaoX",
      value: '',
    });
  } catch (error) {
    const result = yield put({
      type: "acaoX",
      error,
    });
  }
  // }

  // pegar os dados de action type
  // fazer uma requisicao ajax
  // atualizar state
}

function* helloZaWarudo() {
    console.log('Hello, ZA WARUDO!');
}

function* debouncedSearch() {
  yield debounce(1000, "acaoY", searchData);
}

function* rootSaga() {
    // yield all([
    //     debouncedSearch(),
    //     helloZaWarudo(),
    // ]);

    yield fork(helloZaWarudo);
    yield fork(debouncedSearch);

    console.log('final');
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

const action = (type, value) => store.dispatch({ type, value });

action("acaoY", "l");
action("acaoY", "lu");
action("acaoY", "lui");
action("acaoY", "luis");
action("acaoY", "luis ");
action("acaoY", "luis d");
action("acaoY", "luis da");

console.log(store.getState());
