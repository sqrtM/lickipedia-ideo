import styles from '../styles/Feed.module.scss'
import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface InputFieldProps {
  
}

export default function (): JSX.Element {
  
  return (
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
                checked={feedItemList.Clef === "treble"}
              />{" "}
              𝄞
              <input
                type="radio"
                name="Clef"
                value="bass"
                onChange={handleChange}
                checked={feedItemList.Clef === "bass"}
              />{" "}
              𝄢
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
                <input type="textarea" value={feedItemList.parent} readOnly />
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
            <div id="warnings" style={{ color: "#BB68FC" }}></div>
          </div>
        )}
        <input type="submit" value="submit" />
      </form>
    </div>
  );
}
