import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserRoutes from "./User/Routes/UserRoutes";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import Header from "./User/Component/Header";
import UserHome from "./User/UserHome";

function App() {
  return (
    <div className="container">
      <Header></Header>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserHome />} />
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
