import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface KaiwaScenario {
  id: string;
  title: string;
  title_burmese: string;
  level: string;
  situation: string;
  dialogue: Array<{
    speaker: string;
    japanese: string;
    burmese: string;
    english: string;
  }>;
  key_phrases: Array<{
    japanese: string;
    burmese: string;
    english: string;
  }>;
}

export const KaiwaPractice = () => {
  const [scenarios, setScenarios] = useState<KaiwaScenario[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('N3');
  const [selectedScenario, setSelectedScenario] = useState<KaiwaScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadScenarios();
  }, [selectedLevel]);

  const loadScenarios = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('kaiwa_scenarios')
      .select('*')
      .eq('level', selectedLevel)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setScenarios(data);
    }

    setLoading(false);
  };

  const markAsStudied = async (scenarioId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_type', 'kaiwa')
      .eq('item_id', scenarioId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          review_count: existing.review_count + 1,
          last_reviewed: new Date().toISOString(),
          mastery_level: Math.min(existing.mastery_level + 1, 5),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert({
        user_id: user.id,
        item_type: 'kaiwa',
        item_id: scenarioId,
        mastery_level: 1,
        review_count: 1,
      });
    }
  };

  return (
    <div className="kaiwa-section">
      <div className="section-header">
        <h2>စကားပြော Conversation Practice (会話)</h2>
        <p className="subtitle">Practice real-life Japanese conversations</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Level:</label>
          <div className="button-group">
            {['N3', 'N2', 'N1'].map((level) => (
              <button
                key={level}
                className={selectedLevel === level ? 'active' : ''}
                onClick={() => setSelectedLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading scenarios...</div>
      ) : selectedScenario ? (
        <div className="scenario-detail">
          <button
            onClick={() => setSelectedScenario(null)}
            className="btn-back"
          >
            ← Back to Scenarios
          </button>

          <div className="scenario-header">
            <h3>{selectedScenario.title}</h3>
            <p className="burmese-text">{selectedScenario.title_burmese}</p>
            <span className="level-badge">{selectedScenario.level}</span>
          </div>

          <div className="situation-box">
            <h4>Situation:</h4>
            <p>{selectedScenario.situation}</p>
          </div>

          <div className="dialogue-section">
            <h4>Dialogue (စကားပြော):</h4>
            {selectedScenario.dialogue.map((line, idx) => (
              <div key={idx} className="dialogue-line">
                <div className="speaker">{line.speaker}:</div>
                <div className="dialogue-content">
                  <div className="japanese">{line.japanese}</div>
                  <div className="burmese">{line.burmese}</div>
                  <div className="english">{line.english}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedScenario.key_phrases && selectedScenario.key_phrases.length > 0 && (
            <div className="key-phrases-section">
              <h4>Key Phrases (အဓိက စကားလုံးများ):</h4>
              {selectedScenario.key_phrases.map((phrase, idx) => (
                <div key={idx} className="phrase-item">
                  <div className="phrase-japanese">{phrase.japanese}</div>
                  <div className="phrase-burmese">{phrase.burmese}</div>
                  <div className="phrase-english">{phrase.english}</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => markAsStudied(selectedScenario.id)}
            className="btn-complete"
          >
            Complete Practice
          </button>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="empty-state">
          <p>No conversation scenarios found.</p>
          <p className="burmese-text">စကားပြော လေ့ကျင့်ခန်းများ မရှိသေးပါ။</p>
        </div>
      ) : (
        <div className="scenarios-grid">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="scenario-card"
              onClick={() => setSelectedScenario(scenario)}
            >
              <h3>{scenario.title}</h3>
              <p className="burmese-text">{scenario.title_burmese}</p>
              <div className="scenario-meta">
                <span className="level-badge">{scenario.level}</span>
                <span className="dialogue-count">
                  {scenario.dialogue?.length || 0} lines
                </span>
              </div>
              <div className="scenario-situation">{scenario.situation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
