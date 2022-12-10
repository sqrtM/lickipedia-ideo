
import styles from '../styles/FeedItem.module.scss'
import AbcVisualParams from 'abcjs'
import { feedItemType, renderAbcNotation, defaultFeedParams } from './util';
import { useEffect } from 'react';

import PocketBase from 'pocketbase';
const client = new PocketBase('http://127.0.0.1:8090');

type pocketFeed = {
  uuid: string;
  musicstring: string;
  parent: string,
  date: string
}

async function getFeed() {
  const res = await fetch("http://127.0.0.1:8090/api/collections/licks/records");
  const data = await res.json();
  return data?.items as pocketFeed[];
}

interface IFeedItemProps {
  parserParams: AbcVisualParams.AbcVisualParams,
  retrieveSavedLicks: (i: string) => void;
  recieveFork: (i: feedItemType) => void;
  historyFeed: feedItemType[];
}

export async function FeedItem(FeedItemProps: IFeedItemProps): Promise<JSX.Element> {

  const feed = await getFeed();

  return (
    <div className={styles.feedContainer} style={{ width: "-webkit-fill-available" }}>
      {feed?.map(i => { return <FeedList FeedItems={i} FeedItemProps={FeedItemProps} /> })}
    </div>
  );
}

export default function FeedList(props: { FeedItemProps: IFeedItemProps; FeedItems: pocketFeed; }): JSX.Element {

  useEffect(() => { props.FeedItemProps.historyFeed.forEach(i => renderAbcNotation(i[0], i[1], i[2])) })

  const saveLick = (s: string): void => { props.FeedItemProps.retrieveSavedLicks(s) }
  const handleTranspose = (e: any, i: feedItemType): void => renderAbcNotation(i[0], i[1], { ...i[2], visualTranspose: +e.target.value });
  const handleFork = (i: feedItemType): void => { props.FeedItemProps.recieveFork(i) }

  return (
    <div className={styles.feedContainer} style={{ width: "-webkit-fill-available" }}>
      <div key={Date.now() + Math.random()}>
        <div id={`abcjs-result-${props.FeedItems.uuid}`} className={styles.feeditem} />
        <span className={styles.feedButtons}>
          <button onClick={() => saveLick(props.FeedItems.uuid)}>save</button>
          <button onClick={() => handleFork([props.FeedItems.uuid, props.FeedItems.musicstring, defaultFeedParams, props.FeedItems.parent, props.FeedItems.date])}>fork</button>
          <span>transposition<input type='number' min='-24' max='24' placeholder='0' onChange={(e) => handleTranspose(e, [props.FeedItems.uuid, props.FeedItems.musicstring, defaultFeedParams, props.FeedItems.parent, props.FeedItems.date])} /></span>
          {props.FeedItems.parent} <span id={styles.date}>{props.FeedItems.date}</span>
        </span>
      </div>
    </div>
  );
}