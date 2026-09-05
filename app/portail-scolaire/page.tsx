'use client'

import { useState } from 'react'

type Role = 'home' | 'direction' | 'teacher' | 'student'
type DirectionView = 'home' | 'students' | 'teachers' | 'classes' | 'subjects' | 'pending' | 'publish'
type TeacherView = 'home' | 'grades' | 'sent' | 'classes' | 'summary'
type StudentView = 'home' | 'grades' | 'report' | 'averages'
type Student = { id:string; name:string; level:string; section:string; year:string }

export default function PortailScolairePage(){
  const [lang,setLang]=useState<'ht'|'fr'>('ht')
  const [role,setRole]=useState<Role>('home')
  const [directionView,setDirectionView]=useState<DirectionView>('home')
  const [teacherView,setTeacherView]=useState<TeacherView>('home')
  const [studentView,setStudentView]=useState<StudentView>('home')
  const [editing,setEditing]=useState<number|null>(null)
  const [students,setStudents]=useState<Student[]>([
    {id:'ELV-001',name:'Jean Michel',level:'9e Année Fondamentale',section:'A',year:'2026–2027'},
    {id:'ELV-002',name:'Marie Joseph',level:'9e Année Fondamentale',section:'A',year:'2026–2027'},
    {id:'ELV-003',name:'David Pierre',level:'8e Année Fondamentale',section:'B',year:'2026–2027'},
  ])

  const ht=lang==='ht'
  const s=students[0]
  const goHome=()=>{setRole('home');setDirectionView('home');setTeacherView('home');setStudentView('home');setEditing(null)}
  const save=(formData:FormData)=>{
    if(editing===null) return
    const next=[...students]
    next[editing]={...next[editing],name:String(formData.get('name')||''),level:String(formData.get('level')||''),section:String(formData.get('section')||''),year:String(formData.get('year')||'')}
    setStudents(next); setEditing(null)
  }

  const Back=({onClick}:{onClick:()=>void})=><button className="btn secondary" onClick={onClick}>← {ht?'Retounen':'Retour'}</button>

  return <main className="ps-page">
    <style jsx global>{`
      body{margin:0;background:#f4f7fb;color:#14213d;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
      *{box-sizing:border-box}.ps-page{min-height:100vh}.top{background:linear-gradient(135deg,#123a63,#0f4c81);color:#fff;padding:16px}.bar{max-width:1000px;margin:auto;display:flex;align-items:center;gap:11px}.logo{width:44px;height:44px;border-radius:13px;background:#fff;color:#0f4c81;display:grid;place-items:center;font-weight:800;flex:0 0 auto}.brand{font-weight:800;font-size:18px}.wrap{max-width:1000px;margin:auto;padding:12px}.langPanel{max-width:1000px;margin:12px auto 0;display:flex;gap:8px;background:rgba(255,255,255,.12);padding:6px;border-radius:13px}.langChoice{flex:1;border:1px solid rgba(255,255,255,.38);background:transparent;color:#fff;border-radius:9px;padding:10px 12px;font-weight:800}.langChoice.active{background:#fff;color:#0f4c81}.card{background:#fff;border:1px solid #dde6ef;border-radius:18px;padding:18px;margin-bottom:14px;box-shadow:0 8px 24px rgba(20,33,61,.06)}.muted{color:#6b7280}.roles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.role,.menuBtn{border:1px solid #dde6ef;background:#fff;border-radius:15px;padding:16px;text-align:left;color:#14213d;cursor:pointer;width:100%;font:inherit}.role:active,.menuBtn:active{background:#dcebf7}.icon{font-size:29px;display:block;margin-bottom:8px}.rt{font-weight:800;display:block;margin-bottom:5px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.stat{border:1px solid #dde6ef;background:#f8fafc;border-radius:14px;padding:14px}.stat strong{display:block;font-size:22px}.btn{border:0;border-radius:11px;padding:11px 14px;background:#0f4c81;color:#fff;font-weight:800;cursor:pointer;font:inherit}.secondary{background:#eef3f8;color:#0f4c81}.menu{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #dde6ef;text-align:left;font-size:14px}th{font-size:12px;color:#6b7280;text-transform:uppercase}.studentHead{padding:14px;border:1px solid #dde6ef;border-radius:14px;background:#f8fafc;margin-bottom:14px}.studentHead .name{font-size:20px;font-weight:800}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}label{display:block;font-size:13px;font-weight:800;margin-bottom:5px}input,select{width:100%;padding:11px;border:1px solid #dde6ef;border-radius:11px;background:#fff}.row{display:flex;gap:8px;flex-wrap:wrap}.notice{background:#f8fbff;border:1px solid #cfe0f0;border-radius:12px;padding:12px;color:#36566f}.bigMenu{display:grid;gap:10px}.bigMenu .menuBtn{font-weight:700}.score{font-weight:800;color:#0f4c81}@media(max-width:720px){.roles,.stats,.menu,.grid2{grid-template-columns:1fr}.brand{font-size:17px}.card{padding:15px}table{display:block;overflow-x:auto}.langPanel{margin-top:12px}}
    `}</style>

    <header className="top">
      <div className="bar"><div className="logo">PS</div><div className="brand">Portail Scolaire Haïti</div></div>
      <div className="langPanel"><button className={`langChoice ${ht?'active':''}`} onClick={()=>setLang('ht')}>Kreyòl</button><button className={`langChoice ${!ht?'active':''}`} onClick={()=>setLang('fr')}>Français</button></div>
    </header>

    <div className="wrap">
      {role==='home' && <section className="card"><h2>{ht?'Byenveni':'Bienvenue'}</h2><p className="muted">{ht?'Chwazi pwofil ou pou antre sou platfòm lekòl la.':'Choisissez votre profil pour accéder à la plateforme scolaire.'}</p><div className="roles">
        <button className="role" onClick={()=>{setRole('direction');setDirectionView('home')}}><span className="icon">🏫</span><span className="rt">{ht?'Direksyon / Administrasyon':'Direction / Administration'}</span><span className="muted">{ht?'Jere elèv, nòt ak bilten.':'Gérer les élèves, notes et bulletins.'}</span></button>
        <button className="role" onClick={()=>{setRole('teacher');setTeacherView('home')}}><span className="icon">👩🏽‍🏫</span><span className="rt">{ht?'Pwofesè':'Enseignant'}</span><span className="muted">{ht?'Antre epi voye nòt.':'Saisir et envoyer les notes.'}</span></button>
        <button className="role" onClick={()=>{setRole('student');setStudentView('home')}}><span className="icon">🎓</span><span className="rt">{ht?'Elèv':'Élève'}</span><span className="muted">{ht?'Gade nòt ak bilten.':'Consulter les notes et bulletins.'}</span></button>
      </div></section>}

      {role==='direction' && <>
        <Back onClick={directionView==='home'?goHome:()=>{setDirectionView('home');setEditing(null)}}/><div style={{height:12}}/>
        {directionView==='home' && <><section className="card"><h2>{ht?'Tablo de bò Direksyon':'Tableau de bord Direction'}</h2><div className="stats"><div className="stat"><strong>{students.length}</strong><small>{ht?'Elèv':'Élèves'}</small></div><div className="stat"><strong>2</strong><small>{ht?'Pwofesè':'Enseignants'}</small></div><div className="stat"><strong>2</strong><small>{ht?'Nòt an atant':'Notes en attente'}</small></div><div className="stat"><strong>2026–2027</strong><small>{ht?'Ane akademik':'Année académique'}</small></div></div></section><section className="card"><h3>{ht?'Aksyon rapid':'Actions rapides'}</h3><div className="bigMenu"><button className="menuBtn" onClick={()=>setDirectionView('students')}>👥 {ht?'Jere elèv':'Gérer les élèves'}</button><button className="menuBtn" onClick={()=>setDirectionView('teachers')}>👩🏽‍🏫 {ht?'Jere pwofesè':'Gérer les enseignants'}</button><button className="menuBtn" onClick={()=>setDirectionView('classes')}>🏫 {ht?'Klas & seksyon':'Classes & sections'}</button><button className="menuBtn" onClick={()=>setDirectionView('subjects')}>📚 {ht?'Matiyè':'Matières'}</button><button className="menuBtn" onClick={()=>setDirectionView('pending')}>⏳ {ht?'Nòt an atant':'Notes en attente'}</button><button className="menuBtn" onClick={()=>setDirectionView('publish')}>📄 {ht?'Pibliye bilten':'Publier les bulletins'}</button></div></section></>}
        {directionView==='students' && <section className="card"><h2>{ht?'Jere elèv':'Gérer les élèves'}</h2><table><thead><tr><th>ID</th><th>{ht?'Non':'Nom'}</th><th>{ht?'Nivo':'Niveau'}</th><th>{ht?'Seksyon':'Section'}</th><th>{ht?'Aksyon':'Action'}</th></tr></thead><tbody>{students.map((x,i)=><tr key={x.id}><td>{x.id}</td><td>{x.name}</td><td>{x.level}</td><td>{x.section}</td><td><button className="btn" onClick={()=>setEditing(i)}>{ht?'Modifye':'Modifier'}</button></td></tr>)}</tbody></table>{editing!==null && <form action={save} style={{marginTop:18}}><h3>{ht?'Modifye elèv':'Modifier l’élève'}</h3><div className="grid2"><div><label>{ht?'Non elèv':'Nom de l’élève'}</label><input name="name" defaultValue={students[editing].name}/></div><div><label>{ht?'Klas / Nivo':'Classe / Niveau'}</label><input name="level" defaultValue={students[editing].level}/></div><div><label>{ht?'Seksyon':'Section'}</label><input name="section" defaultValue={students[editing].section}/></div><div><label>{ht?'Ane akademik':'Année académique'}</label><input name="year" defaultValue={students[editing].year}/></div></div><div className="row" style={{marginTop:12}}><button className="btn" type="submit">{ht?'Anrejistre':'Enregistrer'}</button><button className="btn secondary" type="button" onClick={()=>setEditing(null)}>{ht?'Anile':'Annuler'}</button></div></form>}</section>}
        {directionView==='teachers' && <section className="card"><h2>{ht?'Jere pwofesè':'Gérer les enseignants'}</h2><div className="notice">{ht?'Lis pwofesè yo ak matyè yo pral jere isit la.':'La liste des enseignants et leurs matières sera gérée ici.'}</div></section>}
        {directionView==='classes' && <section className="card"><h2>{ht?'Klas & seksyon':'Classes & sections'}</h2><div className="bigMenu"><div className="menuBtn">9e Année Fondamentale — Section A</div><div className="menuBtn">8e Année Fondamentale — Section B</div></div></section>}
        {directionView==='subjects' && <section className="card"><h2>{ht?'Matiyè':'Matières'}</h2><div className="bigMenu"><div className="menuBtn">Mathématiques</div><div className="menuBtn">Français</div><div className="menuBtn">Sciences</div><div className="menuBtn">Anglais</div></div></section>}
        {directionView==='pending' && <section className="card"><h2>{ht?'Nòt an atant':'Notes en attente'}</h2><table><tbody><tr><td>Marie Joseph</td><td>Sciences</td><td className="score">84%</td><td><button className="btn">{ht?'Valide':'Valider'}</button></td></tr><tr><td>David Pierre</td><td>Sciences</td><td className="score">79%</td><td><button className="btn">{ht?'Valide':'Valider'}</button></td></tr></tbody></table></section>}
        {directionView==='publish' && <section className="card"><h2>{ht?'Pibliye bilten':'Publier les bulletins'}</h2><p className="muted">{ht?'Chwazi trimès la epi pibliye bilten apre verifikasyon nòt yo.':'Choisissez le trimestre puis publiez les bulletins après vérification des notes.'}</p><button className="btn">{ht?'Pibliye bilten 1er trimès':'Publier les bulletins du 1er trimestre'}</button></section>}
      </>}

      {role==='teacher' && <>
        <Back onClick={teacherView==='home'?goHome:()=>setTeacherView('home')}/><div style={{height:12}}/>
        {teacherView==='home' && <section className="card"><h2>{ht?'Tablo de bò Pwofesè':'Tableau de bord Enseignant'}</h2><div className="menu"><button className="menuBtn" onClick={()=>setTeacherView('grades')}>📝 {ht?'Antre nòt':'Saisir les notes'}</button><button className="menuBtn" onClick={()=>setTeacherView('sent')}>📤 {ht?'Nòt mwen voye':'Notes envoyées'}</button><button className="menuBtn" onClick={()=>setTeacherView('classes')}>🏫 {ht?'Klas mwen yo':'Mes classes'}</button><button className="menuBtn" onClick={()=>setTeacherView('summary')}>📊 {ht?'Rezime klas':'Résumé de classe'}</button></div></section>}
        {teacherView==='grades' && <section className="card"><h2>{ht?'Antre nòt':'Saisir les notes'}</h2><div className="grid2"><div><label>{ht?'Elèv':'Élève'}</label><select><option>Jean Michel</option><option>Marie Joseph</option><option>David Pierre</option></select></div><div><label>{ht?'Matiyè':'Matière'}</label><select><option>Sciences</option><option>Mathématiques</option></select></div><div><label>{ht?'Nòt':'Note'}</label><input placeholder="0–100" inputMode="decimal"/></div><div><label>{ht?'Trimès':'Trimestre'}</label><select><option>1er trimestre</option><option>2e trimestre</option><option>3e trimestre</option></select></div></div><button className="btn" style={{marginTop:12}}>{ht?'Voye bay Direksyon':'Envoyer à la Direction'}</button></section>}
        {teacherView==='sent' && <section className="card"><h2>{ht?'Nòt mwen voye':'Notes envoyées'}</h2><table><tbody><tr><td>Marie Joseph</td><td>Sciences</td><td>84%</td><td>{ht?'An atant':'En attente'}</td></tr><tr><td>David Pierre</td><td>Sciences</td><td>79%</td><td>{ht?'An atant':'En attente'}</td></tr></tbody></table></section>}
        {teacherView==='classes' && <section className="card"><h2>{ht?'Klas mwen yo':'Mes classes'}</h2><div className="bigMenu"><div className="menuBtn"><b>9e Année Fondamentale — Section A</b><br/><span className="muted">Sciences</span></div><div className="menuBtn"><b>8e Année Fondamentale — Section B</b><br/><span className="muted">Sciences</span></div></div></section>}
        {teacherView==='summary' && <section className="card"><h2>{ht?'Rezime klas':'Résumé de classe'}</h2><div className="stats"><div className="stat"><strong>3</strong><small>{ht?'Elèv':'Élèves'}</small></div><div className="stat"><strong>2</strong><small>{ht?'Nòt voye':'Notes envoyées'}</small></div><div className="stat"><strong>81.5%</strong><small>{ht?'Mwayèn':'Moyenne'}</small></div><div className="stat"><strong>1</strong><small>{ht?'Matiyè':'Matière'}</small></div></div></section>}
      </>}

      {role==='student' && <>
        <Back onClick={studentView==='home'?goHome:()=>setStudentView('home')}/><div style={{height:12}}/>
        {studentView==='home' && <><section className="card"><h2>{ht?'Tablo de bò Elèv':'Tableau de bord Élève'}</h2><div className="studentHead"><div className="name">{s.name}</div><div><b>{s.level} – {ht?'Seksyon':'Section'} {s.section}</b></div><div className="muted">{ht?'Ane akademik:':'Année académique :'} {s.year}</div></div><div className="stats"><div className="stat"><strong>88%</strong><small>{ht?'Mwayèn jeneral':'Moyenne générale'}</small></div><div className="stat"><strong>4</strong><small>{ht?'Matiyè':'Matières'}</small></div><div className="stat"><strong>1</strong><small>{ht?'Bilten':'Bulletin'}</small></div><div className="stat"><strong>4</strong><small>{ht?'Nòt pibliye':'Notes publiées'}</small></div></div></section><section className="card"><div className="bigMenu"><button className="menuBtn" onClick={()=>setStudentView('grades')}>📝 {ht?'Nòt mwen':'Mes notes'}</button><button className="menuBtn" onClick={()=>setStudentView('report')}>📄 {ht?'Bilten mwen':'Mon bulletin'}</button><button className="menuBtn" onClick={()=>setStudentView('averages')}>📊 {ht?'Mwayèn pa matyè':'Moyennes par matière'}</button></div></section></>}
        {studentView==='grades' && <section className="card"><h2>{ht?'Nòt mwen':'Mes notes'}</h2><table><tbody><tr><td>Mathématiques</td><td className="score">88%</td></tr><tr><td>Français</td><td className="score">91%</td></tr><tr><td>Sciences</td><td className="score">84%</td></tr><tr><td>Anglais</td><td className="score">89%</td></tr></tbody></table></section>}
        {studentView==='report' && <section className="card"><h2>{ht?'Bilten mwen':'Mon bulletin'}</h2><div className="studentHead"><div className="name">{s.name}</div><div>{s.level} – {ht?'Seksyon':'Section'} {s.section}</div><div className="muted">{ht?'Ane akademik:':'Année académique :'} {s.year}</div></div><p><b>1er trimestre</b></p><p>{ht?'Mwayèn jeneral':'Moyenne générale'}: <span className="score">88%</span></p></section>}
        {studentView==='averages' && <section className="card"><h2>{ht?'Mwayèn pa matyè':'Moyennes par matière'}</h2><table><tbody><tr><td>Mathématiques</td><td>88%</td></tr><tr><td>Français</td><td>91%</td></tr><tr><td>Sciences</td><td>84%</td></tr><tr><td>Anglais</td><td>89%</td></tr></tbody></table></section>}
      </>}
    </div>
  </main>
}
