import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserRoutes from "./User/Routes/UserRoutes";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import UserHome from "./User/UserHome";
import AdminHome from "./Admin/AdminTop";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/user/*" element={<UserHome />} />
          <Route path="/admin/*" element={<AdminHome />} />
        </Routes>
        <Routes>
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
