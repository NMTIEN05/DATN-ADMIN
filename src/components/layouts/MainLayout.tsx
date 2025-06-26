import { Outlet } from "react-router-dom";
import AdminHeader from "../common/AdminHeader";

const Content = () => {
  return (
    <div style={{ padding: 20, width: "100%" }}>
     <AdminHeader />
      <div className="dark-outlet">
        <Outlet />
      </div>
    </div>
  );
};

export default Content;
