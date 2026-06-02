import { useState, useEffect } from "react";
import {
  supabase,
  saveDictionaryWord, deleteDictionaryWord,
  saveLitWord, deleteLitWord,
  savePhrase, deletePhrase,
  savePilipinasEntry, deletePilipinasEntry,
} from "./supabase.js";

const PWD = "30thofMay2026#DuduxBubu";
const TEAL = "#20B28C", GOLD = "#FCD116", AMBER = "#CD853F", NAVY = "#0D1F3C";
const DARK = "#1A1006", MID = "#6B4A2A", CREAM = "#FFFBF3", BORDER = "#EDE0CC";
const RED = "#D9534F", GREEN = "#20B28C";

const TABS = [
  { key:"dictionary", label:"Dictionary", icon:"📖", color: TEAL },
  { key:"lit", label:"Lost in Translation", icon:"✨", color: TEAL },
  { key:"phrases", label:"Tagalog 101", icon:"💬", color: GOLD },
  { key:"pilipinas", label:"Pilipinas", icon:"🇵🇭", color: AMBER },
];

// ── SHARED UI ─────────────────────────────────────────────

function F({ label, value, onChange, multi, placeholder }) {
  const s = { width:"100%", padding:"9px 12px", borderRadius:"10px", border:`1px solid ${BORDER}`, fontFamily:"'Nunito',sans-serif", fontSize:"14px", color:DARK, outline:"none", boxSizing:"border-box", background:"white" };
  return (
    <div style={{ marginBottom:"12px" }}>
      <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:MID, marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      {multi
        ? <textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ ...s, minHeight:"72px", resize:"vertical" }}/>
        : <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>
      }
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:"12px" }}>
      <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:MID, marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</label>
      <select value={value||""} onChange={e=>onChange(e.target.value)} style={{ width:"100%", padding:"9px 12px", borderRadius:"10px", border:`1px solid ${BORDER}`, fontFamily:"'Nunito',sans-serif", fontSize:"14px", color:DARK, outline:"none", background:"white" }}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color=TEAL, outline, small, red }) {
  const c = red ? RED : color;
  return (
    <button onClick={onClick} style={{ background:outline?"transparent":c, color:outline?c:"white", border:`1.5px solid ${c}`, borderRadius:"100px", padding:small?"5px 14px":"9px 22px", fontFamily:"'Nunito',sans-serif", fontSize:small?"12px":"13px", fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:"#F8F4EE", borderRadius:"14px", padding:"16px", marginBottom:"16px", border:`1px solid ${BORDER}` }}>
      <p style={{ fontSize:"11px", fontWeight:700, color:MID, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"12px" }}>{title}</p>
      {children}
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  const ok = msg.startsWith("✅");
  return <div style={{ background:ok?"#EAF7F3":"#FEF0EE", border:`1px solid ${ok?TEAL:RED}`, borderRadius:"10px", padding:"10px 16px", marginBottom:"16px", fontSize:"14px", color:ok?"#0E5A40":RED, fontWeight:600 }}>{msg}</div>;
}

// ── DICTIONARY FORM ───────────────────────────────────────

function emptyDict() {
  return { tagalog:"", alternatives:"", pronunciation:"", partOfSpeech:"adjective", definition:"",
    translation_en:"", example_tl_en:"", example_tr_en:"",
    translation_es:"", example_tl_es:"", example_tr_es:"",
    translation_de:"", example_tl_de:"", example_tr_de:"",
    culturalNote:"", searchTerms:"" };
}

function DictForm({ entry, onSave, onCancel, saving }) {
  const [f, setF] = useState(entry || emptyDict());
  const set = k => v => setF(p=>({...p,[k]:v}));
  async function handleSave() {
    const data = { ...f, alternatives: f.alternatives.split(",").map(s=>s.trim()).filter(Boolean), searchTerms: f.searchTerms.split(",").map(s=>s.trim()).filter(Boolean) };
    await onSave(data, entry?.id);
  }
  return (
    <div style={{ background:"white", borderRadius:"16px", padding:"24px", border:`1px solid ${BORDER}`, marginTop:"16px" }}>
      <h3 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"18px", color:DARK, marginBottom:"16px" }}>{entry?"Edit Word":"Add New Word"}</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <F label="Tagalog Word *" value={f.tagalog} onChange={set("tagalog")} placeholder="e.g. Gigil"/>
        <F label="Pronunciation" value={f.pronunciation} onChange={set("pronunciation")} placeholder="e.g. gi · gil"/>
        <F label="Alternatives (comma separated)" value={f.alternatives} onChange={set("alternatives")} placeholder="e.g. Gigil na, Gigilan"/>
        <Sel label="Part of Speech" value={f.partOfSpeech} onChange={set("partOfSpeech")} options={["adjective","noun","verb","expression","greeting","philosophy","adverb"]}/>
      </div>
      <F label="Definition *" value={f.definition} onChange={set("definition")} multi placeholder="What does this word mean?"/>
      <Section title="🇺🇸 English">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_en} onChange={set("translation_en")} placeholder="e.g. Cute aggression"/>
          <F label="Example (Tagalog)" value={f.example_tl_en} onChange={set("example_tl_en")} placeholder="e.g. Gigil na ako!"/>
          <F label="Example (English)" value={f.example_tr_en} onChange={set("example_tr_en")} placeholder="e.g. I can't handle it!"/>
        </div>
      </Section>
      <Section title="🇪🇸 Español">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_es} onChange={set("translation_es")} placeholder="e.g. Agresividad por ternura"/>
          <F label="Example (Tagalog)" value={f.example_tl_es} onChange={set("example_tl_es")} placeholder="e.g. Gigil na ako!"/>
          <F label="Example (Español)" value={f.example_tr_es} onChange={set("example_tr_es")} placeholder="e.g. ¡No puedo más!"/>
        </div>
      </Section>
      <Section title="🇩🇪 Deutsch">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_de} onChange={set("translation_de")} placeholder="e.g. Kein Äquivalent"/>
          <F label="Example (Tagalog)" value={f.example_tl_de} onChange={set("example_tl_de")} placeholder="e.g. Gigil na ako!"/>
          <F label="Example (Deutsch)" value={f.example_tr_de} onChange={set("example_tr_de")} placeholder="e.g. Ich kann nicht!"/>
        </div>
      </Section>
      <F label="Cultural Note / Tala" value={f.culturalNote} onChange={set("culturalNote")} multi placeholder="Cultural context, real usage, interesting background..."/>
      <F label="Search Terms (comma separated)" value={f.searchTerms} onChange={set("searchTerms")} placeholder="e.g. cute, squeeze, adorable, lindo"/>
      <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
        <Btn onClick={handleSave}>{saving?"Saving...":"💾 Save"}</Btn>
        <Btn onClick={onCancel} outline>Cancel</Btn>
      </div>
    </div>
  );
}

