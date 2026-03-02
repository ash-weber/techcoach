import React from 'react';
import { useState, useEffect } from 'react';
// import { FaEye } from "react-icons/fa";
// import { IoMdEyeOff } from "react-icons/io";
import axios from 'axios';
import './Login.css';
import Test from './assets/testimonial.png';
import Test1 from './assets/testimonial2.png';

const Home = () => {
    const [mode, setMode] = useState('login');
    
    const [isLoading, setIsLoading] = useState(false);

    // Commented email/password related state
    // const [email, setEmail] = useState('');
    // const [password, setPassword] = useState('');
    // const [username, setUsername] = useState('');
    // const [otp, setOtp] = useState('');
    
    // const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        // Commented reset logic for email/password
        // setUsername('');
        // setEmail('');
        // setPassword('');
        // setOtp('');
        // setIsPasswordVisible(false); 
    }, [mode]); 

    // Commented password visibility toggle
    /*
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    */

    // Google login (ACTIVE)
    const loginwithgoogle = () => {
        window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
    };

    // Generic API handler (keep if needed later)
    const handleApiCall = async (apiCall) => {
        setIsLoading(true);
        try {
            await apiCall();
        } catch (error) {
            alert('Operation Failed: ' + (error.response?.data?.message || 'Server error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Commented email/password login
    /*
    const handleLogin = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email, password });
            localStorage.setItem('token', response.data.token);
            alert('Login Successful!');
            window.location.href = '/dashboard';
        });
    };
    */

    // Commented register
    /*
    const handleRegister = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            await axios.post(`${process.env.REACT_APP_API_URL}/register`, { username, email, password });
            alert('OTP has been sent to your email.');
            setMode('otp');
        });
    };
    */

    // Commented OTP verification
    /*
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/verify-otp`, { email, otp });
            localStorage.setItem('token', response.data.token);
            alert('Account verified successfully!');
            window.location.href = '/dashboard';
        });
    };
    */

    return (
        <div className='home-container'>
            <div className='login-page'>
                <div className='form'>
                    <h1>Login</h1>
                    {/* Only Google Login Button */}
                    <button 
                        type="button" 
                        className='login-with-google-btn' 
                        onClick={loginwithgoogle}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Redirecting...' : 'Sign in with Google'}
                    </button>

                    {/* Commented Login Form */}
                    {/*
                    <form className="login-form" onSubmit={handleLogin}>
                        ...
                    </form>
                    */}

                    {/* Commented Register Form */}
                    {/*
                    <form className="register-form" onSubmit={handleRegister}>
                        ...
                    </form>
                    */}

                    {/* Commented OTP Form */}
                    {/*
                    <form className="otp-form" onSubmit={handleVerifyOtp}>
                        ...
                    </form>
                    */}

                </div>
            </div>

            <div className='test'>
                <img src={Test} alt='Testimonial' className='testimonial' />
                <img src={Test1} alt='Testimonial' className='testimonial2' />
            </div>
        </div>
    );
};

export default Home;