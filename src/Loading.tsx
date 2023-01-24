import styles from '../styles/Loading.module.scss'

export default function Loading(): JSX.Element {
    return (
        <div id={styles.loading_span}>
          Loading <br />
          <div id={styles.dot_one} className={styles.dots}>.</div> <br />
          <div id={styles.dot_two} className={styles.dots}>.</div> <br />
          <div id={styles.dot_three} className={styles.dots}>.</div>
        </div>
    );
  }