// ── LIT FORM ──────────────────────────────────────────────

function emptyLit() {
  return { word:"", pronunciation:"", teaser:"", category:"Emotions", concept:"",
    closest_en:"", explanation_en:"", example_tl_en:"", example_tr_en:"",
    closest_es:"", explanation_es:"", example_tl_es:"", example_tr_es:"",
    closest_de:"", explanation_de:"", example_tl_de:"", example_tr_de:"",
    culturalNote:"" };
}

function LitForm({ entry, onSave, onCancel, saving }) {
  const [f, setF] = useState(entry || emptyLit());
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <div style={{ background:"white", borderRadius:"16px", padding:"24px", border:`1px solid ${BORDER}`, marginTop:"16px" }}>
      <h3 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"18px", color:DARK, marginBottom:"16px" }}>{entry?"Edit Word":"Add New Word"}</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <F label="Word *" value={f.word} onChange={set("word")} placeholder="e.g. Gigil"/>
        <F label="Pronunciation" value={f.pronunciation} onChange={set("pronunciation")} placeholder="e.g. gi · gil"/>
        <F label="Teaser (one line description)" value={f.teaser} onChange={set("teaser")} placeholder="e.g. The urge to squeeze something cute"/>
        <Sel label="Category" value={f.category} onChange={set("category")} options={["Emotions","Social","Philosophy","Beliefs","Everyday"]}/>
      </div>
      <F label="Full Concept Explanation *" value={f.concept} onChange={set("concept")} multi placeholder="Explain the full feeling or concept in depth..."/>
      <Section title="🇺🇸 English">
        <F label="Closest Equivalent" value={f.closest_en} onChange={set("closest_en")} placeholder="e.g. No direct equivalent / Cute aggression"/>
        <F label="Why it doesn't translate" value={f.explanation_en} onChange={set("explanation_en")} multi placeholder="Explain why English can't capture this..."/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
          <F label="Example (Tagalog)" value={f.example_tl_en} onChange={set("example_tl_en")} placeholder="e.g. Gigil na gigil ako!"/>
          <F label="Example (English)" value={f.example_tr_en} onChange={set("example_tr_en")} placeholder="e.g. I can't handle how cute!"/>
        </div>
      </Section>
      <Section title="🇪🇸 Español">
        <F label="Closest Equivalent" value={f.closest_es} onChange={set("closest_es")} placeholder="e.g. Sin equivalente directo"/>
        <F label="Why it doesn't translate" value={f.explanation_es} onChange={set("explanation_es")} multi placeholder="Explica por qué el español no puede capturarlo..."/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
          <F label="Example (Tagalog)" value={f.example_tl_es} onChange={set("example_tl_es")} placeholder="e.g. Gigil na gigil ako!"/>
          <F label="Example (Español)" value={f.example_tr_es} onChange={set("example_tr_es")} placeholder="e.g. ¡No puedo más!"/>
        </div>
      </Section>
      <Section title="🇩🇪 Deutsch">
        <F label="Closest Equivalent" value={f.closest_de} onChange={set("closest_de")} placeholder="e.g. Kein direktes Äquivalent"/>
        <F label="Why it doesn't translate" value={f.explanation_de} onChange={set("explanation_de")} multi placeholder="Erkläre, warum Deutsch das nicht erfassen kann..."/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
          <F label="Example (Tagalog)" value={f.example_tl_de} onChange={set("example_tl_de")} placeholder="e.g. Gigil na gigil ako!"/>
          <F label="Example (Deutsch)" value={f.example_tr_de} onChange={set("example_tr_de")} placeholder="e.g. Ich kann nicht aufhören!"/>
        </div>
      </Section>
      <F label="Cultural Note / Tala" value={f.culturalNote} onChange={set("culturalNote")} multi placeholder="Cultural context, interesting facts..."/>
      <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
        <Btn onClick={()=>onSave(f,entry?.id)}>{saving?"Saving...":"💾 Save"}</Btn>
        <Btn onClick={onCancel} outline>Cancel</Btn>
      </div>
    </div>
  );
}

