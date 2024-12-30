"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter(); // Initialize the router

  // Function to handle navigation to sign-up
  const handleGetStarted = () => {
    router.push("/pages/signup"); // Replace with your actual sign-up route
  };

  // Function to handle navigation to login
  const handleLogin = () => {
    router.push("/pages/login"); // Replace with your actual login route
  };

  return (
    <>
      <div className={styles.container}>
        {/* Navigation Bar */}
        <header className={styles.navbar}>
          <div className={styles.logo}>Quizzify</div>
          <nav>
            <ul className={styles.navlinks}>
              <li>Home</li>
              <li>Explore</li>
              <li>Create</li>
              <li>Learn</li>
              <li>
                <button className={styles.getStarted} onClick={handleGetStarted}>
                  Get Started
                </button>
              </li>
              <li>
                <button className={styles.login} onClick={handleLogin}>
                  Log in
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>Quizzes made fun and easy</h1>
            <p className={styles.heroSubtitle}>
              Learn something new, test your knowledge, or just have some fun
              with our easy-to-use quizzes.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>Features</h2>
          <p className={styles.featuresText}>
            Whether you're a trivia buff, a teacher, or just someone who loves
            learning, Quizzify has everything you need to make, take, and share
            quizzes. And with our easy-to-use platform and vibrant community of
            fellow quiz enthusiasts, you'll never run out of new and exciting
            quizzes to enjoy.
          </p>
          <button
            className={styles.getStartedFeatures}
            onClick={handleGetStarted}
          >
            Get started
          </button>
        </section>
      </div>
    </>
  );
}
