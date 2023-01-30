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

  feedItemMember: feedItemType

  refresh: () => void
  getParentFromFeedItem: any
}

/**
 * Individual items on the feed.
 */
export default function FeedItem(FeedItemProps: IFeedItemProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * If any given item is updated in any way, this will redraw the music notation
   * associated with it.
   */
  useEffect(() => {
    renderAbcNotation(
      FeedItemProps.feedItemMember.uuid,
      FeedItemProps.feedItemMember.musicString,
      FeedItemProps.feedItemMember.params,
    )
  }, [])

  /**
   * Calls the parent function and saves the lick to the RightColumn.
   */
  const saveLick = (s: string): void => {
    FeedItemProps.retrieveSavedLicks(s)
  }
  /**
   * Redraws the music notation according to the given visualTranspose value.
   */
  const handleTranspose = (e: any, i: feedItemType): void =>
    renderAbcNotation(i.uuid, i.musicString, {
      ...i.params,
      visualTranspose: +e.target.value,
    })

  /**
   * Calls parent function and forks the given lick.
   */
  const handleFork = (i: feedItemType): void => {
    FeedItemProps.recieveFork(i)
  }

  /**
   * Deletes the lick from feed and PostgresDB.
   */
  const handleDelete = (i: string): void => {
    setLoading(true)
    axios.delete('http://127.0.0.1:8000/api/licks', { data: { uuid: i } })
    FeedItemProps.refresh()
    setTimeout(() => setLoading(false), 1000)
  }

  /**
   * Calls PostgresDB to find the parent of a given lick.
   */
  const handleClickParent = (i: string): void => {
    axios.post('http://127.0.0.1:8000/api/getLick', { uuid: i }).then((res) => {
      res.data.length > 0 ? FeedItemProps.getParentFromFeedItem(res.data[0]) : alert("parent no longer exists")
    })
  }

  return loading ? (
    <Loading />
  ) : (
    <div
      className={styles.feedContainer}
      style={{ width: '-webkit-fill-available' }}
    >
      {
        <div key={FeedItemProps.feedItemMember.uuid}>
          <div
            id={`abcjs-result-${FeedItemProps.feedItemMember.uuid}`}
            className={styles.feeditem}
          />
          <span className={styles.feedButtons}>
            <button onClick={() => saveLick(FeedItemProps.feedItemMember.uuid)}>
              save
            </button>
            <button onClick={() => handleFork(FeedItemProps.feedItemMember)}>
              fork
            </button>
            <span>
              transposition
              <input
                type="number"
                min="-24"
                max="24"
                placeholder="0"
                onChange={(e) =>
                  handleTranspose(e, FeedItemProps.feedItemMember)
                }
              />
            </span>
            <span
              style={{ textDecoration: 'underline dotted' }}
              onClick={() =>
                handleClickParent(FeedItemProps.feedItemMember.parent)
              }
            >
              {FeedItemProps.feedItemMember.parent}
            </span>
            <span id={styles.date}>{FeedItemProps.feedItemMember.date}</span>
            <input
              type="button"
              value="delete"
              id={styles.delete}
              onClick={() => handleDelete(FeedItemProps.feedItemMember.uuid)}
            />
          </span>
        </div>
      }
    </div>
  )
}
