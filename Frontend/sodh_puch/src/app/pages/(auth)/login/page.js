"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import axios from "../../../axiosSetup";
import { isAuthenticated } from "../auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/pages/dashboard");
    }
  }, []);

  function handleSubmit(event) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("Backend URL:", backendUrl); // Log the backend URL for debugging
    event.preventDefault();
    axios
      .post(`${backendUrl}/login`, { username, password })
      .then((res) => {
        const token = res.data.token; // Get the token from the response
        localStorage.setItem("token", token); // Store the token in localStorage
        console.log("Login successful. Redirecting to dashboard...");
        router.push("/pages/dashboard");
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error); // Show alert for error message from backend
        } else {
          alert("An error occurred. Please try again."); // Generic error alert
        }
      });
  }

  return (
    <div className={styles.main}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <div>
          <h1 className={styles.heroTitle}>Quizzes made fun and easy</h1>
        </div>
        <div>
          <p className={styles.heroSubtitle}>
            Learn something new, test your knowledge, or just have some fun with
            our easy-to-use quizzes.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <h1 className={styles.logo}>Quizzify</h1>
        <div className={styles.form}>
          <h1 className={styles.formHeader}>LOGIN</h1>
          <p className={styles.formSubHeader}>
            Use one of the services to continue with Quizzify
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="username" className={styles.inputLabel}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={styles.inputField}
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.inputField}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className={styles.submitButton}>
              LOGIN
            </button>
          </form>

          <p className={styles.redirectText}>
            Don't have an account?{" "}
            <a href="/pages/signup" className={styles.loginLink}>
              Sign up
            </a>
          </p>
        </div>
        <p className={styles.termsText}>
          By continuing, you agree to our <u>Terms of Use</u> <br />
          Read our <u>Privacy Policy</u>.
        </p>
      </div>
    </div>
  );
};

export default Login;
