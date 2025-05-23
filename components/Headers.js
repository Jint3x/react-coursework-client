import style from '../styles/headers.module.css';
import { useRouter } from "next/navigation"
import getAccountCookie from "../components/getAccountCookie"

export function LogoutBtn() {
    const router = useRouter()
    function signOut() {
        fetch("http://localhost:8000/api/logout", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session: getAccountCookie()
        })
        })
        .then(res => res.json())
        .then(res => {
        if (res.code === 0) {
            document.cookie = `account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=Lax`;
            router.push("/login")
        } else {
            // Couldn't log out.
            console.log(res)
        }
        })
    }

  return (
    <>
      <button onClick={signOut} className={style.logout_button} >Sign out</button>
    </>
  )
}

export function Navbar({setRoute, route}) {
  return (
    <div className={style.navbar}>
      <p className={route === "quoter" ? style.selected_paragraph : ""} onClick={() => setRoute("quoter")}>Quoter</p>
      <p className={route === "new-experience" ? style.selected_paragraph : ""} onClick={() => setRoute("new-experience")}>New Experience</p>
    </div>
  )
}