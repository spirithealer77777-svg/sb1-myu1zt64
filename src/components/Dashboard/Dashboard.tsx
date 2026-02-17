import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  name: string;
  current_level: string;
}

interface ProgressStats {
  vocabulary: number;
  grammar: number;
  kaiwa: number;
  totalReviews: number;
}

export const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProgressStats>({
    vocabulary: 0,
    grammar: 0,
    kaiwa: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: profileData } = await supabase
      .from('users')
      .select('name, current_level')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('item_type, review_count')
      .eq('user_id', user.id);

    if (progressData) {
      const vocabCount = progressData.filter((p) => p.item_type === 'vocabulary').length;
      const grammarCount = progressData.filter((p) => p.item_type === 'grammar').length;
      const kaiwaCount = progressData.filter((p) => p.item_type === 'kaiwa').length;
      const totalReviews = progressData.reduce((sum, p) => sum + p.review_count, 0);

      setStats({
        vocabulary: vocabCount,
        grammar: grammarCount,
        kaiwa: kaiwaCount,
        totalReviews,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>မင်္ဂလာပါ {profile?.name}!</h1>
        <p className="subtitle">Welcome back to your Japanese learning journey</p>
        <div className="current-level">
          Current Level: <span className="level-badge-large">{profile?.current_level}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-number">{stats.vocabulary}</div>
          <div className="stat-label">Vocabulary Studied</div>
          <div className="stat-label-burmese">စာလုံးများ</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{stats.grammar}</div>
          <div className="stat-label">Grammar Points</div>
          <div className="stat-label-burmese">သဒ္ဒါ</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-number">{stats.kaiwa}</div>
          <div className="stat-label">Conversations</div>
          <div className="stat-label-burmese">စကားပြော</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{stats.totalReviews}</div>
          <div className="stat-label">Total Reviews</div>
          <div className="stat-label-burmese">စုစုပေါင်း ပြန်လည်လေ့လာမှု</div>
        </div>
      </div>

      <div className="motivation-section">
        <h3>Keep Going! 頑張って！</h3>
        <p>ကြိုးစားပါ! Consistency is the key to mastering Japanese.</p>
      </div>
    </div>
  );
};
