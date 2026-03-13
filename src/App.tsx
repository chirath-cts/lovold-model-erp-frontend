import { ToastContainer } from "react-toastify";
import EnvironmentLabel from "./components/EnvironmentLabel/EnvironmentLabel";

function App() {
  return (
    <>
      <h1>Vite + React</h1>
      <ToastContainer position="top-right" autoClose={3000}/>
      <EnvironmentLabel />
    </>
  );
}

export default App;
