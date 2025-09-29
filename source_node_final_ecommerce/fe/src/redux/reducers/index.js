import { combineReducers } from "redux"; 
import authReducer from "./authReducer";
// import cartReducer from "./cartReducer";
import userReducer from "./userReducer";

const rootReducer = combineReducers({
  auth: authReducer,
//   cart: cartReducer,
  user: userReducer,
});

export default rootReducer;
