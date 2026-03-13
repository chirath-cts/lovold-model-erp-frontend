import Workspaces from "@mui/icons-material/Workspaces"; 

import styles from "./LoadingOverlay.module.scss";

const LoadingOverlay = () => {
  return (
    <div className={styles.loadingOverlay}>
      <Workspaces className={styles.customLoadingIcon} />
    </div>
  );
};

export default LoadingOverlay;
