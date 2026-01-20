import { JSX } from "react";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SettingsPage from "../pages/SettingsPage";
import TimetablePage from "../pages/TimetablePage";
import GroupsManagement from "../pages/GroupsManagement";
import GroupSchedulePage from "../pages/GroupSchedulePage";
import ProtectedRoute from "../components/ProtectedRoute";

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
];
