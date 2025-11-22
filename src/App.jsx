import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Magazine from './pages/Magazine';
import MagazinePost from './pages/MagazinePost';
import WebGLBackground from './components/WebGLBackground';

function App() {
  return (
    <Router>
      <WebGLBackground />
      <div className="min-h-screen relative">
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
