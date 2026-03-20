export function buildFallbackBrief(articles, date) {
  if (!Array.isArray(articles) || articles.length === 0) {
    return `- ${date} 暂无可用于生成摘要的爱尔兰科技新闻。`;
  }

  const buckets = {
    deals: [],
    jobs: [],
    research: [],
    events: [],
    general: [],
  };

  for (const article of articles) {
    const text = `${article.title || ''} ${article.summary || ''}`.toLowerCase();
    if (/acquisition|acquire|merger|takeover|deal|funding|series\s+[ab]/.test(text)) {
      buckets.deals.push(article);
    } else if (/hiring|job|careers|recruit|talent/.test(text)) {
      buckets.jobs.push(article);
    } else if (/university|research|lab|ai|machine learning|academic/.test(text)) {
      buckets.research.push(article);
    } else if (/summit|conference|event|meetup/.test(text)) {
      buckets.events.push(article);
    } else {
      buckets.general.push(article);
    }
  }

  const lines = [];
  const pushTop = (prefix, list) => {
    const top = list[0];
    if (top) lines.push(`- ${prefix}：${top.title}（${top.source || 'Unknown'}）`);
  };

  pushTop('并购/融资', buckets.deals);
  pushTop('招聘动态', buckets.jobs);
  pushTop('高校/研究', buckets.research);
  pushTop('活动峰会', buckets.events);

  if (lines.length < 3) {
    for (const item of buckets.general) {
      if (lines.length >= 5) break;
      lines.push(`- 其他要闻：${item.title}（${item.source || 'Unknown'}）`);
    }
  }

  return lines.slice(0, 5).join('\n');
}
