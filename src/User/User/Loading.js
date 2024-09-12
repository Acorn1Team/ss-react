import styles from "../Style/Loading.module.css";

function Loading() {
  return (
    <div class={styles.loaderOverlay}>
      <div class={styles.loader}></div>
    </div>
  );
}
export default Loading;
