"use client"

import getAccountCookie from "../components/getAccountCookie"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import style from "../styles/register.module.css"


export default function Page() {
    const router = useRouter()
    const [username, setUsername] = useState();
    const [usernameError, setUsernameError] = useState("AAAA");
    const [password, setPassword] = useState();
    const [passwordError, setPasswordError] = useState();

    function handleRegister(e) {
        fetch("http://localhost:8000/api/register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        })
        .then(res => res.json())
        .then(result => {
            if (result.code === 0) {
                const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
                document.cookie = `account=${result.data.cookie}; max-age=${thirtyDaysInSeconds}; path=/; samesite=Lax`;
                router.push("/")
            }
        })

        e.preventDefault();
    }

    function handleUsername(e) {
        const username = e.target.value

        if (username.length < 6 || username.length > 18) {
            setUsername(username)
            setUsernameError("Username length must be between 6 and 18 characters.")
            return;
        }


        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(username)) {
            setUsername(username)
            setUsernameError("Usernames can include only letters and numbers.")
            return;
        }

        setUsername(username)
        setUsernameError(undefined)
    }

    function handlePassword(e) {
        const password = e.target.value;

        if (password.length < 8 || password.length > 24) {
            setPassword(password)
            setPasswordError("Password length must be between 8 and 24 characters.")
            return;
        }

        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(password)) {
            setPassword(password)
            setPasswordError("Passwords can include only letters and numbers.")
            return;
        }

        setPassword(password)
        setPasswordError(undefined)
    }

    useEffect(() => {
        const accountCookie = getAccountCookie()

        if (accountCookie !== undefined) {
            router.push("/")
        }
    }, [])

  return (
    <div className={style.card}>
        <div>
            <p className={style.card__header}>GraphCraft</p>

            <p className={style.card__welcome}>Sign up for GraphCraft</p>
        </div>
        <form onSubmit={handleRegister}>
            <div className={style.card__inputs}>
                <div className={style.inputs}>
                    <label htmlFor="username" className={style.inputs__label}>Username:</label>
                    <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={handleUsername}
                    aria-label="Username"
                    placeholder="Username"
                    className={style.inputs__box}
                    />
                    {usernameError && <p className={style.inputs__error}>{usernameError}</p>}
                </div>
                <div className={style.inputs}>
                    <label htmlFor="password" className={style.inputs__label}>Password:</label>
                    <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePassword}
                    aria-label="Password"
                    className={style.inputs__box}
                    placeholder="Password"
                    />
                    {passwordError && <p className={style.inputs__error}>{passwordError}</p>}
                </div>
            </div>
            <div className={style.card__lower}>
                <button className={style.card__button} onSubmit={handleRegister}>Sign Up</button>
                <p className={style.card__button_text}>
                    Already have an account? 
                    <span className={style.button_text__span} onClick={() => router.push("/login")}>Sign in</span>
                </p>
            </div>
        </form>
    </div>
  )
}
