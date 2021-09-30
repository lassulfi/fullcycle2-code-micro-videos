import { createStore } from "redux";
import reducer from "./upload";

const store = createStore(
    reducer
);

export default store;