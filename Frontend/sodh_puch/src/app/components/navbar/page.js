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
      <div className={styles.search_login}>
        <input type="text" placeholder="Search Subjects" className={styles.search_bar} />
        <button className={styles.login_btn}>Search</button>
      </div>
    </nav>
  );
};

export default Navbar;
