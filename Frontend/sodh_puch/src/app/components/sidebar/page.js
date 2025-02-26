"use client";
import styles from "./page.module.css";
import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { SlCalender } from "react-icons/sl";
import { RxHamburgerMenu } from "react-icons/rx";
import { GoPlus } from "react-icons/go";
import { PiFilesLight } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [drop, setDrop] = useState(false);
  const router = useRouter();

  const toggle = () => {
    setOpen(!open);
  };

  const toggleDropdown = () => {
    setDrop(!drop);
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem("token", token);
    router.push("/pages/login");
  };

  // Helper functions for active link styles
  const isActive = (path) => router.pathname === path;
  const isRouteActive = (path) => router.pathname?.startsWith(path);

  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        {/* Hamburger Menu */}
        <div className={styles.item4} onClick={toggle}>
          <RxHamburgerMenu />
        </div>

        {/* Sidebar Links */}
        {open && (
          <>
            {/* Dashboard Link */}
            <div
              className={`${styles.item1} ${
                isActive("/pages/dashboard") ? styles.active : ""
              }`}
            >
              <Link href="/pages/dashboard" className={styles.link}>
                <MdDashboard className={styles.icon} />
                <span className={styles.text}>Dashboard</span>
              </Link>
            </div>

            {/* Calendar Link */}
            <div
              className={`${styles.item3} ${
                isActive("/pages/leaderboard") ? styles.active : ""
              }`}
            >
              <Link href="/pages/leaderboard" className={styles.link}>
                <SlCalender className={styles.icon} />
                <span className={styles.text}>LeaderBoard</span>
              </Link>
            </div>

            {/* Quiz Dropdown */}
            <div
              className={`${styles.item2} ${
                isRouteActive("/pages/classes") ? styles.active : ""
              }`}
              onClick={toggleDropdown}
            >
              <SiGoogleclassroom className={styles.icon} />
              <span className={styles.text}>
                Quiz
                <IoIosArrowDown
                  className={`${styles.icon1} ${drop ? styles.rotate : ""}`}
                />
              </span>
            </div>

            {/* Dropdown Links */}
            {drop && (
              <div className={styles.dropdownContainer}>
                <div
                  className={`${styles.item5} ${
                    isActive("/pages/classes") ? styles.active : ""
                  }`}
                >
                  <Link href="/pages/classes" className={styles.link}>
                    <GoPlus className={styles.icon2} />
                    <span className={styles.text}>Add</span>
                  </Link>
                </div>
                <div
                  className={`${styles.item6} ${
                    isActive("/pages/subjects") ? styles.active : ""
                  }`}
                >
                  <Link href="/pages/subjects" className={styles.link}>
                    <PiFilesLight className={styles.icon2} />
                    <span className={styles.text}>List</span>
                  </Link>
                </div>

                
                <div
                  className={`${styles.item6} ${
                    isActive("/pages/students") ? styles.active : ""
                  }`}
                >
                  <Link href="/pages/students" className={styles.link}>
                    <PiFilesLight className={styles.icon2} />
                    <span className={styles.text}>Students</span>
                  </Link>
                </div>

              </div>
            )}

            {/* Logout Link */}
            <div className={styles.item7}>
              <Link onClick={handleLogout} href="/pages/login" className={styles.link}>
                <IoLogOutOutline className={styles.icon} />
                <span className={styles.text}>Logout</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
