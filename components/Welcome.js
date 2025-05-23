import style from '../styles/welcome.module.css';

export default function Welcome({children}) {
  return (
    <>
    <div>
      {children}
      <h1 className={style.welcoming__header}>Welcome to ToolBox</h1>
    </div>
    </>
  )
}