"use client"

import getAccountCookie from "../components/getAccountCookie"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import style from "../styles/register.module.css"
import { CardLower, CardTop, CardForm } from "../components/FormComponents"


export default function Page() {
    const router = useRouter()
    const [username, setUsername] = useState();
    const [usernameError, setUsernameError] = useState(undefined);
    const [password, setPassword] = useState();
    const [passwordError, setPasswordError] = useState(undefined);

    async function handleLogin(e) {
        e.preventDefault();
        if (usernameError !== undefined || passwordError !== undefined) {
            return;
        }

        fetch("http://localhost:8000/api/login", {
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
            console.log(result.code)
            if (result.code === 0) {
                const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
                document.cookie = `account=${result.data.account}; max-age=${thirtyDaysInSeconds}; path=/; samesite=Lax`;
                router.push("/")
            } else if (result.code === 1) { // No such username exists
                setUsernameError(result.data.reason)
            } else if (result.code === 2) { // 
                setPasswordError(result.data.reason)
            }
        })
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
        <CardTop 
         header={"ToolBox"}
         welcome={"Sign in for ToolBox"}
        />
        <form onSubmit={handleLogin}>
            <CardForm 
                username={username}
                handleUsername={handleUsername}
                usernameError={usernameError}
                password={password}
                handlePassword={handlePassword}
                passwordError={passwordError}
            />

            <CardLower 
                btnText={"Sign In"}
                underText={"Don't have an account?"} 
                underRedirect={"Sign Up"}
                redirectLink={"/register"}
                handleSubmit={handleLogin}
                router={router}
            />
        </form>
    </div>
  )
}
