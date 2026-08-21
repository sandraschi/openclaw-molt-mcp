import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LogBootstrap from "./components/LogBootstrap";
import AI from "./pages/AI";
import Channels from "./pages/Channels";
import Clawnews from "./pages/Clawnews";
import Diagram from "./pages/Diagram";
import Health from "./pages/Health";
import Integrations from "./pages/Integrations";
import Moltbook from "./pages/Moltbook";
import Onboarding from "./pages/Onboarding";
import RoutesPage from "./pages/Routes";
import Security from "./pages/Security";
import Sessions from "./pages/Sessions";
import SettingsPage from "./pages/Settings";
import Skills from "./pages/Skills";
import StarterPage from "./pages/StarterPage";
import Startpage from "./pages/Startpage";
import Statistics from "./pages/Statistics";

function App() {
  return (
    <Layout>
      <LogBootstrap />
      <Routes>
        <Route path="/" element={<Startpage />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/diagram" element={<Diagram />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/moltbook" element={<Moltbook />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/health" element={<Health />} />
        <Route path="/clawnews" element={<Clawnews />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/security" element={<Security />} />
        <Route path="/starter" element={<StarterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
