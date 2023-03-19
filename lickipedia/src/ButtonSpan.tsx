import { feedItemType, renderAbcNotation } from "./util";
import styles from "../styles/ButtonSpan.module.scss";


interface ButtonSpanProps {
  feedItemMember: feedItemType;
  retrieveSavedLicks: (i: string) => void;
  recieveFork: (i: feedItemType) => void;
}

export default function (buttonSpanProps: ButtonSpanProps) {
  
  /**
   * Calls the parent function and saves the lick to the RightColumn.
   */
  const saveLick = (s: string): void => {
    buttonSpanProps.retrieveSavedLicks(s);
  };
  /**
   * Redraws the music notation according to the given visualTranspose value.
   */
  const handleTranspose = (e: any, i: feedItemType): void =>
    renderAbcNotation(i.uuid, i.musicString, {
      ...i.params,
      visualTranspose: +e.target.value,
    });

  /**
   * Calls parent function and forks the given lick.
   */
  const handleFork = (i: feedItemType): void => {
    buttonSpanProps.recieveFork(i);
  };
  
  return(
    <span className={styles.feedButtons}>
    <button onClick={() => saveLick(buttonSpanProps.feedItemMember.uuid)}>
      save
    </button>
    <button onClick={() => handleFork(buttonSpanProps.feedItemMember)}>
      fork
    </button>
    <span>
      transposition
      <input
        type="number"
        min="-24"
        max="24"
        placeholder="0"
        onChange={(e) => handleTranspose(e, buttonSpanProps.feedItemMember)}
      />
    </span>
  </span>
  )
}
