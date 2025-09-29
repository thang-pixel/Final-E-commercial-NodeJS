
const initialState = {
  userInfo: null,
  loading: false,
  error: null
};
const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case "USER_REQUEST":
            return { ...state, loading: true, error: null };
        case "USER_SUCCESS":
            return { ...state, loading: false, userInfo: action.payload };

        case "USER_FAILURE":
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};
export default userReducer;


        