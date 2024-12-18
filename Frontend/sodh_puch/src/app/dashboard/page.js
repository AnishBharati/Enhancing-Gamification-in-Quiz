'use client'
import React, { useEffect } from "react";
import styles from "./page.module.css";
import { isAuthenticated } from "../(auth)/auth";
import { useRouter } from "next/navigation";
import { RiPoliceBadgeFill } from "react-icons/ri";

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (!await isAuthenticated()) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    return (
        <div className={styles.dashboardContainer}>
            {/* Left Section */}
            <div className={styles.leftSection}>
                <div className={styles.imageCircle}>
                    <img src="/img/lvl5.jpeg" alt="Dashboard Icon" className={styles.circleImage} />
                </div>
                <h2 className={styles.dashboardText}>Dashboard</h2>
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>User Level</p>
                        <p>Level 5</p>
                    </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>Quiz Points</p>
                        <p>10</p>
                    </div>
                    <div className={styles.statItem}>
                        <RiPoliceBadgeFill className={styles.icon} />
                        <p>EXP Points</p>
                        <p>100</p>
                    </div>
                </div>
                <h3 className={styles.badgesTitle}>Badges Unlocked</h3>
                <div className={styles.badgesRow}>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/2.lvl5.jpeg" alt="Badge 1" />
                        </div>
                        <p className={styles.badgeText}>Level 5</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 2" />
                        </div>
                        <p className={styles.badgeText}>Level 10</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 3" />
                        </div>
                        <p className={styles.badgeText}>Level 15</p>
                    </div>
                    <div className={styles.badgeCard}>
                        <div className={styles.badge}>
                            <img src="/img/lock.jpg" alt="Badge 4" />
                        </div>
                        <p className={styles.badgeText}>Level 20</p>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className={styles.rightSection}>
                <div className={styles.profileImage}>
                    <img src="/img/user.jpg" alt="User" className={styles.circleImage} />
                </div>
                <div className={styles.userInfo}>
                    <p><strong>Name:</strong> John Doe</p>
                    <p><strong>Surname:</strong> Smith</p>
                    <p><strong>Email:</strong> john.doe@example.com</p>
                </div>
                <div className={styles.profileButtons}>
                    <button className={styles.editProfileButton}>Edit Profile</button>
                    <button className={styles.changePasswordButton}>Change Password</button>
                </div>
            </div>
        </div>
    );
}
