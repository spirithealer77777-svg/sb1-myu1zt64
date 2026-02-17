import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  burmese_explanation: string;
  english_explanation: string;
  level: string;
  examples: Array<{
    japanese: string;
    burmese: string;
    english: string;
  }>;
}

export const GrammarList = () => {
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('N3');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadGrammar();
  }, [selectedLevel]);

  const loadGrammar = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('grammar_points')
      .select('*')
      .eq('level', selectedLevel)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setGrammarPoints(data);
    }

    setLoading(false);
  };

  const markAsStudied = async (grammarId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_type', 'grammar')
      .eq('item_id', grammarId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          review_count: existing.review_count + 1,
          last_reviewed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert({
        user_id: user.id,
        item_type: 'grammar',
        item_id: grammarId,
        mastery_level: 1,
        review_count: 1,
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="grammar-section">
      <div className="section-header">
        <h2>သဒ္ဒါ Grammar Points</h2>
        <p className="subtitle">Master Japanese grammar patterns for N3-N1</p>
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
        <div className="loading">Loading grammar points...</div>
      ) : grammarPoints.length === 0 ? (
        <div className="empty-state">
          <p>No grammar points found.</p>
          <p className="burmese-text">သဒ္ဒါ အချက်အလက်များ မရှိသေးပါ။</p>
        </div>
      ) : (
        <div className="grammar-list">
          {grammarPoints.map((item) => (
            <div key={item.id} className="grammar-card">
              <div
                className="grammar-header"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="grammar-pattern">{item.pattern}</div>
                <div className="grammar-meaning">{item.meaning}</div>
                <span className="level-badge">{item.level}</span>
              </div>

              {expandedId === item.id && (
                <div className="grammar-details">
                  <div className="explanation-section">
                    <h4>Myanmar Explanation (မြန်မာ ရှင်းလင်းချက်):</h4>
                    <p className="burmese-text">{item.burmese_explanation}</p>
                  </div>

                  <div className="explanation-section">
                    <h4>English Explanation:</h4>
                    <p>{item.english_explanation}</p>
                  </div>

                  {item.examples && item.examples.length > 0 && (
                    <div className="examples-section">
                      <h4>Examples (ဥပမာများ):</h4>
                      {item.examples.map((example, idx) => (
                        <div key={idx} className="example-item">
                          <div className="example-japanese">{example.japanese}</div>
                          <div className="example-burmese">{example.burmese}</div>
                          <div className="example-english">{example.english}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => markAsStudied(item.id)}
                    className="btn-study"
                  >
                    Mark as Studied
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
