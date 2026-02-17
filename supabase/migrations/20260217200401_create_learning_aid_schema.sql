/*
  # Learning Aid For Kyi - Database Schema

  ## Overview
  This migration creates the complete database schema for a Japanese learning application
  with Burmese language support, targeting JLPT N3-N1 levels with conversation practice.

  ## New Tables

  ### 1. `users`
  Stores user profile and learning preferences
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email
  - `name` (text) - User's name
  - `current_level` (text) - Current JLPT level (N3, N2, N1)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `vocabulary`
  Japanese vocabulary items with Burmese translations
  - `id` (uuid, primary key) - Vocabulary item identifier
  - `japanese` (text) - Japanese word in kanji/kana
  - `hiragana` (text) - Hiragana reading
  - `burmese` (text) - Burmese translation
  - `english` (text) - English translation
  - `level` (text) - JLPT level (N3, N2, N1)
  - `category` (text) - Word category (noun, verb, adjective, etc.)
  - `example_sentence` (text) - Example sentence in Japanese
  - `example_burmese` (text) - Example sentence in Burmese
  - `created_at` (timestamptz) - Entry creation timestamp

  ### 3. `grammar_points`
  Japanese grammar patterns with explanations
  - `id` (uuid, primary key) - Grammar point identifier
  - `pattern` (text) - Grammar pattern in Japanese
  - `meaning` (text) - Meaning in Japanese
  - `burmese_explanation` (text) - Explanation in Burmese
  - `english_explanation` (text) - Explanation in English
  - `level` (text) - JLPT level (N3, N2, N1)
  - `examples` (jsonb) - Array of example sentences
  - `created_at` (timestamptz) - Entry creation timestamp

  ### 4. `kaiwa_scenarios`
  Conversation scenarios for practice
  - `id` (uuid, primary key) - Scenario identifier
  - `title` (text) - Scenario title
  - `title_burmese` (text) - Scenario title in Burmese
  - `level` (text) - JLPT level (N3, N2, N1)
  - `situation` (text) - Situation description
  - `dialogue` (jsonb) - Conversation dialogue array
  - `key_phrases` (jsonb) - Important phrases to learn
  - `created_at` (timestamptz) - Entry creation timestamp

  ### 5. `user_progress`
  Tracks individual user learning progress
  - `id` (uuid, primary key) - Progress entry identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `item_type` (text) - Type: vocabulary, grammar, kaiwa
  - `item_id` (uuid) - Reference to specific item
  - `mastery_level` (integer) - 0-5 mastery score
  - `last_reviewed` (timestamptz) - Last review timestamp
  - `review_count` (integer) - Number of times reviewed
  - `created_at` (timestamptz) - Entry creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. `ai_chat_history`
  Stores AI conversation history for learning companionship
  - `id` (uuid, primary key) - Chat entry identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `message` (text) - User or AI message content
  - `role` (text) - 'user' or 'assistant'
  - `language` (text) - Message language (japanese, burmese, english)
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own data
  - Learning materials are read-only for authenticated users
  - AI chat history is private to each user
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  current_level text DEFAULT 'N3',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  japanese text NOT NULL,
  hiragana text NOT NULL,
  burmese text NOT NULL,
  english text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  example_sentence text,
  example_burmese text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vocabulary"
  ON vocabulary FOR SELECT
  TO authenticated
  USING (true);

-- Create grammar_points table
CREATE TABLE IF NOT EXISTS grammar_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL,
  meaning text NOT NULL,
  burmese_explanation text NOT NULL,
  english_explanation text NOT NULL,
  level text NOT NULL,
  examples jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grammar_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view grammar points"
  ON grammar_points FOR SELECT
  TO authenticated
  USING (true);

-- Create kaiwa_scenarios table
CREATE TABLE IF NOT EXISTS kaiwa_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_burmese text NOT NULL,
  level text NOT NULL,
  situation text NOT NULL,
  dialogue jsonb DEFAULT '[]'::jsonb,
  key_phrases jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE kaiwa_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view kaiwa scenarios"
  ON kaiwa_scenarios FOR SELECT
  TO authenticated
  USING (true);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  mastery_level integer DEFAULT 0,
  last_reviewed timestamptz DEFAULT now(),
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_chat_history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text NOT NULL,
  language text DEFAULT 'japanese',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON ai_chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON ai_chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON ai_chat_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);
CREATE INDEX IF NOT EXISTS idx_grammar_points_level ON grammar_points(level);
CREATE INDEX IF NOT EXISTS idx_kaiwa_scenarios_level ON kaiwa_scenarios(level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_item_type ON user_progress(item_type);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
