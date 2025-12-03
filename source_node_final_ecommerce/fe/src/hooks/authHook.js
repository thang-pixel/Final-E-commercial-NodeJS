import { useSelector } from 'react-redux';

function useAuth() {
    const { user, token } = useSelector((state) => state.auth);
    const isLoggedIn = !!token;

    console.log('User hook: ', user, token)

    return { user, token, isLoggedIn };
}

export default useAuth;
