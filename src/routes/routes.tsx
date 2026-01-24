import { JSX } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import GroupSchedulePage from "../pages/GroupSchedulePage";
import GroupsManagement from "../pages/GroupsManagement";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";
import TimetablePage from "../pages/TimetablePage";

interface RouteType {
  path: string;
  element: JSX.Element;
  children?: RouteType[];
}

export const routes: RouteType[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LandingPage />
      </ProtectedRoute>
    ),
    children: [
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
];
