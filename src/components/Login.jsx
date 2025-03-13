import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiArrowCircleRight } from "react-icons/hi";
import { Link, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import img from "../assets/lgog.png";
import logo from "../assets/loginlogo.png";
import { BASE_URL } from "../components/constant";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [redirect, setRedirect] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setRedirect(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.email) {
      // toast.error("Email is required");
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">email is required</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      // toast.error("Invalid email address");
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">invalid email address</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
      isValid = false;
    }
    if (!formData.password) {
      // toast.error("Password is required");
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">password is required</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const endpoint = `${BASE_URL}company/login-as-admin`;
        const response = await axios.post(endpoint, formData);

        console.log("Response received:", response);

        if (response.status !== 200) {
          throw new Error("Failed while login");
        }

        const token = response.data.data.token;
        const adminId = response.data.data.companyAdminDetails._id;
        const name = response.data.data.companyAdminDetails.name;
        const type = response.data.data.companyAdminDetails.type;
        // toast.success('Login successful!');
        Swal.fire({
          html: `
          <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fa fa-check-circle custom-success-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">Login successfull!</div>
          </div>`,
          toast: false,
          position: "center",
          color: "#000",
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: "custom-swal-popup",
            actions: "swal-center-actions",
            icon: "custom-swal-icon",
          },
        });
        setFormData({ email: "", password: "" });
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("adminId", adminId);
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("type", type);
        onLogin(type);
        setRedirect(true);
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong";
        // toast.error(errorMessage);
        Swal.fire({
          html: `
          <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">${errorMessage}</div>
          </div>`,
          toast: false,
          position: "center",
          color: "#000",
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: "custom-swal-popup",
            actions: "swal-center-actions",
            icon: "custom-swal-icon",
          },
        });
      }
    }
  };

  if (redirect) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[url('./assets/06ded2be-68c1-4023-ab8c-0783ccfb952c.jpg')] bg-cover bg-center bg-opacity-10">
      <motion.div
        className="flex-1 flex flex-col items-center justify-center p-2 lg:p-0"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={logo}
          alt="logo"
          className="brightness-0 saturate-0 w-1/2 md:w-1/3 lg:w-1/3 !mb-0  "
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <motion.img
          src={img}
          alt="loginImg"
          className="w-full md:w-3/4 lg:w-2/3 hidden lg:block rounded-xl mb-6 !mt-0"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <HiArrowCircleRight className="text-4xl text-blue-700" />
            <p className="text-xl font-semibold text-black">
              Welcome to the Online Assessment World
            </p>
          </div>
          <p className="text-md text-gray-700">
            Please login to manage your account
          </p>
        </motion.div>
      </motion.div>
      <motion.div
        className="flex-1 flex items-center justify-center p-4 lg:p-0"
        initial={{ opacity: 0, x: 70 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 space-y-4 md:space-y-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
              Admin Login
            </h2>
          </div>
          <div className="bg-transparent backdrop-blur-[40px] rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Welcome Back👋
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label
                  htmlFor="email"
                  className="text-md font-medium text-gray-900 block mb-2"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent backdrop-blur-[40px] w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  placeholder="Enter your email"
                  autoComplete="username"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className="text-md font-medium text-gray-900 block mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent backdrop-blur-[40px] w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    placeholder="Enter your password"
                  />
                  <motion.span
                    onClick={togglePasswordVisibility}
                    className="absolute text-xl cursor-pointer text-gray-500 right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                  </motion.span>
                </div>
              </motion.div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                >
                  Forgot your password?
                </Link>
              </div>
              <motion.button
                type="submit"
                className="w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
