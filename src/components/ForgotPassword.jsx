import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BASE_URL } from './constant';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };


    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}company/forgot-password`, { email });

            // toast.success('OTP sent to your email');
                  Swal.fire({
                                  html:`<div class="custon-error-container">
                                                <div class="custom-swal-icon-wrapper">
                                                <i class="fa fa-check-circle custom-success-icon"></i>
                                                </div>
                                                <hr class="custom-error-divider" />
                                                <div class="custom-error-message capitalize">OTP sent to your email</div>
                                                </div>`,
                                                toast:false,
                                                position:"center",
                                                color:"#000",
                                                timer: 3000,
                                                timerProgressBar: true,
                                                backdrop: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                                                customClass: {
                                                  popup: "custom-swal-popup",
                                                  actions: "swal-center-actions",
                                                  icon: "custom-swal-icon",
                                                }
                              })
            setOtpSent(true);

        } catch (error) {
            // toast.error(error.response?.data?.message || 'Error sending OTP');
                  Swal.fire({
                                  html:`<div class="custon-error-container">
                                                <div class="custom-swal-icon-wrapper">
                                                <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                                </div>
                                                <hr class="custom-error-divider" />
                                                <div class="custom-error-message capitalize">${error.response?.data?.message || 'Error sending OTP'}</div>
                                                </div>`,
                                                toast:false,
                                                position:"center",
                                                color:"#000",
                                                timer: 3000,
                                                timerProgressBar: true,
                                                backdrop: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false, 
                                                customClass: {
                                                  popup: "custom-swal-popup",
                                                  actions: "swal-center-actions",
                                                  icon: "custom-swal-icon",
                                                }
                              })
        }
    };

    const navigate = useNavigate();
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            // toast.error('Passwords do not match');
                  Swal.fire({
                                  html:`<div class="custon-error-container">
                                                <div class="custom-swal-icon-wrapper">
                                                <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                                </div>
                                                <hr class="custom-error-divider" />
                                                <div class="custom-error-message capitalize">Passwords do not match</div>
                                                </div>`,
                                                toast:false,
                                                position:"center",
                                                color:"#000",
                                                timer: 3000,
                                                timerProgressBar: true,
                                                backdrop: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                                                customClass: {
                                                  popup: "custom-swal-popup",
                                                  actions: "swal-center-actions",
                                                  icon: "custom-swal-icon",
                                                }
                              })
            return;
        }
        try {
            await axios.post(`${BASE_URL}company/reset-password`, { email, otp, password: newPassword });

            // toast.success('Password updated successfully');
                  Swal.fire({
                                  html:`<div class="custon-error-container">
                                                <div class="custom-swal-icon-wrapper">
                                                <i class="fa fa-check-circle custom-success-icon"></i>
                                                </div>
                                                <hr class="custom-error-divider" />
                                                <div class="custom-error-message capitalize">Password updated successfully</div>
                                                </div>`,
                                                toast:false,
                                                position:"center",
                                                color:"#000",
                                                timer: 3000,
                                                timerProgressBar: true,
                                                backdrop: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false, 
                                                customClass: {
                                                  popup: "custom-swal-popup",
                                                  actions: "swal-center-actions",
                                                  icon: "custom-swal-icon",
                                                }
                              })
            navigate('/login');

        } catch (error) {
            // toast.error(error.response?.data?.message || 'Error updating password');
                  Swal.fire({
                                  html:`<div class="custon-error-container">
                                                <div class="custom-swal-icon-wrapper">
                                                <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                                </div>
                                                <hr class="custom-error-divider" />
                                                <div class="custom-error-message capitalize">${error.response?.data?.message || 'Error updating password'}</div>
                                                </div>`,
                                                toast:false,
                                                position:"center",
                                                color:"#000",
                                                timer: 3000,
                                                timerProgressBar: true,
                                                backdrop: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false, 
                                                customClass: {
                                                  popup: "custom-swal-popup",
                                                  actions: "swal-center-actions",
                                                  icon: "custom-swal-icon",
                                                }
                              })
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
                <p className="text-center text-gray-600">Enter your email address to receive an OTP.</p>
                <form onSubmit={otpSent ? handleUpdatePassword : handleSendOtp} className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out bg-transparent backdrop-blur-[40px]"
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </motion.div>
                    {otpSent && (
                        <>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out bg-transparent backdrop-blur-[40px]"
                                    placeholder="Enter the OTP"
                                    required
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out bg-transparent backdrop-blur-[40px]"
                                    placeholder="Enter your new password"
                                    required
                                />

                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Re-enter New Password
                                </label>
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out bg-transparent backdrop-blur-[40px]"
                                    placeholder="Re-enter your new password"
                                    required
                                />
                                <span
                                    onClick={togglePasswordVisibility}
                                    className="absolute text-xl right-5 top-9 cursor-pointer text-gray-500"
                                >
                                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </motion.div>
                        </>
                    )}
                    <motion.button
                        type="submit"
                        className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        {otpSent ? 'Update Password' : 'Send OTP'}
                    </motion.button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-blue-600 hover:text-blue-500">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;