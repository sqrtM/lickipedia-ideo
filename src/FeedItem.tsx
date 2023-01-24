import styles from '../styles/FeedItem.module.scss'
import AbcVisualParams from 'abcjs'
import { feedItemType, renderAbcNotation } from './util'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from './Loading'

interface IFeedItemProps {
  parserParams: AbcVisualParams.AbcVisualParams
  retrieveSavedLicks: (i: string) => void
  recieveFork: (i: feedItemType) => void
  historyFeed: feedItemType[]
  refresh: () => void
}

export default function FeedItem(FeedItemProps: IFeedItemProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    FeedItemProps.historyFeed?.forEach((i) =>
      renderAbcNotation(i.uuid, i.musicString, i.params),
    )
  })

  const saveLick = (s: string): void => {
    FeedItemProps.retrieveSavedLicks(s)
  }
  const handleTranspose = (e: any, i: feedItemType): void =>
    renderAbcNotation(i.uuid, i.musicString, {
      ...i.params,
      visualTranspose: +e.target.value,
    })
  const handleFork = (i: feedItemType): void => {
    FeedItemProps.recieveFork(i)
  }
  const handleDelete = (i: string): void => {
    setLoading(true)
    axios.delete('http://127.0.0.1:8000/api/licks', { data: { uuid: i } })
    FeedItemProps.refresh()
    setTimeout(() => setLoading(false), 2000)
  }

  return loading ? (
    <Loading />
  ) : (
    <div
      className={styles.feedContainer}
      style={{ width: '-webkit-fill-available' }}
    >
      {FeedItemProps.historyFeed?.map((i) => (
        <div key={Date.now() + Math.random()}>
          <div id={`abcjs-result-${i.uuid}`} className={styles.feeditem} />
          <span className={styles.feedButtons}>
            <button onClick={() => saveLick(i.uuid)}>save</button>
            <button onClick={() => handleFork(i)}>fork</button>
            <span>
              transposition
              <input
                type="number"
                min="-24"
                max="24"
                placeholder="0"
                onChange={(e) => handleTranspose(e, i)}
              />
            </span>
            {i.parent} <span id={styles.date}>{i.date}</span>
            <input
              type="button"
              value="delete"
              id={styles.delete}
              onClick={() => handleDelete(i.uuid)}
            />
          </span>
        </div>
      ))}
    </div>
  )
}
