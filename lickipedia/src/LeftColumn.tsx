import styles from '../styles/LeftColumn.module.scss'

export default function LeftColumn(): JSX.Element {

    return (
      <div id={styles.LeftColumn}>
        <div className={styles.title}>
          Lickipedia
        </div>
      </div>
    );
  }