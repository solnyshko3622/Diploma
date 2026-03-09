import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LandingPage } from './LandingPage';
import { AuthWrapper } from './AuthWrapper';
import { MainApp } from './MainApp';
import { ProjectsPage } from './ProjectsPage';

function Router() {
  const { auth } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!auth.isAuthenticated ? <LandingPage /> : <Navigate to="/projects" replace />} />
        <Route path="/auth" element={!auth.isAuthenticated ? <AuthWrapper /> : <Navigate to="/projects" replace />} />
        
        {/* Protected routes */}
        <Route path="/editor" element={auth.isAuthenticated ? <MainApp /> : <Navigate to="/auth" replace />} />
        <Route path="/projects" element={auth.isAuthenticated ? <ProjectsPage /> : <Navigate to="/auth" replace />} />
        
        {/* Catch all route - redirect to appropriate page based on auth status */}
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? "/projects" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;