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
import BookingsPage from './pages/BookingsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TicketList from './pages/TicketList';
import TicketCreate from './pages/TicketCreate';
import TicketDetail from './pages/TicketDetail';
import AdminView from './pages/AdminView';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import Resources from './pages/Resources';
import AddFacility from './pages/AddFacility';
import FacilityDetail from './pages/FacilityDetail';

const HomePage = () => {
  return (
    <>
      <main className="home-page__main">
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
      <div className="app-shell">
        <Navbar />
        <div className="app-shell__content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/resources" element={<Resources />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
            <Route path="/facilities/create" element={<AddFacility />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            <Route 
              path="/tickets" 
              element={
                <ProtectedRoute>
                  <TicketList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets/create" 
              element={
                <ProtectedRoute allowedRoles={['LECTURER', 'USER', 'ADMIN']}>
                  <TicketCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets/assigned" 
              element={
                <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                  <TicketList isAssignedView={true} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets/:id" 
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-ticketing" 
              element={
                <AdminRoute>
                  <AdminView />
                </AdminRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
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
      </div>
    </AuthProvider>
  );
}

export default App;
