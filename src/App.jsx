import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* العلامة : تعني أن هذا الجزء متغير وسيتم تخزينه في userId */}
        <Route path="/:userId" element={<Profile />} />
      </Routes>
    </Router>
  );
}
export default App;