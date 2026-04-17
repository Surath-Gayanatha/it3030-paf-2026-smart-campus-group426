import './App.css';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import Hero from './components/Hero';
import QuickActions from './components/QuickActions';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import AdminPanel from './pages/AdminPanel';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route
            path="/onboarding"
            element={(
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            )}
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;