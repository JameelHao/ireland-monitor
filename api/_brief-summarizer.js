function pickProvider() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OLLAMA_BASE_URL) return 'ollama';
  return 'none';
}

function normalizeBullets(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('- ') ? line : `- ${line.replace(/^[-*]\s*/, '')}`));

  const unique = Array.from(new Set(lines));
  return unique.slice(0, 5).join('\n');
}

export async function summarizeDailyBrief(articles, deps = {}) {
  const fetchFn = deps.fetch || fetch;
  const provider = pickProvider();

  if (provider === 'none') {
    throw new Error('No AI provider configured');
  }

  const model = process.env.AI_MODEL || (provider === 'groq' ? 'mixtral-8x7b-32768' : 'llama3.1:8b');
  const content = JSON.stringify(
    articles.map((n) => ({ title: n.title, source: n.source, summary: n.summary })),
  );

  if (provider === 'groq') {
    const response = await fetchFn('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are a tech journalist summarizing Irish tech news. Output 3-5 markdown bullet points. Focus on startups, funding, M&A, university research, tech events, and hiring.',
          },
          { role: 'user', content },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { summary: normalizeBullets(text), provider, model };
  }

  const base = process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || 'http://localhost:11434';
  const response = await fetchFn(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      prompt: `Summarize into 3-5 markdown bullets. Focus on Irish tech business/research/jobs:\n\n${content}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return { summary: normalizeBullets(data?.response || ''), provider, model };
}
