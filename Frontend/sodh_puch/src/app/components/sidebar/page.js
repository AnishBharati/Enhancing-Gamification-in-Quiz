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

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const toggle = () => {
    setOpen(!open);
  };

  const [drop, setDrop] = useState(false);
  const toggleDropdown = () => {
    setDrop(!drop);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        <div className={styles.item4} onClick={toggle}>
          <RxHamburgerMenu />
        </div>

        {open && (
          <>
            <div className={styles.item1}>
              <Link href="/dashboard" className={styles.link}>
                <MdDashboard className={styles.icon} />
                <span className={styles.text}>Dashboard</span>
              </Link>
            </div>
            <div className={styles.item3}>
              <Link href="/dashboard/calender" className={styles.link}>
                <SlCalender className={styles.icon} />
                <span className={styles.text}>Calender</span>
              </Link>
            </div>
            <div className={styles.item2} onClick={toggleDropdown}>
              <SiGoogleclassroom className={styles.icon} />
              <span className={styles.text}>
                Quiz  <IoIosArrowDown className={styles.icon1} />
              </span>
            </div>

            {drop && (
              <>
                <div className={styles.item5}>
                  <Link href="/dashboard/classes" className={styles.link}>
                    <GoPlus className={styles.icon2} />
                    <span className={styles.text}>Add</span>
                  </Link>
                </div>
                <div className={styles.item6}>
                  <Link href="/dashboard/subjects" className={styles.link}>
                    <PiFilesLight className={styles.icon2} />
                    <span className={styles.text}> Subject</span>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
