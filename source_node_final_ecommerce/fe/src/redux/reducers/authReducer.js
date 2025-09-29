import { LOGIN, LOGOUT } from "../actions/authAction";

const initialState = {
  user: {
    username: "thuyen070", 
    full_name: "Tran Minh Thuyen",
    role: "CUSTOMERS"
  }, 
  token: null,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return { ...state, user: action.payload.user, token: action.payload.token };
    case LOGOUT:
      return { ...state, user: null, token: null };
    default:
      return state;
  }
}


export default authReducer;