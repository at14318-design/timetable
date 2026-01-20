import { BrowserRouter, useRoutes } from "react-router-dom";
import "./App.css";
import { routes } from "./routes/routes";

const AppRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
