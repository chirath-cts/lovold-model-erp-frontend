import { ToastContainer } from "react-toastify";
import EnvironmentLabel from "components/layout/EnvironmentLabel/EnvironmentLabel";
import AppRouter from "routes/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
      <EnvironmentLabel />
    </>
  );
}

export default App;
