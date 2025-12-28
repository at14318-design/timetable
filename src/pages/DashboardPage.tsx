import { useEffect } from "react";
import { getTimetable } from "../api/axios";

const DashboardPage = () => {
  useEffect(() => {
    getTimetable().then((data) => console.log(data));
  }, []);
  return <div>DashboardPage</div>;
};

export default DashboardPage;
