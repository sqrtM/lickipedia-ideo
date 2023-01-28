'use client'
import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import styles from '../styles/Feed.module.scss'

import FeedItem from './FeedItem'
import RightColumn from './RightColumn'
import LeftColumn from './LeftColumn'
import { feedItemType, defaultFeedParams } from './util'

// why UUID? Because other serialization functions
// would cause different floating point problems and
// other weird issues. giving each lick a UUID means
// it will be easy to tell everything apart. We
// can also make unique URLs with this later.
import { v4 as uuidv4 } from 'uuid'
import { AbcVisualParams, Editor } from 'abcjs'
import axios from 'axios'
import Loading from './Loading'
const { parse: parsePostgres } = require('postgres-array')

export interface IFeedState {
  title: string
  key: string
  composer: string
  Clef: string
  music: string
  parent: string

  history: feedItemType[]

  savedNotation: feedItemType[]
  savedLicks: string[]

  editorShown: boolean
}

const defaultFeedState: IFeedState = {
  title: '',
  key: 'C',
  composer: '',
  Clef: 'treble',
  music: '',
  parent: '',
  history: [],

  savedNotation: [],
  savedLicks: [],

  editorShown: false,
}

/*
TODO : 
DONE ==== 1. change tuples to keyed objects. Tuples are cringe. (specifically with FeedItemType)
2. change the single STATE field into being a reducer, so it's a little cleaner. 
3. Either move the project to Vite or properly format it in Next. the current set up is inefficient. 
4. Fix the editor passive event listener problem. 
DONE ==== 5 (SEE NOTES). Create a USER sql table and re-write the RightColumn to connect to it. 
  (This is not properly implimented yet. the postgres table doesnt check for dupes, so we need to fix that
    also, the rendering only works on the most recent one. clean up the @retrieveSavedLick function so both
    of these functionalities can be impimented.)
6. Finish the CRUD commands.
    - Specifically, create an "admin" type of user who can DELETE and possibly even EDIT/PUT all posts.
    - perhaps allow users to EDIT/DELETE their own posts. maybe by saving the uuids of a user's posts and matching it against the post the user is attempting to edit. 
DONE ==== 7. Create a loading animation. Just something simple, like on the blog.  
8. Change the FeedItem component from being ALL a single thing to each being their own instance of the component.
9. Make good javadoc documentation for everything
*/

