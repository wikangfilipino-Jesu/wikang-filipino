import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rjrzzumugwgqmsioykds.supabase.co'
const SUPABASE_KEY = 'sb_publishable_EjkAse4dsx9943WFPi-7TQ_vx1p8v6U'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── READ FUNCTIONS ────────────────────────────────────────

export async function fetchDictionaryWords() {
  const { data, error } = await supabase.from('dictionary_words').select('*').order('created_at', { ascending: true })
  if (error) { console.error('Dictionary fetch error:', error); return null; }
  return data.map(w => ({
    id: w.id, tagalog: w.tagalog, alternatives: w.alternatives || [],
    pronunciation: w.pronunciation, partOfSpeech: w.part_of_speech, definition: w.definition,
    en: { translation: w.translation_en, example: { tl: w.example_tl_en, tr: w.example_tr_en } },
    es: { translation: w.translation_es, example: { tl: w.example_tl_es, tr: w.example_tr_es } },
    de: { translation: w.translation_de, example: { tl: w.example_tl_de, tr: w.example_tr_de } },
    culturalNote: w.cultural_note, searchTerms: w.search_terms || [],
  }))
}

export async function fetchLitWords() {
  const { data, error } = await supabase.from('lit_words').select('*').order('created_at', { ascending: true })
  if (error) { console.error('LIT fetch error:', error); return null; }
  return data.map(w => ({
    id: w.id, word: w.word, pronunciation: w.pronunciation, teaser: w.teaser, category: w.category, concept: w.concept,
    en: { closest: w.closest_en, explanation: w.explanation_en, example: { tl: w.example_tl_en, tr: w.example_tr_en } },
    es: { closest: w.closest_es, explanation: w.explanation_es, example: { tl: w.example_tl_es, tr: w.example_tr_es } },
    de: { closest: w.closest_de, explanation: w.explanation_de, example: { tl: w.example_tl_de, tr: w.example_tr_de } },
    culturalNote: w.cultural_note,
  }))
}

export async function fetchPhrases() {
  const { data, error } = await supabase.from('phrases').select('*').order('created_at', { ascending: true })
  if (error) { console.error('Phrases fetch error:', error); return null; }
  return data.map(p => ({
    id: p.id, phrase: p.phrase, pronunciation: p.pronunciation, theme: p.theme, tagline: p.tagline, howToUse: p.how_to_use,
    en: { translation: p.translation_en, example: { tl: p.example_tl_en, tr: p.example_tr_en } },
    es: { translation: p.translation_es, example: { tl: p.example_tl_es, tr: p.example_tr_es } },
    de: { translation: p.translation_de, example: { tl: p.example_tl_de, tr: p.example_tr_de } },
    culturalTip: p.cultural_tip,
  }))
}

export async function fetchPilipinasEntries() {
  const { data, error } = await supabase.from('pilipinas_entries').select('*').order('created_at', { ascending: true })
  if (error) { console.error('Pilipinas fetch error:', error); return null; }
  return data.map(e => ({
    id: e.id, title: e.title, subtitle: e.subtitle, category: e.category,
    image: e.image_url, description: e.description,
    facts: e.facts || [], vocabulary: e.vocabulary || [], culturalNote: e.cultural_note,
  }))
}

// ── DICTIONARY WORDS ──────────────────────────────────────

export async function saveDictionaryWord(word, id = null) {
  const row = {
    tagalog: word.tagalog, alternatives: word.alternatives,
    pronunciation: word.pronunciation, part_of_speech: word.partOfSpeech, definition: word.definition,
    translation_en: word.translation_en, example_tl_en: word.example_tl_en, example_tr_en: word.example_tr_en,
    translation_es: word.translation_es, example_tl_es: word.example_tl_es, example_tr_es: word.example_tr_es,
    translation_de: word.translation_de, example_tl_de: word.example_tl_de, example_tr_de: word.example_tr_de,
    cultural_note: word.culturalNote, search_terms: word.searchTerms,
  }
  if (id) {
    const { error } = await supabase.from('dictionary_words').update(row).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('dictionary_words').insert([row])
    if (error) throw error
  }
}

export async function deleteDictionaryWord(id) {
  const { error } = await supabase.from('dictionary_words').delete().eq('id', id)
  if (error) throw error
}

// ── LIT WORDS ─────────────────────────────────────────────

export async function saveLitWord(word, id = null) {
  const row = {
    word: word.word, pronunciation: word.pronunciation, teaser: word.teaser,
    category: word.category, concept: word.concept,
    closest_en: word.closest_en, explanation_en: word.explanation_en, example_tl_en: word.example_tl_en, example_tr_en: word.example_tr_en,
    closest_es: word.closest_es, explanation_es: word.explanation_es, example_tl_es: word.example_tl_es, example_tr_es: word.example_tr_es,
    closest_de: word.closest_de, explanation_de: word.explanation_de, example_tl_de: word.example_tl_de, example_tr_de: word.example_tr_de,
    cultural_note: word.culturalNote,
  }
  if (id) {
    const { error } = await supabase.from('lit_words').update(row).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('lit_words').insert([row])
    if (error) throw error
  }
}

export async function deleteLitWord(id) {
  const { error } = await supabase.from('lit_words').delete().eq('id', id)
  if (error) throw error
}

// ── PHRASES ───────────────────────────────────────────────

export async function savePhrase(phrase, id = null) {
  const row = {
    phrase: phrase.phrase, pronunciation: phrase.pronunciation, theme: phrase.theme,
    tagline: phrase.tagline, how_to_use: phrase.howToUse,
    translation_en: phrase.translation_en, example_tl_en: phrase.example_tl_en, example_tr_en: phrase.example_tr_en,
    translation_es: phrase.translation_es, example_tl_es: phrase.example_tl_es, example_tr_es: phrase.example_tr_es,
    translation_de: phrase.translation_de, example_tl_de: phrase.example_tl_de, example_tr_de: phrase.example_tr_de,
    cultural_tip: phrase.culturalTip,
  }
  if (id) {
    const { error } = await supabase.from('phrases').update(row).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('phrases').insert([row])
    if (error) throw error
  }
}

export async function deletePhrase(id) {
  const { error } = await supabase.from('phrases').delete().eq('id', id)
  if (error) throw error
}

// ── PILIPINAS ENTRIES ─────────────────────────────────────

export async function savePilipinasEntry(entry, id = null) {
  const row = {
    title: entry.title, subtitle: entry.subtitle, category: entry.category,
    image_url: entry.imageUrl, description: entry.description,
    facts: entry.facts, vocabulary: entry.vocabulary, cultural_note: entry.culturalNote,
  }
  if (id) {
    const { error } = await supabase.from('pilipinas_entries').update(row).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('pilipinas_entries').insert([row])
    if (error) throw error
  }
}

export async function deletePilipinasEntry(id) {
  const { error } = await supabase.from('pilipinas_entries').delete().eq('id', id)
  if (error) throw error
}
