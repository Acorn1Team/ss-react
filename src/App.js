import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminHome from "./Admin/AdminHome";
import AdminMain from "./Admin/AdminMain/AdminMain"

function App() {
  return (
    <div className="container">
    <BrowserRouter>
     <Routes>
       <Route path="/admin" element={<AdminHome />} />
       <Route path="/admin/mainedit" element={<AdminMain />} />
      </Routes>
    </BrowserRouter> 
    </div> 
  );
}

export default App;