// ── PHRASE FORM ───────────────────────────────────────────

function emptyPhrase() {
  return { phrase:"", pronunciation:"", theme:"Everyday", tagline:"", howToUse:"",
    translation_en:"", example_tl_en:"", example_tr_en:"",
    translation_es:"", example_tl_es:"", example_tr_es:"",
    translation_de:"", example_tl_de:"", example_tr_de:"",
    culturalTip:"" };
}

function PhraseForm({ entry, onSave, onCancel, saving }) {
  const [f, setF] = useState(entry || emptyPhrase());
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <div style={{ background:"white", borderRadius:"16px", padding:"24px", border:`1px solid ${BORDER}`, marginTop:"16px" }}>
      <h3 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"18px", color:DARK, marginBottom:"16px" }}>{entry?"Edit Phrase":"Add New Phrase"}</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <F label="Phrase *" value={f.phrase} onChange={set("phrase")} placeholder="e.g. Tara na!"/>
        <F label="Pronunciation" value={f.pronunciation} onChange={set("pronunciation")} placeholder="e.g. ta · ra · na"/>
        <F label="Tagline (one line)" value={f.tagline} onChange={set("tagline")} placeholder="e.g. Let's go — come on, let's head out!"/>
        <Sel label="Theme" value={f.theme} onChange={set("theme")} options={["Everyday","Food","Greetings","Emotions","Travel","Family"]}/>
      </div>
      <F label="How to Use It" value={f.howToUse} onChange={set("howToUse")} multi placeholder="Explain when and how to use this phrase in real life..."/>
      <Section title="🇺🇸 English">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_en} onChange={set("translation_en")} placeholder="e.g. Let's go!"/>
          <F label="Example (Tagalog)" value={f.example_tl_en} onChange={set("example_tl_en")} placeholder="e.g. Tara na, gutom na ko!"/>
          <F label="Example (English)" value={f.example_tr_en} onChange={set("example_tr_en")} placeholder="e.g. Let's go, I'm hungry!"/>
        </div>
      </Section>
      <Section title="🇪🇸 Español">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_es} onChange={set("translation_es")} placeholder="e.g. ¡Vámonos!"/>
          <F label="Example (Tagalog)" value={f.example_tl_es} onChange={set("example_tl_es")} placeholder="e.g. Tara na, gutom na ko!"/>
          <F label="Example (Español)" value={f.example_tr_es} onChange={set("example_tr_es")} placeholder="e.g. ¡Vámonos, tengo hambre!"/>
        </div>
      </Section>
      <Section title="🇩🇪 Deutsch">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 12px" }}>
          <F label="Translation" value={f.translation_de} onChange={set("translation_de")} placeholder="e.g. Lass uns gehen!"/>
          <F label="Example (Tagalog)" value={f.example_tl_de} onChange={set("example_tl_de")} placeholder="e.g. Tara na, gutom na ko!"/>
          <F label="Example (Deutsch)" value={f.example_tr_de} onChange={set("example_tr_de")} placeholder="e.g. Lass uns gehen, ich habe Hunger!"/>
        </div>
      </Section>
      <F label="Cultural Tip / Tala" value={f.culturalTip} onChange={set("culturalTip")} multi placeholder="Cultural context, usage tip, interesting background..."/>
      <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
        <Btn onClick={()=>onSave(f,entry?.id)}>{saving?"Saving...":"💾 Save"}</Btn>
        <Btn onClick={onCancel} outline>Cancel</Btn>
      </div>
    </div>
  );
}

