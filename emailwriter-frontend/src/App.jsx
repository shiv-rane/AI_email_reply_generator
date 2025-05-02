import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import StripeWrapper from './StripeWrapper';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    
    if (!token) return false; // If no token, user is not authenticated

    try {
        const { exp } = jwtDecode(token);  // Decode the token to check expiration
        if (!exp || Date.now() >= exp * 1000) {
            localStorage.removeItem('token'); // Remove expired token
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};

function App() {
    return (
        <StripeWrapper>
            <Routes>
                <Route path="/" element={isAuthenticated() ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/payment" element={isAuthenticated() ? <PaymentPage /> : <Navigate to="/login" />} />
            </Routes>
        </StripeWrapper>
    );
}

export default App;
