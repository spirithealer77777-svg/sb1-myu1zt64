import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface VocabItem {
  id: string;
  japanese: string;
  hiragana: string;
  burmese: string;
  english: string;
  level: string;
  category: string;
  example_sentence: string | null;
  example_burmese: string | null;
}

export const VocabularyList = () => {
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('N3');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadVocabulary();
  }, [selectedLevel, selectedCategory]);

  const loadVocabulary = async () => {
    setLoading(true);

    let query = supabase
      .from('vocabulary')
      .select('*')
      .eq('level', selectedLevel)
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (data && !error) {
      setVocabulary(data);

      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    }

    setLoading(false);
  };

  const markAsStudied = async (vocabId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_type', 'vocabulary')
      .eq('item_id', vocabId)
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
        item_type: 'vocabulary',
        item_id: vocabId,
        mastery_level: 1,
        review_count: 1,
      });
    }
  };

  return (
    <div className="vocabulary-section">
      <div className="section-header">
        <h2>စာလုံးများ Vocabulary</h2>
        <p className="subtitle">Build your Japanese vocabulary for N3-N1 levels</p>
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

        {categories.length > 0 && (
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading vocabulary...</div>
      ) : vocabulary.length === 0 ? (
        <div className="empty-state">
          <p>No vocabulary items found.</p>
          <p className="burmese-text">စာလုံးများ မရှိသေးပါ။</p>
        </div>
      ) : (
        <div className="vocabulary-grid">
          {vocabulary.map((item) => (
            <div key={item.id} className="vocab-card">
              <div className="vocab-main">
                <div className="japanese-word">{item.japanese}</div>
                <div className="hiragana">{item.hiragana}</div>
              </div>

              <div className="vocab-translations">
                <div className="translation burmese">{item.burmese}</div>
                <div className="translation english">{item.english}</div>
              </div>

              {item.example_sentence && (
                <div className="vocab-example">
                  <div className="example-japanese">{item.example_sentence}</div>
                  {item.example_burmese && (
                    <div className="example-burmese">{item.example_burmese}</div>
                  )}
                </div>
              )}

              <div className="vocab-meta">
                <span className="level-badge">{item.level}</span>
                <span className="category-badge">{item.category}</span>
              </div>

              <button
                onClick={() => markAsStudied(item.id)}
                className="btn-study"
              >
                Mark as Studied
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
