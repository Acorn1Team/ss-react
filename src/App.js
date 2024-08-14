import { Routes,Route, BrowserRouter } from 'react-router-dom';
import AdminHome from './Admin/AdminHome';
import AdminMain from './Admin/AdminMain/AdminMain';

function App() {
  return (
    <div className="container">
    <BrowserRouter>
     <Routes>
       <Route path="/admin" element={<AdminHome />} />
       <Route path="/admin/start" element={<AdminMain />} />
      </Routes>
    </BrowserRouter> 
    </div> 
  );
}

export default App;
