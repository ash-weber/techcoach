import React from 'react';
import { useState, useEffect } from 'react';
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";
import axios from 'axios';
import './Login.css';
import Test from './assets/testimonial.png';
import Test1 from './assets/testimonial2.png';

const Home = () => {
    const [mode, setMode] = useState('login');
    
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        setUsername('');
        setEmail('');
        setPassword('');
        setOtp('');
        setIsPasswordVisible(false); 
    }, [mode]); 

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const loginwithgoogle = () => {
        window.open(`${process.env.REACT_APP_API_URL}/auth/google`, '_self');
    };

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

    const handleLogin = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email, password });
            localStorage.setItem('token', response.data.token);
            alert('Login Successful!');
            window.location.href = '/dashboard';
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            await axios.post(`${process.env.REACT_APP_API_URL}/register`, { username, email, password });
            alert('OTP has been sent to your email.');
            setMode('otp');
        });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        handleApiCall(async () => {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/verify-otp`, { email, otp });
            localStorage.setItem('token', response.data.token);
            alert('Account verified successfully!');
            window.location.href = '/dashboard';
        });
    };

    return (
        <div className='home-container'>
            <div className='login-page'>
                <div className='form'>
                    {mode === 'login' && (
                        <form className="login-form" onSubmit={handleLogin}>
                            <h1>Login</h1>
                            <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                            <div className="password-wrapper">
                                <input 
                                    type={isPasswordVisible ? "text" : "password"} 
                                    placeholder="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <span className="password-icon" onClick={togglePasswordVisibility}>
                                    {isPasswordVisible ? <IoMdEyeOff /> : <FaEye />}
                                </span>
                            </div>
                            <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
                            <p className="message">Not registered? <a href="#" onClick={() => setMode('register')}>Create an account</a></p>
                            <hr />
                            <button type="button" className='login-with-google-btn' onClick={loginwithgoogle}>Sign in with Google</button>
                        </form>
                    )}

                    {mode === 'register' && (
                        <form className="register-form" onSubmit={handleRegister}>
                            <h1>Register</h1>
                            <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <input type="email" placeholder="email address" value={email} onChange={(e) => setEmail(e.target.value)} required />

                            <div className="password-wrapper">
                                <input 
                                    type={isPasswordVisible ? "text" : "password"} 
                                    placeholder="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <span className="password-icon" onClick={togglePasswordVisibility}>
                                    {isPasswordVisible ? <IoMdEyeOff /> : <FaEye />}
                                </span>
                            </div>
                            <button type="submit" disabled={isLoading}>{isLoading ? 'Sending OTP...' : 'Create Account'}</button>
                            <p className="message">Already registered? <a href="#" onClick={() => setMode('login')}>Sign In</a></p>
                        </form>
                    )}

                    {mode === 'otp' && (
                         <form className="otp-form" onSubmit={handleVerifyOtp}>
                             <h1>Verify OTP</h1>
                             <p>Enter the code sent to your email</p>
                             <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                             <button type="submit" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify'}</button>
                         </form>
                    )}
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