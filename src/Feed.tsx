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

/*
TODO : 
1. change tuples to objects. Tuples are cringe. (specifically with FeedItemType)
2. change the single STATE field into being a reducer, so it's a little cleaner. 
3. Either move the project to Vite or properly format it in Next. the current set up is inefficient. 
4. Fix the editor passive event listener problem. It's slowing the page down like crazy. 
5. Create a USER sql table and re-write the RightColumn to connect to it. 
6. Finish the CRUD commands.
    - Specifically, create an "admin" type of user who can DELETE and EDIT all posts.
    - perhaps allow users to EDIT their own posts. maybe by saving the uuids of a user's posts and matching it against the post the user is attempting to edit. 
7. Create a loading animation. Just something simple, like on the blog.  
*/

export default function Feed(): JSX.Element {
  const [feedItemList, setFeedItemList] = useState<IFeedState>({
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
  });

  useEffect(() => {
    new Editor('music', {
      canvas_id: 'paper',
      warnings_id: 'warnings',
      abcjsParams: defaultFeedParams,
    });
  }, [feedItemList.editorShown]);

  useEffect(() => {
    refreshFeed();
  }, [feedItemList.savedNotation]);

  function handleChange(event: { target: { name: string; value: any } }): void {
    const target = event.target
    const name = target.name
    setFeedItemList({
      ...feedItemList,
      [name]: event.target.value,
    });
  }

  // this formats a UUID, a tuneString, the default parameters;
  // and a locale string which gets sent into the history
  // to be sent into the FeedItems.
  function handleSubmit(event: { preventDefault: () => void }) {
    let newString: string = `T:${feedItemList.title}\nM:4/4\nC:${feedItemList.composer}\nK:${feedItemList.key} clef=${feedItemList.Clef}\n${feedItemList.music}`
    let params: AbcVisualParams = defaultFeedParams
    let newFeedItem: feedItemType = [
      uuidv4(),
      newString,
      params,
      feedItemList.parent,
      new Date().toLocaleString(),
    ];
    axios.post('http://127.0.0.1:8000/api/licks', {
      uuid: newFeedItem[0],
      music_string: newFeedItem[1],
      parent: newFeedItem[3],
      date: newFeedItem[4],
    });
    alert('The following lick has been submitted: ' + newString)
    event.preventDefault();
    setFeedItemList({
      ...feedItemList, // clear state on submit.
      title: '',
      key: 'C',
      composer: '',
      Clef: 'treble',
      music: '',
      parent: '',

      editorShown: false,
    });
    refreshFeed();
  }

  // this takes the saved licks from the FeedItem component and sends them to be state,
  // so they can be sent to the RightColumn.
  function retrieveSavedLicks(id: string): void {
    let newSavedNotation: feedItemType[] = [...feedItemList.savedNotation]
    if (!feedItemList.savedLicks.includes(id)) {
      feedItemList.history.forEach((j) => {
        if (j.includes(id)) {
          newSavedNotation.unshift(j);
        }
      })
      setFeedItemList({
        ...feedItemList,
        savedLicks: [...feedItemList.savedLicks, id],
        savedNotation: [...newSavedNotation],
      });
    }
  }

  // take the info from a forked lick and
  // put it into state. this will populate
  // the text fields and create the readonly
  // parent field to put on the new child lick
  const recieveFork = (fork: feedItemType): void => {
    // lots of string manip to get the 'tune object'
    // to split properly into the different text fields
    let musicArray = fork[1].split(`\n`, 5)
    setFeedItemList({
      ...feedItemList,
      title: musicArray[0].split(':')[1],
      composer: musicArray[2].split(':')[1],
      key: musicArray[3].split(':')[1].split(' ')[0],
      Clef: musicArray[3].split('=')[1],
      music: musicArray[4],
      parent: fork[0],
    });
  }

  const refreshFeed = (): void => {
    axios.get('http://127.0.0.1:8000/api/licks').then((res) => {
      let newhist: feedItemType[] = [];
      for (let i = 0; i < res.data.length; i++) {
        newhist.unshift([
          res.data[i].uuid,
          res.data[i].music_string,
          defaultFeedParams,
          res.data[i].parent,
          res.data[i].date,
        ]);
      }
      setFeedItemList({
        ...feedItemList,
        history: newhist,
      });
    });
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
          <FeedItem
            historyFeed={feedItemList.history}
            parserParams={defaultFeedParams}
            retrieveSavedLicks={retrieveSavedLicks}
            recieveFork={recieveFork}
            refresh={refreshFeed}
          />
        </div>
      </div>
      <div id={styles.WindowRightCol}>
        <RightColumn
          savedLicks={feedItemList.savedLicks}
          historyFeed={feedItemList.history}
          savedNotation={feedItemList.savedNotation}
        />
      </div>
    </div>
  )
}
