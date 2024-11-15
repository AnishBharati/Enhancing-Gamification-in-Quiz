"use client";
import React, { useEffect } from "react";
import styles from "./page.module.css";
import { isAuthenticated } from "../(auth)/auth";
import { useRouter } from "next/navigation";

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
        <div className={styles.container}>dashboard</div>
    );
}
