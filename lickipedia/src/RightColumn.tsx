import { renderAbc } from "abcjs";
import axios from "axios";
import { useState, useEffect } from "react";
import styles from "../styles/RightColumn.module.scss";
import { LoginState, feedItemType } from "./util";
import UserLogin from "./UserLogin";

export interface IRightColumnProps {
  savedLicks: string[];
  historyFeed: feedItemType[];
  savedNotation: feedItemType[];
  loginStatus: any;
  parentSelectedFromFeedItem: any;
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
  selectionColor: "#03DAC6",
  paddingright: 15,
};

export default function (RightColumnProps: IRightColumnProps) {
  const [loginInfo, setLoginInfo] = useState<boolean>(false);
  const [renderParent, setRenderParent] = useState<boolean>(false);
  const [nextAncestor, setNextAncestor] = useState<string>(
    RightColumnProps.parentSelectedFromFeedItem.parent
  );

  //this will need to be changed to an axios call
  const handleHover = () => {
    RightColumnProps.savedNotation.forEach((i) =>
      renderAbc(`abcjs-saved-${i.uuid}`, i.musicString, defaultSavedParams)
    );
  };
  useEffect(() => {
    setRenderParent(true);
    renderAbc(
      "parentContainer",
      RightColumnProps.parentSelectedFromFeedItem.music_string,
      defaultSavedParams
    );
    setNextAncestor(RightColumnProps.parentSelectedFromFeedItem.parent);
  }, [RightColumnProps.parentSelectedFromFeedItem]);

  useEffect(() => {
    if (renderParent === false) {
      renderAbc("parentContainer", "", defaultSavedParams);
    }
  }, [renderParent]);

  const handleClickParent = (): void => {
    axios
      .post("http://127.0.0.1:8000/api/getLick", {
        uuid: nextAncestor,
      })
      .then((res) => {
        renderAbc(
          "parentContainer",
          res.data[0].music_string,
          defaultSavedParams
        );
        setNextAncestor(res.data[0].parent);
      });
  };

  const setRightColumnState = (loginState: boolean) => {
    setLoginInfo(loginState);
  };

  return (
    <div className={styles.rightColumn}>
      <UserLogin
        loginInfo={loginInfo}
        setRightColumnState={setRightColumnState}
      />
      <div
        id="parentContainer"
        className={styles.parentLick}
        onClick={() => setRenderParent(false)}
      />
      <span onClick={handleClickParent} className={styles.parentLick}>
        {renderParent ? nextAncestor : ""}
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
  );
}
