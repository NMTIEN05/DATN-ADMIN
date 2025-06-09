import { Outlet } from "react-router-dom";

const Content = () => {
  return (
    <div style={{ padding: 20, width: "100%" }}>
     
      <Outlet /> {/* Nơi render trang con */}
    </div>
  );
};

export default Content;
