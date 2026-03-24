import styles from "./EnvironmentLabel.module.scss";

const label = import.meta.env.VITE_ENV_LABEL;

export default function EnvironmentLabel() {
  if (!label) return null;

  return (
    <div className={styles.envLabel}>
      <p>{label}</p>
    </div>
  );
}