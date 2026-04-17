import './App.css';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuickActions from './components/QuickActions';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import TicketCreate from './pages/TicketCreate';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import AdminView from './pages/AdminView';

const HomePage = () => {
  return (
    <>
      <main>
        <Hero />
        <QuickActions />
        <Features />
        <Stats />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/create" element={<TicketCreate />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />

          {/* For now - open access to test admin view */}
          <Route path="/admin" element={<AdminView />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;