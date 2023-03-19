import axios from "axios";
import { useEffect, useState } from "react";
import { renderAbc } from "abcjs";
import ButtonSpan from "./ButtonSpan";
import { feedItemType } from "./util";

export interface IAppProps {
  parentUuid: string;
  isFetching: boolean;
  liftFetching: (i: boolean) => void;
  feedItemMember: feedItemType;
  retrieveSavedLicks: (i: string) => void;
  recieveFork: (i: feedItemType) => void;
}

/**
 * put this in the extra stuff fichier
 */
const defaultSavedParams = {
  staffwidth: 525,
  wrap: {
    preferredMeasuresPerLine: 4,
    minSpacing: 0,
    maxSpacing: 0,
  },
  jazzchords: true,
  foregroundColor: "#03DAC6",
  selectionColor: "#BB68FC",
  paddingright: 15,
};

/**
 * FORK does not work.
 * SAVE almost works, but saves the wrong UUID.
 * 
 * @todo CREATE AN INTERFACE WHICH MERGES ALL THE RE-USED
 * FUNCTIONS ACROSS THE BUTTONS AND THE PARENT AND THE 
 * FEEDITEMS. Then, we can just call FROM that interface.
 * @param props 
 * @returns JSX.Element
 */
export default function (props: IAppProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [parentInfo, setParentInfo] = useState<feedItemType>({
    uuid: "",
    musicString: "",
    params: defaultSavedParams,
    parent: "",
    date: "",
  });

  /**
   * Calls PostgresDB to find the parent of a given lick.
   */
  useEffect(() => {
    console.log("trying to render. current state is " + props.isFetching);
    if (props.isFetching) {
      console.log("busy");
    } else {
      props.liftFetching(true);
      axios
        .post("http://127.0.0.1:8000/api/getLick", { uuid: props.parentUuid })
        .then((res) => {
          console.log(res.data[0]);
          if (res.data.length > 0) {
            renderAbc(
              `abcjs-result-${props.parentUuid + "-parent"}`,
              res.data[0].music_string,
              defaultSavedParams
            );
            setParentInfo({...res.data[0], uuid: res.data[0].uuid + "-parent"});
            props.liftFetching(false);
          } else {
            alert("parent no longer exists");
          }
          setLoading(false);
        });
    }
  }, []);

  return loading ? (
    <>loading...</>
  ) : (
    <div>
      <div id={`abcjs-result-${props.parentUuid + "-parent"}`} />
      <span>
        <ButtonSpan
          feedItemMember={parentInfo}
          retrieveSavedLicks={props.retrieveSavedLicks}
          recieveFork={props.recieveFork}
        />
        <input type="button" value="next ancestor" />
      </span>
    </div>
  );
}
