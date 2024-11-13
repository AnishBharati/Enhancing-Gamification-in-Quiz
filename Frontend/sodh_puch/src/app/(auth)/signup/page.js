"use client"; // This is a client component

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { isAuthenticated } from "../auth";
import axios from '../../axiosSetup';

const Home = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(()=>{
    if(isAuthenticated()){
      router.push('/dashboard');
    }
  })

  function handleSubmit(event) {
    event.preventDefault();
    axios
      .post("http://localhost:8000/signup", {
        fullname,
        email,
        username,
        password,
      })
      .then((res) => {
        console.log(res);
        // Clear input fields
        setFullName("");
        setEmail("");
        setUsername("");
        setPassword("");
        // Redirect to login page
        router.push('/login');
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className={styles.main}>
      {/* Left page */}
      <div className={styles.main2}>
        <h1 className={styles.left_head}>
          Challange your work and life,finally
        </h1>
        <p className={styles.left_btm}>
          Become focused, organized, and calm with Sodh Puch.
          <br />
          The world's #1 user-friendly Quizzez.
        </p>
      </div>

      {/* Right page */}
      <div className={styles.main4}>
        <h1 className={styles.logo}>Sodh Puch</h1>
        <div className={styles.form}>
          <h1 className={styles.fmhd}>SIGNUP</h1>
          <h3 className={styles.heading}>
            Use one of the services to continue with Sodh puch
          </h3>

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Full Name"
              value={fullname}
              required
              onChange={(e) => setFullName(e.target.value)}
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="repassword">Confirm Password</label>
            <input
              type="password"
              id="repassword"
              name="repassword"
              placeholder="Confirm Password"
              required
            />

            <button type="submit" className={styles.pbtn}>
              SIGNUP
            </button>
          </form>

          <p>
            Already have an account? <a href="/login" className={styles.logine}>Login</a>
          </p>
        </div>

        <p className={styles.btmtxt}>
          By continuing, you agree to our <u>Terms of Use</u>
          <br />
          Read our <u>Privacy Policy</u>.
        </p>
      </div>
    </div>
  );
};

export default Home;