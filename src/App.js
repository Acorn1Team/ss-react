import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import UserRoutes from "./User/Routes/UserRoutes";
import AdminRoutes from "./Admin/Routes/AdminRoutes";
import HeaderForm from "./User/Component/HeaderForm";
import AdminTop from "./Admin/AdminTop";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/user/*" element={<HeaderForm />} />
          <Route path="/admin/*" element={<AdminTop />} />
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
