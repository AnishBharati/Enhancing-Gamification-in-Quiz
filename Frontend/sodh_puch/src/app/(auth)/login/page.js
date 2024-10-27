"use client"; // This is a client component

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import axios from "../../axiosSetup";
import { isAuthenticated } from "../auth";

const Home = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(()=>{
    if(isAuthenticated()){
      router.push('/dashboard');
    }
  })

  function handleSubmit(event) {
    event.preventDefault();
    axios
      .post("http://localhost:8000/login", { username, password })
      .then((res) => {
        const token = res.data.token; // Get the token from the response
        localStorage.setItem("token", token); // Store the token in localStorage
        console.log("Login successful. Redirecting to dashboard...");
        router.push("/dashboard"); 
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
      {/* Left page */}
      <div className={styles.main2}>
        <h1 className={styles.left_head}>Challange your work and life,finally</h1>
        <p className={styles.left_btm}>
          Become focused and organized with Sodh Puch.
          <br />
          The world's #1 user-friendly Quizezz.
        </p>
      </div>

      {/* Right page */}
      <div className={styles.main4}>
        <h1 className={styles.logo}>Sodh Puch</h1>
        <div className={styles.form}>
          <h1 className={styles.fmhd}>LOG IN</h1>
          <h3 className={styles.heading}>Use one of the services to continue with Sodh Puch</h3>

          {/* Username Input */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              required
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Password Input */}
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Login Button */}
            <button type="submit" className={styles.pbtn}>
              LOGIN
            </button>
          </form>

          {/* Sign Up Link */}
          <p>
            Don't have an account? <a href="/signup" className={styles.signe}>Sign up</a>
          </p>
        </div>

        {/* Terms and Privacy */}
        <p className={styles.btmtxt}>
          By continuing, you agree to Our <u>Terms of Use</u>
          <br />
          Read our <u>Privacy Policy</u>.
        </p>
      </div>
    </div>
  );
};

export default Home;