// ── PILIPINAS FORM ────────────────────────────────────────

function emptyPil() {
  return { title:"", subtitle:"", category:"Food", imageUrl:"", description:"",
    facts:[{tl:"",en:"",es:"",de:""}],
    vocabulary:[{word:"",en:"",es:"",de:""}],
    culturalNote:"" };
}

function PilForm({ entry, onSave, onCancel, saving }) {
  const init = entry ? { ...entry, imageUrl: entry.image || "" } : emptyPil();
  const [f, setF] = useState(init);
  const set = k => v => setF(p=>({...p,[k]:v}));

  function updateFact(i, k, v) { const a=[...f.facts]; a[i]={...a[i],[k]:v}; setF(p=>({...p,facts:a})); }
  function addFact() { setF(p=>({...p,facts:[...p.facts,{tl:"",en:"",es:"",de:""}]})); }
  function removeFact(i) { setF(p=>({...p,facts:p.facts.filter((_,j)=>j!==i)})); }

  function updateVocab(i, k, v) { const a=[...f.vocabulary]; a[i]={...a[i],[k]:v}; setF(p=>({...p,vocabulary:a})); }
  function addVocab() { setF(p=>({...p,vocabulary:[...p.vocabulary,{word:"",en:"",es:"",de:""}]})); }
  function removeVocab(i) { setF(p=>({...p,vocabulary:p.vocabulary.filter((_,j)=>j!==i)})); }

  return (
    <div style={{ background:"white", borderRadius:"16px", padding:"24px", border:`1px solid ${BORDER}`, marginTop:"16px" }}>
      <h3 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"18px", color:DARK, marginBottom:"16px" }}>{entry?"Edit Entry":"Add New Entry"}</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <F label="Title *" value={f.title} onChange={set("title")} placeholder="e.g. Adobo"/>
        <F label="Subtitle" value={f.subtitle} onChange={set("subtitle")} placeholder="e.g. Pambansang Ulam · National Dish"/>
        <F label="Image URL" value={f.imageUrl} onChange={set("imageUrl")} placeholder="https://..."/>
        <Sel label="Category" value={f.category} onChange={set("category")} options={["Food","Culture","Activities"]}/>
      </div>
      <F label="Description *" value={f.description} onChange={set("description")} multi placeholder="Describe this food, cultural practice, or activity..."/>

      <div style={{ marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
          <p style={{ fontSize:"11px", fontWeight:700, color:MID, textTransform:"uppercase", letterSpacing:"0.8px" }}>Facts / Katotohanan</p>
          <Btn onClick={addFact} small outline>+ Add Fact</Btn>
        </div>
        {f.facts.map((fact, i) => (
          <div key={i} style={{ background:"#F8F4EE", borderRadius:"12px", padding:"12px", marginBottom:"8px", border:`1px solid ${BORDER}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
              <span style={{ fontSize:"12px", fontWeight:700, color:MID }}>Fact {i+1}</span>
              {f.facts.length > 1 && <button onClick={()=>removeFact(i)} style={{ background:"none", border:"none", cursor:"pointer", color:RED, fontSize:"13px", fontWeight:700 }}>✕ Remove</button>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0 8px" }}>
              <F label="Tagalog" value={fact.tl} onChange={v=>updateFact(i,"tl",v)} placeholder="Tagalog fact"/>
              <F label="English" value={fact.en} onChange={v=>updateFact(i,"en",v)} placeholder="English fact"/>
              <F label="Español" value={fact.es} onChange={v=>updateFact(i,"es",v)} placeholder="Spanish fact"/>
              <F label="Deutsch" value={fact.de} onChange={v=>updateFact(i,"de",v)} placeholder="German fact"/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
          <p style={{ fontSize:"11px", fontWeight:700, color:MID, textTransform:"uppercase", letterSpacing:"0.8px" }}>Vocabulary / Talasalitaan</p>
          <Btn onClick={addVocab} small outline>+ Add Word</Btn>
        </div>
        {f.vocabulary.map((v, i) => (
          <div key={i} style={{ background:"#F8F4EE", borderRadius:"12px", padding:"12px", marginBottom:"8px", border:`1px solid ${BORDER}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
              <span style={{ fontSize:"12px", fontWeight:700, color:MID }}>Word {i+1}</span>
              {f.vocabulary.length > 1 && <button onClick={()=>removeVocab(i)} style={{ background:"none", border:"none", cursor:"pointer", color:RED, fontSize:"13px", fontWeight:700 }}>✕ Remove</button>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"0 8px" }}>
              <F label="Tagalog Word" value={v.word} onChange={val=>updateVocab(i,"word",val)} placeholder="e.g. suka"/>
              <F label="English" value={v.en} onChange={val=>updateVocab(i,"en",val)} placeholder="e.g. vinegar"/>
              <F label="Español" value={v.es} onChange={val=>updateVocab(i,"es",val)} placeholder="e.g. vinagre"/>
              <F label="Deutsch" value={v.de} onChange={val=>updateVocab(i,"de",val)} placeholder="e.g. Essig"/>
            </div>
          </div>
        ))}
      </div>

      <F label="Cultural Note / Tala" value={f.culturalNote} onChange={set("culturalNote")} multi placeholder="Cultural context, traditions, interesting background..."/>
      <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
        <Btn onClick={()=>onSave(f,entry?.id)}>{saving?"Saving...":"💾 Save"}</Btn>
        <Btn onClick={onCancel} outline>Cancel</Btn>
      </div>
    </div>
  );
}

// ── ENTRIES LIST ──────────────────────────────────────────

function EntryList({ entries, getName, onEdit, onDelete, onAdd, tabColor, addLabel }) {
  const [confirmId, setConfirmId] = useState(null);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <p style={{ fontSize:"14px", color:MID, fontWeight:600 }}>{entries.length} {entries.length===1?"entry":"entries"}</p>
        <Btn onClick={onAdd} color={tabColor}>+ {addLabel}</Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {entries.map(e => (
          <div key={e.id} style={{ background:"white", borderRadius:"12px", padding:"14px 18px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontFamily:"'Baloo 2',cursive", fontSize:"16px", fontWeight:700, color:DARK }}>{getName(e)}</span>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              {confirmId===e.id ? (
                <>
                  <span style={{ fontSize:"13px", color:RED, fontWeight:600 }}>Delete?</span>
                  <Btn onClick={()=>{ onDelete(e.id); setConfirmId(null); }} small red>Yes</Btn>
                  <Btn onClick={()=>setConfirmId(null)} small outline>No</Btn>
                </>
              ) : (
                <>
                  <Btn onClick={()=>onEdit(e)} small outline>✏️ Edit</Btn>
                  <Btn onClick={()=>setConfirmId(e.id)} small red outline>🗑️</Btn>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SECTION PANELS ────────────────────────────────────────

function DictionaryPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("dictionary_words").select("*").order("created_at", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(data, id) {
    setSaving(true);
    try {
      const row = { tagalog:data.tagalog, alternatives:data.alternatives||[], pronunciation:data.pronunciation, part_of_speech:data.partOfSpeech, definition:data.definition, translation_en:data.translation_en, example_tl_en:data.example_tl_en, example_tr_en:data.example_tr_en, translation_es:data.translation_es, example_tl_es:data.example_tl_es, example_tr_es:data.example_tr_es, translation_de:data.translation_de, example_tl_de:data.example_tl_de, example_tr_de:data.example_tr_de, cultural_note:data.culturalNote, search_terms:data.searchTerms||[] };
      if (id) await supabase.from("dictionary_words").update(row).eq("id", id);
      else await supabase.from("dictionary_words").insert([row]);
      setMsg("✅ Saved successfully!"); setShowForm(false); setEditing(null); load();
    } catch(e) { setMsg("❌ Error saving. Please try again."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id) {
    await supabase.from("dictionary_words").delete().eq("id", id);
    setMsg("✅ Deleted."); load();
    setTimeout(() => setMsg(""), 2000);
  }

  function handleEdit(e) {
    setEditing({ tagalog:e.tagalog, alternatives:(e.alternatives||[]).join(", "), pronunciation:e.pronunciation, partOfSpeech:e.part_of_speech, definition:e.definition, translation_en:e.translation_en, example_tl_en:e.example_tl_en, example_tr_en:e.example_tr_en, translation_es:e.translation_es, example_tl_es:e.example_tl_es, example_tr_es:e.example_tr_es, translation_de:e.translation_de, example_tl_de:e.example_tl_de, example_tr_de:e.example_tr_de, culturalNote:e.cultural_note, searchTerms:(e.search_terms||[]).join(", "), id:e.id });
    setShowForm(true);
  }

  if (loading) return <p style={{ color:MID, fontSize:"14px" }}>Loading...</p>;
  return (
    <div>
      <Msg msg={msg}/>
      {(!showForm) && <EntryList entries={entries} getName={e=>e.tagalog} onEdit={handleEdit} onDelete={handleDelete} onAdd={()=>{setEditing(null);setShowForm(true);}} tabColor={TEAL} addLabel="Add Word"/>}
      {showForm && <DictForm entry={editing} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null);}} saving={saving}/>}
    </div>
  );
}

function LitPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("lit_words").select("*").order("created_at", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(data, id) {
    setSaving(true);
    try {
      const row = { word:data.word, pronunciation:data.pronunciation, teaser:data.teaser, category:data.category, concept:data.concept, closest_en:data.closest_en, explanation_en:data.explanation_en, example_tl_en:data.example_tl_en, example_tr_en:data.example_tr_en, closest_es:data.closest_es, explanation_es:data.explanation_es, example_tl_es:data.example_tl_es, example_tr_es:data.example_tr_es, closest_de:data.closest_de, explanation_de:data.explanation_de, example_tl_de:data.example_tl_de, example_tr_de:data.example_tr_de, cultural_note:data.culturalNote };
      if (id) await supabase.from("lit_words").update(row).eq("id", id);
      else await supabase.from("lit_words").insert([row]);
      setMsg("✅ Saved successfully!"); setShowForm(false); setEditing(null); load();
    } catch(e) { setMsg("❌ Error saving. Please try again."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id) {
    await supabase.from("lit_words").delete().eq("id", id);
    setMsg("✅ Deleted."); load();
    setTimeout(() => setMsg(""), 2000);
  }

  function handleEdit(e) {
    setEditing({ word:e.word, pronunciation:e.pronunciation, teaser:e.teaser, category:e.category, concept:e.concept, closest_en:e.closest_en, explanation_en:e.explanation_en, example_tl_en:e.example_tl_en, example_tr_en:e.example_tr_en, closest_es:e.closest_es, explanation_es:e.explanation_es, example_tl_es:e.example_tl_es, example_tr_es:e.example_tr_es, closest_de:e.closest_de, explanation_de:e.explanation_de, example_tl_de:e.example_tl_de, example_tr_de:e.example_tr_de, culturalNote:e.cultural_note, id:e.id });
    setShowForm(true);
  }

  if (loading) return <p style={{ color:MID, fontSize:"14px" }}>Loading...</p>;
  return (
    <div>
      <Msg msg={msg}/>
      {!showForm && <EntryList entries={entries} getName={e=>e.word} onEdit={handleEdit} onDelete={handleDelete} onAdd={()=>{setEditing(null);setShowForm(true);}} tabColor={TEAL} addLabel="Add Word"/>}
      {showForm && <LitForm entry={editing} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null);}} saving={saving}/>}
    </div>
  );
}

function PhrasesPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("phrases").select("*").order("created_at", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(data, id) {
    setSaving(true);
    try {
      const row = { phrase:data.phrase, pronunciation:data.pronunciation, theme:data.theme, tagline:data.tagline, how_to_use:data.howToUse, translation_en:data.translation_en, example_tl_en:data.example_tl_en, example_tr_en:data.example_tr_en, translation_es:data.translation_es, example_tl_es:data.example_tl_es, example_tr_es:data.example_tr_es, translation_de:data.translation_de, example_tl_de:data.example_tl_de, example_tr_de:data.example_tr_de, cultural_tip:data.culturalTip };
      if (id) await supabase.from("phrases").update(row).eq("id", id);
      else await supabase.from("phrases").insert([row]);
      setMsg("✅ Saved successfully!"); setShowForm(false); setEditing(null); load();
    } catch(e) { setMsg("❌ Error saving. Please try again."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id) {
    await supabase.from("phrases").delete().eq("id", id);
    setMsg("✅ Deleted."); load();
    setTimeout(() => setMsg(""), 2000);
  }

  function handleEdit(e) {
    setEditing({ phrase:e.phrase, pronunciation:e.pronunciation, theme:e.theme, tagline:e.tagline, howToUse:e.how_to_use, translation_en:e.translation_en, example_tl_en:e.example_tl_en, example_tr_en:e.example_tr_en, translation_es:e.translation_es, example_tl_es:e.example_tl_es, example_tr_es:e.example_tr_es, translation_de:e.translation_de, example_tl_de:e.example_tl_de, example_tr_de:e.example_tr_de, culturalTip:e.cultural_tip, id:e.id });
    setShowForm(true);
  }

  if (loading) return <p style={{ color:MID, fontSize:"14px" }}>Loading...</p>;
  return (
    <div>
      <Msg msg={msg}/>
      {!showForm && <EntryList entries={entries} getName={e=>e.phrase} onEdit={handleEdit} onDelete={handleDelete} onAdd={()=>{setEditing(null);setShowForm(true);}} tabColor={GOLD} addLabel="Add Phrase"/>}
      {showForm && <PhraseForm entry={editing} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null);}} saving={saving}/>}
    </div>
  );
}

function PilipinasPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("pilipinas_entries").select("*").order("created_at", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(data, id) {
    setSaving(true);
    try {
      const row = { title:data.title, subtitle:data.subtitle, category:data.category, image_url:data.imageUrl, description:data.description, facts:data.facts, vocabulary:data.vocabulary, cultural_note:data.culturalNote };
      if (id) await supabase.from("pilipinas_entries").update(row).eq("id", id);
      else await supabase.from("pilipinas_entries").insert([row]);
      setMsg("✅ Saved successfully!"); setShowForm(false); setEditing(null); load();
    } catch(e) { setMsg("❌ Error saving. Please try again."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id) {
    await supabase.from("pilipinas_entries").delete().eq("id", id);
    setMsg("✅ Deleted."); load();
    setTimeout(() => setMsg(""), 2000);
  }

  function handleEdit(e) {
    setEditing({ title:e.title, subtitle:e.subtitle, category:e.category, imageUrl:e.image_url, description:e.description, facts:e.facts||[], vocabulary:e.vocabulary||[], culturalNote:e.cultural_note, id:e.id });
    setShowForm(true);
  }

  if (loading) return <p style={{ color:MID, fontSize:"14px" }}>Loading...</p>;
  return (
    <div>
      <Msg msg={msg}/>
      {!showForm && <EntryList entries={entries} getName={e=>e.title} onEdit={handleEdit} onDelete={handleDelete} onAdd={()=>{setEditing(null);setShowForm(true);}} tabColor={AMBER} addLabel="Add Entry"/>}
      {showForm && <PilForm entry={editing} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null);}} saving={saving}/>}
    </div>
  );
}

// ── MAIN ADMIN COMPONENT ──────────────────────────────────

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("wf_admin") === "1");
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary");
  const [hovTab, setHovTab] = useState(null);

  function handleLogin() {
    if (pwd === PWD) { sessionStorage.setItem("wf_admin","1"); setLoggedIn(true); setPwdError(false); }
    else { setPwdError(true); }
  }

  function handleLogout() { sessionStorage.removeItem("wf_admin"); setLoggedIn(false); setPwd(""); }

  // Login screen
  if (!loggedIn) return (
    <div style={{ minHeight:"100vh", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ background:"white", borderRadius:"24px", padding:"48px 40px", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 8px 40px rgba(10,22,40,0.3)" }}>
        <div style={{ fontSize:"36px", marginBottom:"12px" }}>🇵🇭</div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"24px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Wikang Filipino</h1>
        <p style={{ fontSize:"14px", color:MID, marginBottom:"32px" }}>Admin Panel</p>
        <input
          type="password" value={pwd} onChange={e=>setPwd(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="Enter password"
          style={{ width:"100%", padding:"12px 16px", borderRadius:"12px", border:`1.5px solid ${pwdError?"#E05050":BORDER}`, fontFamily:"'Nunito',sans-serif", fontSize:"15px", color:DARK, outline:"none", boxSizing:"border-box", marginBottom:"8px" }}
        />
        {pwdError && <p style={{ color:"#E05050", fontSize:"13px", marginBottom:"12px" }}>Incorrect password. Try again.</p>}
        <button onClick={handleLogin} style={{ width:"100%", background:NAVY, color:"white", border:"none", borderRadius:"12px", padding:"13px", fontFamily:"'Nunito',sans-serif", fontSize:"15px", fontWeight:700, cursor:"pointer", marginTop:"8px" }}>
          Log In
        </button>
      </div>
    </div>
  );

  // Dashboard
  const activeTabConfig = TABS.find(t=>t.key===activeTab);
  return (
    <div style={{ minHeight:"100vh", background:"#F4F0EB", fontFamily:"'Nunito',sans-serif" }}>

      {/* Header */}
      <div style={{ background:NAVY, padding:"0 32px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"20px" }}>🇵🇭</span>
          <span style={{ fontFamily:"'Baloo 2',cursive", fontWeight:800, fontSize:"18px", color:"white" }}>Wikang Filipino</span>
          <span style={{ fontSize:"12px", background:"rgba(32,178,140,0.2)", color:TEAL, borderRadius:"100px", padding:"2px 10px", fontWeight:700, letterSpacing:"0.5px" }}>ADMIN</span>
        </div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          <a href="/" style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)", textDecoration:"none", fontWeight:600 }}>← Back to site</a>
          <button onClick={handleLogout} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.7)", borderRadius:"100px", padding:"6px 16px", fontFamily:"'Nunito',sans-serif", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>Log out</button>
        </div>
      </div>

      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Welcome */}
        <div style={{ marginBottom:"24px" }}>
          <h2 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"26px", fontWeight:800, color:DARK, marginBottom:"4px" }}>Magandang araw! 👋</h2>
          <p style={{ fontSize:"14px", color:MID }}>Add, edit, or delete content across all sections of Wikang Filipino.</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"28px" }}>
          {TABS.map(tab => (
            <div key={tab.key} style={{ background:"white", borderRadius:"14px", padding:"16px", border:`1px solid ${BORDER}`, textAlign:"center" }}>
              <div style={{ fontSize:"24px", marginBottom:"4px" }}>{tab.icon}</div>
              <p style={{ fontFamily:"'Baloo 2',cursive", fontSize:"15px", fontWeight:700, color:DARK }}>{tab.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
              onMouseEnter={()=>setHovTab(tab.key)} onMouseLeave={()=>setHovTab(null)}
              style={{ background:activeTab===tab.key?tab.color:"white", color:activeTab===tab.key?"white":MID, border:`1.5px solid ${activeTab===tab.key?tab.color:BORDER}`, borderRadius:"100px", padding:"9px 22px", fontFamily:"'Nunito',sans-serif", fontSize:"14px", fontWeight:700, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:"6px" }}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background:"white", borderRadius:"20px", padding:"28px", border:`1px solid ${BORDER}`, boxShadow:"0 2px 16px rgba(26,16,6,0.06)" }}>
          <h3 style={{ fontFamily:"'Baloo 2',cursive", fontSize:"20px", fontWeight:700, color:DARK, marginBottom:"20px", display:"flex", alignItems:"center", gap:"8px" }}>
            <span>{activeTabConfig?.icon}</span>
            <span>{activeTabConfig?.label}</span>
          </h3>
          {activeTab==="dictionary" && <DictionaryPanel/>}
          {activeTab==="lit" && <LitPanel/>}
          {activeTab==="phrases" && <PhrasesPanel/>}
          {activeTab==="pilipinas" && <PilipinasPanel/>}
        </div>
      </div>
    </div>
  );
}
