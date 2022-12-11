import { renderAbc } from 'abcjs';
import { useState } from 'react';
import styles from '../styles/RightColumn.module.scss'
import { feedItemType } from "./util"

export interface IRightColumnProps {
  savedLicks: string[],
  historyFeed: feedItemType[],
  savedNotation: feedItemType[],
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
    maxSpacing: 0
  },
  jazzchords: true,
  selectionColor: "#03DAC6",
  paddingright: 15,
}


export default function RightColumn(RightColumnProps: IRightColumnProps) {

  const [loginInfo, setLoginInfo] = useState({
    isLoggedIn: false,
    user: "",
    pass: "",
  });

  const handleHover = () => RightColumnProps.savedNotation.forEach(i => renderAbc(`abcjs-saved-${i[0]}`, i[1], defaultSavedParams));
  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    setLoginInfo({
      ...loginInfo,
      [name]: event.target.value,
    });
  }
  const handleSignIn = (event: any) => {
    event.preventDefault();
    fetch("http://127.0.0.1:8090/api/users")
      .then((res) => res.json())
      .then((json) => {
        console.log(json)})
    setLoginInfo({
      ...loginInfo,
      user: "",
      pass: ""
    })
  }

  return (
    <div>
      {!loginInfo.isLoggedIn ? <div className={styles.logininfo}>
        <form>
          <input type="text" name="user" value={loginInfo.user} placeholder="user" onChange={handleChange} />
          <input type="text" name="pass" value={loginInfo.pass} placeholder="pass" onChange={handleChange} />
          <input type="submit" value="sign in" onClick={handleSignIn} />
        </form>
        <input type="button" value="sign up" />
      </div> : "welcome user" }
      <div className={styles.rightColumn}>
        {RightColumnProps.savedLicks.map(i =>
          <div key={`RCdiv-${Math.random() + Date.now()}`} className={styles.savedLicks}>
            <span className={styles.lickName} onMouseEnter={handleHover} >{i}</span>
            <div className={styles.tooltip} id={`abcjs-saved-${i}`} />
          </div>
        )}
      </div>
    </div>
  );
}
