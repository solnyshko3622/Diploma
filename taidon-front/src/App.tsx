import { AppProvider } from './contexts/AppContext';
import Router from './components/Router';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

export default App;
