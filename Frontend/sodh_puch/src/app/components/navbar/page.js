import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>QuizTime</div>
      <div className={styles.nav_links}>
        <Link href="/">Home</Link>
        <Link href="/">About</Link>
        <Link href="/">Contact</Link>
      </div>
     
    </nav>
  );
};

export default Navbar;
