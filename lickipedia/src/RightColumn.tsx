import { renderAbc } from 'abcjs'
import axios from 'axios'
import { useState, useEffect } from 'react'
import styles from '../styles/RightColumn.module.scss'
import { feedItemType } from './util'

export interface IRightColumnProps {
  savedLicks: string[]
  historyFeed: feedItemType[]
  savedNotation: feedItemType[]
  loginStatus: any
  parentSelectedFromFeedItem: any
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

  const [renderParent, setRenderParent] = useState(false)
  const [nextAncestor, setNextAncestor] = useState<string>(
    RightColumnProps.parentSelectedFromFeedItem.parent,
  )
  const [loading, setLoading] = useState<boolean>(false)


  //this will need to be changed to an axios call
  const handleHover = () => {
    RightColumnProps.savedNotation.forEach((i) =>
      renderAbc(`abcjs-saved-${i.uuid}`, i.musicString, defaultSavedParams),
    )
  }

  const handleChange = (event: any) => {
    const target = event.target
    const name = target.name
    setLoginInfo({
      ...loginInfo,
      [name]: event.target.value,
    })
  }

  /**
   * connect to postgres via PHP controller.
   * if the return statement is true, login was successful.
   *
   * @todo add a REAL pop up that tells you that the login was (un)successful
   */
  const handleSignIn = (event: any): void => {
    axios
      .post('http://127.0.0.1:8000/api/loginUser', {
        email: loginInfo.email,
        password: loginInfo.password,
      })
      .then((res) => {
        if (res.data) {
          RightColumnProps.loginStatus({
            isLoggedIn: true,
            email: loginInfo.email,
            password: loginInfo.password,
          })
          setLoginInfo({
            isLoggedIn: true,
            email: '',
            password: '',
          })
          alert('login successful')
        } else {
          setLoginInfo({
            isLoggedIn: false,
            email: '',
            password: '',
          })
          alert('login unsuccessful')
        }
      })
    event.preventDefault()
  }

  const handleLogout = () => {
    setLoginInfo({ isLoggedIn: false, email: '', password: '' })
    RightColumnProps.loginStatus({ isLoggedIn: false, email: '', password: '' })
    alert('successfully logged out. come back soon.')
  }

  const handleSignUp = (event: any) => {
    axios
      .post('http://127.0.0.1:8000/api/createUser', {
        email: loginInfo.email,
        password: loginInfo.password,
      })
      .then((res) => {
        if (res.data) {
          RightColumnProps.loginStatus({
            isLoggedIn: true,
            email: loginInfo.email,
            password: loginInfo.password,
          })
          setLoginInfo({
            isLoggedIn: true,
            email: '',
            password: '',
          })
          alert('account successfully created')
        } else {
          setLoginInfo({
            isLoggedIn: false,
            email: '',
            password: '',
          })
          alert('problem with account creation. please try again.')
        }
      })
    event.preventDefault()
  }

  useEffect(() => {
    setRenderParent(true)
    renderAbc(
      'parentContainer',
      RightColumnProps.parentSelectedFromFeedItem.music_string,
      defaultSavedParams,
    )
    setNextAncestor(RightColumnProps.parentSelectedFromFeedItem.parent)
  }, [RightColumnProps.parentSelectedFromFeedItem])

  useEffect(() => {
    if (renderParent === false) {
      renderAbc('parentContainer', '', defaultSavedParams)
    }
  }, [renderParent])

  const handleClickParent = (): void => {
    axios
      .post('http://127.0.0.1:8000/api/getLick', {
        uuid: nextAncestor,
      })
      .then((res) => {
        renderAbc(
          'parentContainer',
          res.data[0].music_string,
          defaultSavedParams,
        )
        setNextAncestor(res.data[0].parent)
      })
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
          <input type="button" value="sign up" onClick={handleSignUp} />
        </div>
      ) : (
        <div>
          welcome user
          <input type="button" value="logout" onClick={handleLogout} />
          <div />
        </div>
      )}
      <div className={styles.rightColumn}>
        <div
          id="parentContainer"
          className={styles.parentLick}
          onClick={() => setRenderParent(false)}
        />
        <span onClick={handleClickParent} className={styles.parentLick}>
          {renderParent ? nextAncestor : ''}
        </span>
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