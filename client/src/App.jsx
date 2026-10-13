import { Routes, Route } from 'react-router-dom';
import Home   from './pages/Home.jsx';
import Play   from './pages/Play.jsx';
import Result from './pages/Result.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<Home />}   />
      <Route path="/play"   element={<Play />}   />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}
