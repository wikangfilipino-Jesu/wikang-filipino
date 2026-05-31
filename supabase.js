import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrzzumugwgqmsioykds.supabase.co'
const SUPABASE_KEY = 'sb_publishable_EjkAse4dsx9943WFPi-7TQ_vx1p8v6U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── FETCH FUNCTIONS ───────────────────────────────────────

export async function fetchDictionaryWords() {
  const { data, error } = await supabase
    .from('dictionary_words')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('Dictionary fetch error:', error); return null; }
  return data.map(w => ({
    id: w.id,
    tagalog: w.tagalog,
    alternatives: w.alternatives || [],
    pronunciation: w.pronunciation,
    partOfSpeech: w.part_of_speech,
    definition: w.definition,
    en: { translation: w.translation_en, example: { tl: w.example_tl_en, tr: w.example_tr_en } },
    es: { translation: w.translation_es, example: { tl: w.example_tl_es, tr: w.example_tr_es } },
    de: { translation: w.translation_de, example: { tl: w.example_tl_de, tr: w.example_tr_de } },
    culturalNote: w.cultural_note,
    searchTerms: w.search_terms || [],
  }))
}

export async function fetchLitWords() {
  const { data, error } = await supabase
    .from('lit_words')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('LIT fetch error:', error); return null; }
  return data.map(w => ({
    id: w.id,
    word: w.word,
    pronunciation: w.pronunciation,
    teaser: w.teaser,
    category: w.category,
    concept: w.concept,
    en: { closest: w.closest_en, explanation: w.explanation_en, example: { tl: w.example_tl_en, tr: w.example_tr_en } },
    es: { closest: w.closest_es, explanation: w.explanation_es, example: { tl: w.example_tl_es, tr: w.example_tr_es } },
    de: { closest: w.closest_de, explanation: w.explanation_de, example: { tl: w.example_tl_de, tr: w.example_tr_de } },
    culturalNote: w.cultural_note,
  }))
}

export async function fetchPhrases() {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('Phrases fetch error:', error); return null; }
  return data.map(p => ({
    id: p.id,
    phrase: p.phrase,
    pronunciation: p.pronunciation,
    theme: p.theme,
    tagline: p.tagline,
    howToUse: p.how_to_use,
    en: { translation: p.translation_en, example: { tl: p.example_tl_en, tr: p.example_tr_en } },
    es: { translation: p.translation_es, example: { tl: p.example_tl_es, tr: p.example_tr_es } },
    de: { translation: p.translation_de, example: { tl: p.example_tl_de, tr: p.example_tr_de } },
    culturalTip: p.cultural_tip,
  }))
}

export async function fetchPilipinasEntries() {
  const { data, error } = await supabase
    .from('pilipinas_entries')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('Pilipinas fetch error:', error); return null; }
  return data.map(e => ({
    id: e.id,
    title: e.title,
    subtitle: e.subtitle,
    category: e.category,
    image: e.image_url,
    description: e.description,
    facts: e.facts || [],
    vocabulary: e.vocabulary || [],
    culturalNote: e.cultural_note,
  }))
}
