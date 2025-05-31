import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"
import getAccountCookie from "../components/getAccountCookie"
import Quoter from '../components/Quoter';
import Welcome from '../components/Welcome';
import { Navbar, LogoutBtn } from '../components/Headers';
import NewExperience from '../components/NewExperience';

export default function MyThing() {
  const router = useRouter()
  const [route, setRoute] = useState();

  useEffect(() => {
    const session = getAccountCookie();
    if (session === undefined) {
      router.push("/login")
    }

    fetch("http://localhost:8000/api/confirm-login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session
      })
    })
    .then(res => res.json())
    .then(result => {
      if (result.code !== 0) {
        document.cookie = `account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=Lax`;
        router.push("/login")
      }
    })
  }, [])

  return (
    <>
    {
      route === undefined ? 
      <Welcome>
        <Navbar setRoute={setRoute} route={route} />
        <LogoutBtn />
      </Welcome>
      :
      route === "quoter" ? 
      <> 
      <Quoter>
        <Navbar setRoute={setRoute} route={route} />
        <LogoutBtn />
      </Quoter>
      </>
      :
      <NewExperience>
      <Navbar setRoute={setRoute} route={route} />
      <LogoutBtn />
      </NewExperience>
    }
    </>
  )
}