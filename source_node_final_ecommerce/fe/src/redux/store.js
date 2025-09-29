// import { createStore } from "redux";
// import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index.js";
import { legacy_createStore as createStore} from 'redux'

const store = createStore(rootReducer);

export default store;