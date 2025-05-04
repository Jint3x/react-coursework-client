import style from "../styles/formComponents.module.css"

export default function RegisterForm({ setUsername, setPassword, username, password }) {
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  return (
    <div>
      
    </div>
  );
}


function CardTop({header, welcome}) {
  return (
    <div>
      <p className={style.card__header}>{header}</p>
      <p className={style.card__welcome}>{welcome}</p>
    </div>
  )
}

function CardLower({btnText, underText, underRedirect, redirectLink, handleSubmit, router}) {
  return (
    <div className={style.card__lower}>
      <button className={style.card__button} onSubmit={handleSubmit}>{btnText}</button>
      <p className={style.card__button_text}>
          {underText}
          <span className={style.button_text__span} onClick={() => router.push(redirectLink)}>{underRedirect}</span>
      </p>
    </div>
  )
}

function CardForm({username, handleUsername, usernameError, password, handlePassword, passwordError}) {
  return (
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
  )
}

export { CardLower, CardTop, CardForm }