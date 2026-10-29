import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (Component) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
            }
        }, [navigate]);

        return localStorage.getItem('token') ? <Component {...props} /> : null;
    };

    return AuthComponent;
};

export default withAuth;
