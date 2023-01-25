import { renderAbc } from 'abcjs'
import axios from 'axios'
import { useState } from 'react'
import styles from '../styles/RightColumn.module.scss'
import { feedItemType } from './util'

export interface IRightColumnProps {
  savedLicks: string[]
  historyFeed: feedItemType[]
  savedNotation: feedItemType[]
}

// using "responsive: "resize"" doesn't work with the saved ones, but it does work with the main feed,
// so we will have two different sets of default parameters. One for the main feed, and the other for
// the "saved items" feed.
// i believe this is because  { responsive: "resize" } overrides the classname of the .svg, and gets
// rid of the "onHover" command. this could probably be DOUBLY overridden, but that seems quite
// weird for a relatively minor problem. Just make sure there is no "resposive" on the saved items.
const defaultSavedParams = {
  staffwidth: 525,
  wrap: {
    preferredMeasuresPerLine: 4,
    minSpacing: 0,
    maxSpacing: 0,
  },
  jazzchords: true,
  selectionColor: '#03DAC6',
  paddingright: 15,
}

export default function RightColumn(RightColumnProps: IRightColumnProps) {
  const [loginInfo, setLoginInfo] = useState({
    isLoggedIn: false,
    email: '',
    password: '',
  })

  const handleHover = () =>
    RightColumnProps.savedNotation.forEach((i) =>
      renderAbc(`abcjs-saved-${i.uuid}`, i.musicString, defaultSavedParams),
    )

  const handleChange = (event: any) => {
    const target = event.target
    const name = target.name
    setLoginInfo({
      ...loginInfo,
      [name]: event.target.value,
    })
  }

  // connect to postgres via PHP controller. 
  // if the return statement is true, login was successful.
  const handleSignIn = (event: any): void => {
    axios
      .post('http://127.0.0.1:8000/api/get_user', {
        email: loginInfo.email,
        password: loginInfo.password,
      })
      .then((res) => {
        res.data
          ? setLoginInfo({
              isLoggedIn: true,
              email: '',
              password: '',
            })
          : setLoginInfo({
              isLoggedIn: false,
              email: '',
              password: '',
            })
      })
    event.preventDefault()
  }

  return (
    <div>
      {!loginInfo.isLoggedIn ? (
        <div className={styles.logininfo}>
          <form>
            <input
              type="text"
              name="email"
              value={loginInfo.email}
              placeholder="email"
              onChange={handleChange}
            />
            <input
              type="text"
              name="password"
              value={loginInfo.password}
              placeholder="password"
              onChange={handleChange}
            />
            <input type="submit" value="sign in" onClick={handleSignIn} />
          </form>
          <input type="button" value="sign up" />
        </div>
      ) : (
        'welcome user'
      )}
      <div className={styles.rightColumn}>
        {RightColumnProps.savedLicks.map((i) => (
          <div
            key={`RCdiv-${Math.random() + Date.now()}`}
            className={styles.savedLicks}
          >
            <span className={styles.lickName} onMouseEnter={handleHover}>
              {i}
            </span>
            <div className={styles.tooltip} id={`abcjs-saved-${i}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
