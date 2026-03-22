import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage/MainPage';
import AuthPage from '../pages/AuthPage/AuthPage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import EditorPage from '../pages/EditorPage/EditorPage';
import UserProfilePage from '../pages/UserProfilePage/UserProfilePage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
