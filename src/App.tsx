import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatInterface } from './components/AIChat/ChatInterface';
import { VocabularyList } from './components/Vocabulary/VocabularyList';
import { GrammarList } from './components/Grammar/GrammarList';
import { KaiwaPractice } from './components/Kaiwa/KaiwaPractice';
import './App.css';

type Page = 'dashboard' | 'chat' | 'vocabulary' | 'grammar' | 'kaiwa';

const AppContent = () => {
  const { user, loading, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="app-header">
            <h1>Learning Aid For Kyi</h1>
            <p className="app-subtitle">ဂျပန်စာ သင်ကြားရေး အကူအညီ</p>
            <p className="app-subtitle">Japanese Learning Companion</p>
          </div>

          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggle={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Kyi</h2>
          <p className="sidebar-subtitle">Learning Aid</p>
        </div>

        <div className="nav-links">
          <button
            className={currentPage === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            className={currentPage === 'chat' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('chat')}
          >
            <span className="nav-icon">💬</span>
            <span>AI Companion</span>
          </button>

          <button
            className={currentPage === 'vocabulary' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('vocabulary')}
          >
            <span className="nav-icon">📚</span>
            <span>Vocabulary</span>
          </button>

          <button
            className={currentPage === 'grammar' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('grammar')}
          >
            <span className="nav-icon">📝</span>
            <span>Grammar</span>
          </button>

          <button
            className={currentPage === 'kaiwa' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('kaiwa')}
          >
            <span className="nav-icon">🗣️</span>
            <span>Kaiwa (会話)</span>
          </button>
        </div>

        <button onClick={signOut} className="logout-button">
          <span className="nav-icon">🚪</span>
          <span>Log Out</span>
        </button>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'chat' && <ChatInterface />}
        {currentPage === 'vocabulary' && <VocabularyList />}
        {currentPage === 'grammar' && <GrammarList />}
        {currentPage === 'kaiwa' && <KaiwaPractice />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
