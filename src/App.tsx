import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminProducts from './pages/AdminProducts';
import AdminEnquiries from './pages/AdminEnquiries';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={<AdminProducts />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
