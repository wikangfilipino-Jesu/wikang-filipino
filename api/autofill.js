export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { word, section } = req.body
  if (!word) return res.status(400).json({ error: 'Word is required' })

  const prompts = {
    dictionary: `You are a Filipino language expert. Generate comprehensive dictionary content for the Tagalog word "${word}".
Return ONLY a valid JSON object with no markdown formatting, no backticks, no explanation — just the raw JSON:
{
  "tagalog": "${word}",
  "alternatives": ["alternative1", "alternative2"],
  "pronunciation": "syllable · by · syllable",
  "partOfSpeech": "adjective",
  "definition": "Clear definition in English",
  "translation_en": "English translation",
  "example_tl_en": "Example sentence in Tagalog",
  "example_tr_en": "English translation of example",
  "translation_es": "Spanish translation",
  "example_tl_es": "Same Tagalog example sentence",
  "example_tr_es": "Spanish translation of example",
  "translation_de": "German translation",
  "example_tl_de": "Same Tagalog example sentence",
  "example_tr_de": "German translation of example",
  "culturalNote": "2-3 sentences about cultural context and how Filipinos actually use this word",
  "searchTerms": ["english", "spanish", "german", "tagalog", "search", "terms"]
}`,

    lit: `You are a Filipino language expert specializing in untranslatable words. Generate content for the Filipino untranslatable word "${word}".
Return ONLY a valid JSON object with no markdown, no backticks, no explanation — just raw JSON:
{
  "word": "${word}",
  "pronunciation": "syllable · by · syllable",
  "teaser": "One line capturing the essence of this word",
  "category": "Emotions",
  "concept": "2-3 sentences explaining the full concept and feeling in depth",
  "closest_en": "Closest English equivalent or No direct equivalent",
  "explanation_en": "Why English cannot fully capture this word",
  "example_tl_en": "Example sentence in Tagalog",
  "example_tr_en": "English translation of example",
  "closest_es": "Closest Spanish equivalent or Sin equivalente directo",
  "explanation_es": "Why Spanish cannot fully capture this word, written in Spanish",
  "example_tl_es": "Same Tagalog example sentence",
  "example_tr_es": "Spanish translation of example",
  "closest_de": "Closest German equivalent or Kein direktes Äquivalent",
  "explanation_de": "Why German cannot fully capture this word, written in German",
  "example_tl_de": "Same Tagalog example sentence",
  "example_tr_de": "German translation of example",
  "culturalNote": "2-3 sentences about cultural significance and interesting context"
}`,

    phrases: `You are a Filipino language expert. Generate content for the Tagalog phrase "${word}".
Return ONLY a valid JSON object with no markdown, no backticks, no explanation — just raw JSON:
{
  "phrase": "${word}",
  "pronunciation": "syllable · by · syllable",
  "theme": "Everyday",
  "tagline": "One line description of the phrase",
  "howToUse": "2-3 sentences explaining when and how to use this phrase in real life",
  "translation_en": "English translation",
  "example_tl_en": "Example sentence in Tagalog using the phrase",
  "example_tr_en": "English translation of example",
  "translation_es": "Spanish translation",
  "example_tl_es": "Same Tagalog example sentence",
  "example_tr_es": "Spanish translation of example",
  "translation_de": "German translation",
  "example_tl_de": "Same Tagalog example sentence",
  "example_tr_de": "German translation of example",
  "culturalTip": "2-3 sentences about cultural context and usage tips"
}`,

    pilipinas: `You are a Filipino culture expert. Generate content about the Filipino food, culture, or activity "${word}".
Return ONLY a valid JSON object with no markdown, no backticks, no explanation — just raw JSON:
{
  "title": "${word}",
  "subtitle": "Filipino Tagalog description · English Description",
  "category": "Food",
  "imageUrl": "",
  "description": "2-3 sentences describing this in an engaging, warm way",
  "facts": [
    {"tl": "First fact in Tagalog", "en": "First fact in English", "es": "First fact in Spanish", "de": "First fact in German"},
    {"tl": "Second fact in Tagalog", "en": "Second fact in English", "es": "Second fact in Spanish", "de": "Second fact in German"}
  ],
  "vocabulary": [
    {"word": "tagalog_word1", "en": "english1", "es": "spanish1", "de": "german1"},
    {"word": "tagalog_word2", "en": "english2", "es": "spanish2", "de": "german2"},
    {"word": "tagalog_word3", "en": "english3", "es": "spanish3", "de": "german3"},
    {"word": "tagalog_word4", "en": "english4", "es": "spanish4", "de": "german4"}
  ],
  "culturalNote": "2-3 sentences about cultural significance and interesting context"
}`
  }

  const prompt = prompts[section] || prompts.dictionary

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' })

    const text = data.content[0].text
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json(parsed)
  } catch (error) {
    console.error('Autofill error:', error)
    res.status(500).json({ error: 'Failed to generate content. Please try again.' })
  }
}
