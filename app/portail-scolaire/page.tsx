'use client'

import { useState } from 'react'

type Role = 'home' | 'direction' | 'teacher' | 'student'
type Student = { id:string; name:string; level:string; section:string; year:string }

export default function PortailScolairePage(){
  const [lang,setLang]=useState<'ht'|'fr'>('ht')
  const [role,setRole]=useState<Role>('home')
  const [editing,setEditing]=useState<number|null>(null)
  const [students,setStudents]=useState<Student[]>([
    {id:'ELV-001',name:'Jean Michel',level:'9e Année Fondamentale',section:'A',year:'2026–2027'},
    {id:'ELV-002',name:'Marie Joseph',level:'9e Année Fondamentale',section:'A',year:'2026–2027'},
    {id:'ELV-003',name:'David Pierre',level:'8e Année Fondamentale',section:'B',year:'2026–2027'},
  ])
  const ht=lang==='ht'
  const s=students[0]

  const save=(formData:FormData)=>{
    if(editing===null) return
    const next=[...students]
    next[editing]={...next[editing],name:String(formData.get('name')||''),level:String(formData.get('level')||''),section:String(formData.get('section')||''),year:String(formData.get('year')||'')}
    setStudents(next); setEditing(null)
  }

  return <main className="ps-page">
    <style jsx global>{`
      body{margin:0;background:#f4f7fb;color:#14213d;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
      *{box-sizing:border-box}.ps-page{min-height:100vh}.top{background:linear-gradient(135deg,#123a63,#0f4c81);color:#fff;padding:16px;position:sticky;top:0;z-index:10}.bar{max-width:1000px;margin:auto;display:flex;align-items:center;gap:11px}.logo{width:44px;height:44px;border-radius:13px;background:#fff;color:#0f4c81;display:grid;place-items:center;font-weight:800}.brand{font-weight:800;font-size:18px}.spacer{flex:1}.lang{border:1px solid rgba(255,255,255,.55);background:transparent;color:white;border-radius:10px;padding:8px 11px;font-weight:800}.wrap{max-width:1000px;margin:auto;padding:12px}.card{background:#fff;border:1px solid #dde6ef;border-radius:18px;padding:18px;margin-bottom:14px;box-shadow:0 8px 24px rgba(20,33,61,.06)}.muted{color:#6b7280}.roles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.role,.menuBtn{border:1px solid #dde6ef;background:#fff;border-radius:15px;padding:16px;text-align:left;color:#14213d;cursor:pointer}.role:hover,.menuBtn:hover{background:#eaf3fb}.icon{font-size:29px;display:block;margin-bottom:8px}.rt{font-weight:800;display:block;margin-bottom:5px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.stat{border:1px solid #dde6ef;background:#f8fafc;border-radius:14px;padding:14px}.stat strong{display:block;font-size:22px}.btn{border:0;border-radius:11px;padding:11px 14px;background:#0f4c81;color:#fff;font-weight:800;cursor:pointer}.secondary{background:#eef3f8;color:#0f4c81}.menu{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #dde6ef;text-align:left;font-size:14px}th{font-size:12px;color:#6b7280;text-transform:uppercase}.studentHead{padding:14px;border:1px solid #dde6ef;border-radius:14px;background:#f8fafc;margin-bottom:14px}.studentHead .name{font-size:20px;font-weight:800}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}label{display:block;font-size:13px;font-weight:800;margin-bottom:5px}input{width:100%;padding:11px;border:1px solid #dde6ef;border-radius:11px}.row{display:flex;gap:8px;flex-wrap:wrap}.notice{background:#f8fbff;border:1px solid #cfe0f0;border-radius:12px;padding:12px;color:#36566f}@media(max-width:720px){.roles,.stats,.menu,.grid2{grid-template-columns:1fr}.brand{font-size:17px}.card{padding:15px}table{display:block;overflow-x:auto}}
    `}</style>
    <header className="top"><div className="bar"><div className="logo">PS</div><div className="brand">Portail Scolaire Haïti</div><div className="spacer"/><button className="lang" onClick={()=>setLang(ht?'fr':'ht')}>{ht?'Français':'Kreyòl'}</button></div></header>
    <div className="wrap">
      {role==='home' && <section className="card"><h2>{ht?'Byenveni':'Bienvenue'}</h2><p className="muted">{ht?'Chwazi pwofil ou pou antre sou platfòm lekòl la.':'Choisissez votre profil pour accéder à la plateforme scolaire.'}</p><div className="roles">
        <button className="role" onClick={()=>setRole('direction')}><span className="icon">🏫</span><span className="rt">{ht?'Direksyon / Administrasyon':'Direction / Administration'}</span><span className="muted">{ht?'Jere elèv, nòt ak bilten.':'Gérer les élèves, notes et bulletins.'}</span></button>
        <button className="role" onClick={()=>setRole('teacher')}><span className="icon">👩🏽‍🏫</span><span className="rt">{ht?'Pwofesè':'Enseignant'}</span><span className="muted">{ht?'Antre epi voye nòt.':'Saisir et envoyer les notes.'}</span></button>
        <button className="role" onClick={()=>setRole('student')}><span className="icon">🎓</span><span className="rt">{ht?'Elèv':'Élève'}</span><span className="muted">{ht?'Gade nòt ak bilten.':'Consulter les notes et bulletins.'}</span></button>
      </div></section>}

      {role==='direction' && <><button className="btn secondary" onClick={()=>setRole('home')}>← {ht?'Retounen':'Retour'}</button><div style={{height:12}}/>
        <section className="card"><h2>{ht?'Tablo de bò Direksyon':'Tableau de bord Direction'}</h2><div className="stats"><div className="stat"><strong>{students.length}</strong><small>{ht?'Elèv':'Élèves'}</small></div><div className="stat"><strong>2</strong><small>{ht?'Pwofesè':'Enseignants'}</small></div><div className="stat"><strong>2</strong><small>{ht?'Nòt an atant':'Notes en attente'}</small></div><div className="stat"><strong>2026–2027</strong><small>{ht?'Ane akademik':'Année académique'}</small></div></div></section>
        <section className="card"><h3>{ht?'Jere elèv':'Gérer les élèves'}</h3><table><thead><tr><th>ID</th><th>{ht?'Non':'Nom'}</th><th>{ht?'Nivo':'Niveau'}</th><th>{ht?'Seksyon':'Section'}</th><th>{ht?'Aksyon':'Action'}</th></tr></thead><tbody>{students.map((x,i)=><tr key={x.id}><td>{x.id}</td><td>{x.name}</td><td>{x.level}</td><td>{x.section}</td><td><button className="btn" onClick={()=>setEditing(i)}>{ht?'Modifye':'Modifier'}</button></td></tr>)}</tbody></table></section>
        {editing!==null && <section className="card"><h3>{ht?'Modifye elèv':'Modifier l’élève'}</h3><form action={save}><div className="grid2"><div><label>{ht?'Non elèv':'Nom de l’élève'}</label><input name="name" defaultValue={students[editing].name}/></div><div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><input name="level" defaultValue={students[editing].level}/></div><div><label>{ht?'Seksyon':'Section'}</label><input name="section" defaultValue={students[editing].section}/></div><div><label>{ht?'Ane akademik':'Année académique'}</label><input name="year" defaultValue={students[editing].year}/></div></div><div className="row" style={{marginTop:12}}><button className="btn" type="submit">{ht?'Anrejistre chanjman':'Enregistrer les modifications'}</button><button className="btn secondary" type="button" onClick={()=>setEditing(null)}>{ht?'Anile':'Annuler'}</button></div></form></section>}
      </>}

      {role==='teacher' && <><button className="btn secondary" onClick={()=>setRole('home')}>← {ht?'Retounen':'Retour'}</button><div style={{height:12}}/><section className="card"><h2>{ht?'Tablo de bò Pwofesè':'Tableau de bord Enseignant'}</h2><div className="menu"><div className="menuBtn">📝 {ht?'Antre nòt':'Saisir les notes'}</div><div className="menuBtn">📤 {ht?'Nòt mwen voye':'Notes envoyées'}</div><div className="menuBtn">🏫 {ht?'Klas mwen yo':'Mes classes'}</div><div className="menuBtn">📊 {ht?'Rezime klas':'Résumé de classe'}</div></div></section></>}

      {role==='student' && <><button className="btn secondary" onClick={()=>setRole('home')}>← {ht?'Retounen':'Retour'}</button><div style={{height:12}}/><section className="card"><h2>{ht?'Tablo de bò Elèv':'Tableau de bord Élève'}</h2><div className="studentHead"><div className="name">{s.name}</div><div><b>{s.level} – {ht?'Seksyon':'Section'} {s.section}</b></div><div className="muted">{ht?'Ane akademik:':'Année académique :'} {s.year}</div></div><div className="stats"><div className="stat"><strong>88%</strong><small>{ht?'Mwayèn jeneral':'Moyenne générale'}</small></div><div className="stat"><strong>4</strong><small>{ht?'Matiyè':'Matières'}</small></div><div className="stat"><strong>1</strong><small>{ht?'Bilten':'Bulletin'}</small></div><div className="stat"><strong>4</strong><small>{ht?'Nòt pibliye':'Notes publiées'}</small></div></div></section><section className="card"><h3>{ht?'Nòt mwen':'Mes notes'}</h3><table><tbody><tr><td>Mathématiques</td><td>88%</td></tr><tr><td>Français</td><td>91%</td></tr><tr><td>Sciences</td><td>84%</td></tr><tr><td>Anglais</td><td>89%</td></tr></tbody></table></section></>}
    </div>
  </main>
}
