import styles from "../styles/FeedItem.module.scss";
import AbcVisualParams from "abcjs";
import { feedItemType, renderAbcNotation } from "./util";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import { Tooltip } from "react-tooltip";
import ParentView from "./ParentView";
import ButtonSpan from "./ButtonSpan";

interface IFeedItemProps {
  parserParams: AbcVisualParams.AbcVisualParams;
  feedItemMember: feedItemType;
  getParentFromFeedItem: any;
  retrieveSavedLicks: (i: string) => void;
  recieveFork: (i: feedItemType) => void;
  refresh: () => void;
}

/**
 * Individual items on the feed.
 */
export default function (FeedItemProps: IFeedItemProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [isParentCurrentlyFetching, setParentCurrentlyFetching] =
    useState<boolean>(false);

  /**
   * If any given item is updated in any way, this will redraw the music notation
   * associated with it.
   */
  useEffect(() => {
    renderAbcNotation(
      FeedItemProps.feedItemMember.uuid,
      FeedItemProps.feedItemMember.musicString,
      FeedItemProps.feedItemMember.params
    );
  }, []);

  /**
   * Deletes the lick from feed and PostgresDB.
   */
  const handleDelete = (i: string): void => {
    setLoading(true);
    axios.delete("http://127.0.0.1:8000/api/licks", { data: { uuid: i } });
    FeedItemProps.refresh();
    setTimeout(() => setLoading(false), 1000);
  };

  const recieveFetchingState = (isFetching: boolean): void => {
    console.log("changing state to " + isParentCurrentlyFetching);
    setParentCurrentlyFetching(isFetching);
  };

  return loading ? (
    <Loading />
  ) : (
    <div
      className={styles.feedContainer}
      style={{ width: "-webkit-fill-available" }}
    >
      {
        <div key={FeedItemProps.feedItemMember.uuid}>
          <div
            id={`abcjs-result-${FeedItemProps.feedItemMember.uuid}`}
            className={styles.feeditem}
          />
          <span className={styles.feedButtons}>
            <ButtonSpan
              feedItemMember={FeedItemProps.feedItemMember}
              retrieveSavedLicks={FeedItemProps.retrieveSavedLicks}
              recieveFork={FeedItemProps.recieveFork}
            />
            <span style={{ textDecoration: "underline dotted" }}>
              <a
                className={
                  "tooltip-parent-anchor" + FeedItemProps.feedItemMember.uuid
                }
              >
                {FeedItemProps.feedItemMember.parent}
              </a>
              <Tooltip
                anchorSelect={
                  ".tooltip-parent-anchor" + FeedItemProps.feedItemMember.uuid
                }
                className={styles.tooltip}
                delayHide={1000}
                float
                clickable
              >
                <ParentView
                  parentUuid={FeedItemProps.feedItemMember.parent}
                  isFetching={isParentCurrentlyFetching}
                  liftFetching={recieveFetchingState}
                  feedItemMember={FeedItemProps.feedItemMember}
                  retrieveSavedLicks={FeedItemProps.retrieveSavedLicks}
                  recieveFork={FeedItemProps.recieveFork}
                />
              </Tooltip>
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
  );
}
