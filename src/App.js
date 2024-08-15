import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserRoutes from "./User/Routes/UserRoutes";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import UserHome from "./User/UserHome";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/user/*" element={<UserHome />} />
          <Route path="/admin/*" element={<UserHome />} />
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
