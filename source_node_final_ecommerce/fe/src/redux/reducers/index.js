import { combineReducers } from "redux";  
// import cartReducer from "./cartReducer";
import userReducer from "./userReducer";

const rootReducer = combineReducers({
  // auth: authReducer,
//   cart: cartReducer,
  user: userReducer, 
});

export default rootReducer;