export default function Feed(): JSX.Element {
  const [feedItemList, setFeedItemList] = useState<IFeedState>(defaultFeedState)
  const [loading, setLoading] = useState<boolean>(false)
  const [parentLoginInfo, setParentLoginInfo] = useState({
    isLoggedIn: false,
    email: '',
    password: '',
  })
  const [getParentFromFeedItem, setParentFromFeedItem] = useState({date: "", music_string: "", parent: "", uuid: ""});

  useEffect(() => {
    new Editor('music', {
      canvas_id: 'paper',
      warnings_id: 'warnings',
      abcjsParams: defaultFeedParams,
    })
  }, [feedItemList.editorShown])

  useEffect(() => {
    setLoading(true)
    refreshFeed()
  }, [feedItemList.savedNotation])

  useEffect(() => {
    if (parentLoginInfo.isLoggedIn) {
      axios
        .post('http://127.0.0.1:8000/api/users/licks', {
          email: parentLoginInfo.email,
        })
        .then((res) => {
          setFeedItemList({ ...feedItemList, savedNotation: res.data })
        })
    }
  }, [parentLoginInfo])

  function handleChange(event: { target: { name: string; value: any } }): void {
    const target = event.target
    const name = target.name
    setFeedItemList({
      ...feedItemList,
      [name]: event.target.value,
    })
  }

  // this formats a UUID, a tuneString, the default parameters;
  // and a locale string which gets sent into the history
  // to be sent into the FeedItems.
  function handleSubmit(event: { preventDefault: () => void }): void {
    setLoading(true)
    let newMusicString: string = `T:${feedItemList.title}\nM:4/4\nC:${feedItemList.composer}\nK:${feedItemList.key} clef=${feedItemList.Clef}\n${feedItemList.music}`
    let params: AbcVisualParams = defaultFeedParams
    let newFeedItem: feedItemType = {
      uuid: uuidv4(),
      musicString: newMusicString,
      params: params,
      parent: feedItemList.parent,
      date: new Date().toLocaleString(),
    }
    axios.post('http://127.0.0.1:8000/api/licks', {
      uuid: newFeedItem.uuid,
      music_string: newFeedItem.musicString,
      parent: newFeedItem.parent,
      date: newFeedItem.date,
    })
    alert('The following lick has been submitted: ' + newMusicString)
    event.preventDefault()
    setFeedItemList({
      ...feedItemList, // clear state on submit.
      title: '',
      key: 'C',
      composer: '',
      Clef: 'treble',
      music: '',
      parent: '',

      editorShown: false,
    })
    refreshFeed()
  }

  // this takes the saved licks from the FeedItem component and sends them to be state,
  // so they can be sent to the RightColumn.
  // there is almost certainly a MUCH more efficent way to do this...
  function retrieveSavedLicks(id: string): void {
    if (!parentLoginInfo.isLoggedIn) {
      let newSavedNotation: feedItemType[] = [...feedItemList.savedNotation]
      if (!feedItemList.savedLicks.includes(id)) {
        feedItemList.history.forEach((j) => {
          if (!feedItemList.savedLicks.includes(j.uuid)) {
            newSavedNotation.unshift(j)
          }
        })
        setFeedItemList({
          ...feedItemList,
          savedLicks: [...feedItemList.savedLicks, id],
          savedNotation: [...newSavedNotation],
        })
      }
    } else {
      let newSavedNotation: feedItemType[]
      axios.patch('http://127.0.0.1:8000/api/users/licks', {
        email: parentLoginInfo.email,
        uuid: id,
      })
      axios
        .post('http://127.0.0.1:8000/api/users/licks', {
          email: parentLoginInfo.email,
        })
        .then((res) => {
          newSavedNotation = parsePostgres(res.data[0].saved_licks) //looks ugly, but just parses the postgres array.
          if (!feedItemList.savedLicks.includes(id)) {
            feedItemList.history.forEach((j) => {
              if (!feedItemList.savedLicks.includes(j.uuid)) {
                newSavedNotation.unshift(j)
              }
            })
            setFeedItemList({
              ...feedItemList,
              savedLicks: [...feedItemList.savedLicks, id],
              savedNotation: [...newSavedNotation],
            })
          }
        })
    }
  }

  /** 
   * take the info from a forked lick and 
   * put it into state. this will populate 
   * the text fields and create the readonly 
   * parent field to put on the new child lick
  */ 
  const recieveFork = (fork: feedItemType): void => {
    // lots of string manip to get the 'tune object'
    // to split properly into the different text fields
    let musicArray = fork.musicString.split(`\n`, 5)
    setFeedItemList({
      ...feedItemList,
      title: musicArray[0].split(':')[1],
      composer: musicArray[2].split(':')[1],
      key: musicArray[3].split(':')[1].split(' ')[0],
      Clef: musicArray[3].split('=')[1],
      music: musicArray[4],
      parent: fork.uuid,
    })
  }

  const refreshFeed = (): void => {
    axios.get('http://127.0.0.1:8000/api/licks').then((res) => {
      let newhist: feedItemType[] = []
      for (let i = 0; i < res.data.length; i++) {
        newhist.unshift({
          uuid: res.data[i].uuid,
          musicString: res.data[i].music_string,
          params: defaultFeedParams,
          parent: res.data[i].parent,
          date: res.data[i].date,
        })
      }
      setFeedItemList({
        ...feedItemList,
        title: '',
        key: 'C',
        composer: '',
        Clef: 'treble',
        music: '',
        parent: '',
        history: newhist,
        editorShown: false
      })
    })
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <div id={styles.window}>
      <div id={styles.WindowLeftCol}>
        <LeftColumn />
      </div>
      <div className={styles.feed}>
        <div id={styles.inputfield}>
          <form id={styles.form} onSubmit={handleSubmit}>
            <label>
              <span id={styles.inputTopRow}>
                <input
                  type="text"
                  name="title"
                  placeholder="title"
                  value={feedItemList.title}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="key"
                  placeholder="key"
                  value={feedItemList.key}
                  onChange={handleChange}
                />
              </span>
              <span className={styles.inputRowRow}>
                <input
                  type="text"
                  name="composer"
                  placeholder="composer"
                  value={feedItemList.composer}
                  onChange={handleChange}
                />
                <span id={styles.radio}>
                  <input
                    type="radio"
                    name="Clef"
                    value="treble"
                    onChange={handleChange}
                    checked={feedItemList.Clef === 'treble'}
                  />{' '}
                  treble
                  <input
                    type="radio"
                    name="Clef"
                    value="bass"
                    onChange={handleChange}
                    checked={feedItemList.Clef === 'bass'}
                  />{' '}
                  bass
                </span>
              </span>
              <div className={styles.inputRowCol}>
                <TextareaAutosize
                  name="music"
                  id="music"
                  placeholder="music"
                  value={feedItemList.music}
                  onChange={handleChange}
                  minRows={1}
                />
                <span className={styles.parent}>
                  {feedItemList.parent && (
                    <input
                      type="textarea"
                      value={feedItemList.parent}
                      readOnly
                    />
                  )}
                </span>
              </div>
            </label>
            <input
              type="button"
              name="editor"
              value="editor"
              onClick={() =>
                setFeedItemList({
                  ...feedItemList,
                  editorShown: !feedItemList.editorShown,
                })
              }
            />
            {feedItemList.editorShown && (
              <div>
                <div id="paper"></div>
                <div id="warnings" style={{ color: '#BB68FC' }}></div>
              </div>
            )}
            <input type="submit" value="submit" />
          </form>
        </div>
        <div>
          {loading ? (
            <Loading />
          ) : (
            <FeedItem
              historyFeed={feedItemList.history}
              parserParams={defaultFeedParams}
              retrieveSavedLicks={retrieveSavedLicks}
              recieveFork={recieveFork}
              refresh={refreshFeed}
              getParentFromFeedItem={setParentFromFeedItem}
            />
          )}
        </div>
      </div>
      <div id={styles.WindowRightCol}>
        <RightColumn
          savedLicks={feedItemList.savedLicks}
          historyFeed={feedItemList.history}
          savedNotation={feedItemList.savedNotation}
          loginStatus={setParentLoginInfo}
          parentSelectedFromFeedItem={getParentFromFeedItem}
        />
      </div>
    </div>
  )
}
