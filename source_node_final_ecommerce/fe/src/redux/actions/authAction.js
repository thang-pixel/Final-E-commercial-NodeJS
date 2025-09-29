export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

export const login = (user, token) => ({
  type: LOGIN,
  payload: { user, token },
});

export const logout = () => ({
  type: LOGOUT,
});
