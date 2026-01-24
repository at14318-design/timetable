import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import GroupSchedulePage from "../pages/GroupSchedulePage";
import GroupsManagement from "../pages/GroupsManagement";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";
import TimetablePage from "../pages/TimetablePage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LandingPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <TimetablePage />,
      },
      {
        path: "timetable",
        element: <TimetablePage />,
      },
      {
        path: "groups",
        element: <GroupsManagement />,
      },
      {
        path: "group-schedule/:groupId",
        element: <GroupSchedulePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
]);
