import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './SignUp';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import VehicleRegistrationForm from './components/VehicleRegistrationForm';
import FancyNumber from './components/FancyNumber';
import PaymentPage from './components/PaymentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer/form" element={<VehicleRegistrationForm />} />
        <Route path="/fancyNumber" element={<FancyNumber />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
