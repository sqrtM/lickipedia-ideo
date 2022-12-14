import styles from '../styles/FeedItem.module.scss'
import AbcVisualParams from 'abcjs'
import { feedItemType, renderAbcNotation } from "./util"
import { useEffect } from 'react';

interface IFeedItemProps {
  parserParams: AbcVisualParams.AbcVisualParams,
  retrieveSavedLicks: (i: string) => void;
  recieveFork: (i: feedItemType) => void;
  historyFeed: feedItemType[];
}

export default function FeedItem(FeedItemProps: IFeedItemProps): JSX.Element {

  useEffect(() => { FeedItemProps.historyFeed?.forEach(i => renderAbcNotation(i[0], i[1], i[2])) })

  const saveLick = (s: string): void => { FeedItemProps.retrieveSavedLicks(s) }
  const handleTranspose = (e: any, i: feedItemType): void => renderAbcNotation(i[0], i[1], { ...i[2], visualTranspose: +e.target.value });
  const handleFork = (i: feedItemType): void => { FeedItemProps.recieveFork(i) }

  return (
    <div className={styles.feedContainer} style={{ width: "-webkit-fill-available" }}>
      {FeedItemProps.historyFeed?.map(i =>
        <div key={Date.now() + Math.random()}>
          <div id={`abcjs-result-${i[0]}`} className={styles.feeditem} />
          <span className={styles.feedButtons}>
            <button onClick={() => saveLick(i[0])}>save</button>
            <button onClick={() => handleFork(i)}>fork</button>
            <span>transposition<input type='number' min='-24' max='24' placeholder='0' onChange={(e) => handleTranspose(e, i)} /></span>
            {i[3]} <span id={styles.date}>{i[4]}</span>
          </span>
        </div>)}
    </div>
  );
}