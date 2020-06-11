import Cookies from 'universal-cookie';
import decode from 'jwt-decode';



const cookies = new Cookies();
// const token = localStorage.getItem('token')

const checkAuth = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token || !refreshToken) {
        return false;
    }

    try {
        const { exp } = decode(refreshToken);
        console.log(exp)
        console.log(new Date().getTime() / 1000)
        if (exp < new Date().getTime() / 1000) {
            return false;
        }

    } catch (error) {
        return false;
    }

    return true;
}

export const fakeAuth = {
    isAuthenticated: checkAuth() ? true : false,
    authenticate(cb) {
        this.isAuthenticated = true
        setTimeout(cb, 100) // fake async
    },
    signout(cb) {
        this.isAuthenticated = false
        setTimeout(cb, 100) // fake async
    }
}

export default fakeAuth;