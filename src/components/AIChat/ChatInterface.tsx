import { useState, useEffect, useRef, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  message: string;
  role: 'user' | 'assistant';
  language: string;
  created_at: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'burmese' | 'japanese' | 'english'>('burmese');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data && !error) {
      setMessages(data);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      message: userMessage,
      role: 'user',
      language,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      message: userMessage,
      role: 'user',
      language,
    });

    const aiResponse = generateAIResponse(userMessage, language);

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      message: aiResponse,
      role: 'assistant',
      language,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      message: aiResponse,
      role: 'assistant',
      language,
    });

    setLoading(false);
  };

  const generateAIResponse = (userMsg: string, lang: string): string => {
    const lowerMsg = userMsg.toLowerCase();

    const responses = {
      burmese: {
        greeting: 'မင်္ဂလာပါ! ကျွန်တော် Kyi ရဲ့ သင်ယူမှု လုပ်ဖော်ကိုင်ဖက် AI ပါ။ ဂျပန်စာ လေ့လာရာမှာ ကူညီပေးပါရစေ။ 一緒に頑張りましょう！',
        help: 'ဘာကူညီရမလဲ ပြောပါ။ စာလုံးအသစ်များ (vocabulary)၊ သဒ္ဒါ (grammar) သို့မဟုတ် စကားပြောလေ့ကျင့်ချင်ပါသလား? (Kaiwa practice)',
        vocabulary: 'စာလုံးအသစ်များ လေ့လာကြမယ်! N3-N1 အဆင့်အတွက် သင့်လျော်သော စာလုံးများ ရှိပါတယ်။ ဘယ် category ကို လေ့လာချင်ပါသလဲ?',
        grammar: 'သဒ္ဒါ လေ့လာကြရအောင်! ဂျပန်သဒ္ဒါက စိတ်ဝင်စားစရာကောင်းပါတယ်။ ဘယ် pattern ကို လေ့လာချင်ပါသလဲ?',
        conversation: 'စကားပြောလေ့ကျင့်ကြမယ်! အစစ်အမှန် အခြေအနေတွေမှာ ဂျပန်စကား သုံးတတ်အောင် ကျွန်တော် ကူညီပါရစေ။',
        encourage: 'ကောင်းပြီ! သင့်ရဲ့ တိုးတက်မှုကို ကျွန်တော် မြင်နေပါတယ်။ ဆက်လက် ကြိုးစားပါ! 頑張って！',
        default: 'နားလည်ပါတယ်။ ဂျပန်စာ လေ့လာရာမှာ အခက်အခဲ ရှိလာရင် ကျွန်တော့်ကို မေးနိုင်ပါတယ်။ 一緒に頑張りましょう！'
      },
      japanese: {
        greeting: 'こんにちは！私はKyiの学習パートナーAIです。日本語の勉強を手伝います。一緒に頑張りましょう！',
        help: '何か手伝いましょうか？語彙、文法、会話練習、どれがいいですか？',
        vocabulary: '語彙を勉強しましょう！N3-N1レベルの単語があります。どのカテゴリーを勉強したいですか？',
        grammar: '文法を勉強しましょう！日本語の文法は面白いですよ。どのパターンを勉強したいですか？',
        conversation: '会話練習をしましょう！実際の場面で日本語を使えるように手伝います。',
        encourage: 'いいですね！上達が見えますよ。続けて頑張ってください！',
        default: 'わかりました。日本語の勉強で困ったことがあったら、いつでも聞いてください。'
      },
      english: {
        greeting: 'Hello! I am Kyi\'s learning companion AI. I will help you study Japanese. Let\'s do our best together!',
        help: 'What can I help you with? Would you like to study vocabulary, grammar, or practice conversation?',
        vocabulary: 'Let\'s study vocabulary! We have words for N3-N1 levels. Which category would you like to study?',
        grammar: 'Let\'s study grammar! Japanese grammar is interesting. Which pattern would you like to learn?',
        conversation: 'Let\'s practice conversation! I will help you use Japanese in real situations.',
        encourage: 'Great! I can see your progress. Keep up the good work!',
        default: 'I understand. If you have any difficulties studying Japanese, feel free to ask me anytime.'
      }
    };

    const langResponses = responses[lang as keyof typeof responses] || responses.english;

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('မင်္ဂလာ') || lowerMsg.includes('こんにちは')) {
      return langResponses.greeting;
    } else if (lowerMsg.includes('help') || lowerMsg.includes('ကူညီ')) {
      return langResponses.help;
    } else if (lowerMsg.includes('vocabulary') || lowerMsg.includes('စာလုံး') || lowerMsg.includes('語彙')) {
      return langResponses.vocabulary;
    } else if (lowerMsg.includes('grammar') || lowerMsg.includes('သဒ္ဒါ') || lowerMsg.includes('文法')) {
      return langResponses.grammar;
    } else if (lowerMsg.includes('conversation') || lowerMsg.includes('kaiwa') || lowerMsg.includes('စကားပြော') || lowerMsg.includes('会話')) {
      return langResponses.conversation;
    } else if (lowerMsg.includes('thank') || lowerMsg.includes('ကျေးဇူး') || lowerMsg.includes('ありがとう')) {
      return langResponses.encourage;
    }

    return langResponses.default;
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>AI Learning Companion</h2>
        <p className="subtitle">Your friendly Japanese learning partner</p>

        <div className="language-selector">
          <button
            className={language === 'burmese' ? 'active' : ''}
            onClick={() => setLanguage('burmese')}
          >
            မြန်မာ
          </button>
          <button
            className={language === 'japanese' ? 'active' : ''}
            onClick={() => setLanguage('japanese')}
          >
            日本語
          </button>
          <button
            className={language === 'english' ? 'active' : ''}
            onClick={() => setLanguage('english')}
          >
            English
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>မင်္ဂလာပါ! Welcome! こんにちは!</p>
            <p>I'm your AI learning companion. Ask me anything about Japanese!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content typing">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'burmese'
              ? 'သင့်မေးခွန်းကို ရိုက်ထည့်ပါ...'
              : language === 'japanese'
              ? '質問を入力してください...'
              : 'Type your question...'
          }
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};
