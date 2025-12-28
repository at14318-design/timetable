import DashboardPage from "../pages/DashboardPage";
import TimetablePage from "../pages/TimetablePage";
import SettingsPage from "../pages/SettingsPage";
import { JSX } from "react";

interface RouteType {
  path: string;
  element: JSX.Element;
}

export const routes: RouteType[] = [
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "/timetable",
    element: <TimetablePage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
];
