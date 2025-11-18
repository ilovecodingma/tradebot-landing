import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Magazine from './pages/Magazine';
import MagazinePost from './pages/MagazinePost';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/magazine" element={<Magazine />} />
          <Route path="/magazine/:postId" element={<MagazinePost />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
