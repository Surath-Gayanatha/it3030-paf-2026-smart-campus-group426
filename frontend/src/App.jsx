import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuickActions from './components/QuickActions';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <QuickActions />
        <Features />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}

export default App;