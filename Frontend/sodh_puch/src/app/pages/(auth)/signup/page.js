"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../auth";
import axios from "../../../axiosSetup";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
      .post(`${backendUrl}/signup`, {
        fullname,
        email,
        username,
        password,
      })
      .then((res) => {
        console.log(res);
        setFullName("");
        setEmail("");
        setUsername("");
        setPassword("");
        router.push("/pages/login");
      })
      .catch((err) => console.log(err));
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
          <h1 className={styles.formHeader}>SIGNUP</h1>
          <p className={styles.formSubHeader}>
            Use one of the services to continue with Quizzify
          </p>

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="fullname" className={styles.inputLabel}>
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              className={styles.inputField}
              placeholder="Full Name"
              value={fullname}
              required
              onChange={(e) => setFullName(e.target.value)}
            />

            <label htmlFor="email" className={styles.inputLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.inputField}
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />

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

            <label htmlFor="repassword" className={styles.inputLabel}>
              Confirm Password
            </label>
            <input
              type="password"
              id="repassword"
              name="repassword"
              className={styles.inputField}
              placeholder="Confirm Password"
              required
            />

            <button type="submit" className={styles.submitButton}>
              SIGNUP
            </button>
          </form>

          <p className={styles.redirectText}>
            Already have an account?{" "}
            <a href="/pages/login" className={styles.loginLink}>
              Login
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

export default Signup;
