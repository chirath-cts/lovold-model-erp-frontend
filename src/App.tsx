import EnvironmentLabel from "@/components/EnvironmentLabel/EnvironmentLabel";
import { AppProviders } from "@/app/AppProviders";
import { AppRouter } from "@/app/router";

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <EnvironmentLabel />
    </AppProviders>
  );
}

export default App;
