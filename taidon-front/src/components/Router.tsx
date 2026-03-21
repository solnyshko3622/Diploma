import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage/MainPage';
import AuthPage from '../pages/AuthPage/AuthPage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
