'use client';

import {useMemo,useState} from 'react';

type QuizQuestion={
  id:string;
  question_order:number;
  question_type:string;
  question:string;
  option_a:string;
  option_b:string;
  option_c:string;
  option_d:string;
  correct_answer:string;
  explanation:string;
  option_rationales:Record<string,string>|null;
  learning_point:string;
};

export default function ModuleQuiz({questions}:{questions:QuizQuestion[]}){
  const [started,setStarted]=useState(false);
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [submitted,setSubmitted]=useState<Record<string,boolean>>({});
  const [finished,setFinished]=useState(false);
  const current=questions[index];
  const score=useMemo(()=>questions.reduce((total,q)=>total+(answers[q.id]===q.correct_answer?1:0),0),[answers,questions]);

  if(!questions.length)return null;
  if(!started)return <section style={{background:'linear-gradient(135deg,#0f766e,#14b8a6)',color:'white',borderRadius:20,padding:'24px',marginTop:24,boxShadow:'0 10px 30px rgba(15,118,110,.16)'}}><div style={{fontSize:12,fontWeight:900,letterSpacing:1,opacity:.82}}>MINI-ÉVALUATION</div><h2 style={{fontSize:25,margin:'7px 0 8px'}}>Vérifiez vos acquis</h2><p style={{lineHeight:1.65,margin:'0 0 17px',opacity:.95}}>15 questions : QCM directs et cas cliniques sur la sécurité médicamenteuse. La correction détaillée apparaît après chaque réponse.</p><button onClick={()=>setStarted(true)} style={{border:0,borderRadius:12,padding:'12px 18px',background:'white',color:'#0f766e',fontWeight:900,fontSize:15,cursor:'pointer'}}>Commencer l’évaluation – {questions.length} questions</button></section>;

  if(finished)return <section style={{background:'white',border:'1px solid #dce7e5',borderRadius:20,padding:24,marginTop:24,textAlign:'center'}}><div style={{fontSize:13,fontWeight:900,color:'#0f766e'}}>ÉVALUATION TERMINÉE</div><h2 style={{fontSize:30,color:'#0b1f59',margin:'8px 0'}}>Score : {score}/{questions.length}</h2><p style={{color:'#64748b',margin:'0 0 18px'}}>Vous pouvez recommencer l’évaluation pour consolider les notions importantes.</p><button onClick={()=>{setIndex(0);setAnswers({});setSubmitted({});setFinished(false)}} style={{border:0,borderRadius:12,padding:'11px 18px',background:'#0f766e',color:'white',fontWeight:900,cursor:'pointer'}}>Recommencer</button></section>;

  const options=[['A',current.option_a],['B',current.option_b],['C',current.option_c],['D',current.option_d]] as const;
  const selected=answers[current.id];
  const isSubmitted=submitted[current.id];

  return <section style={{background:'white',border:'1px solid #dfe7ec',borderRadius:20,padding:22,marginTop:24,boxShadow:'0 8px 26px rgba(11,31,89,.06)'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:15}}><strong style={{color:'#0f766e'}}>Question {index+1}/{questions.length}</strong><span style={{fontSize:12,fontWeight:800,color:'#64748b'}}>{current.question_type==='clinical_case'?'Cas clinique':'QCM'}</span></div>
    <h2 style={{fontSize:20,lineHeight:1.5,color:'#0b1f59',margin:'0 0 16px'}}>{current.question}</h2>
    <div style={{display:'grid',gap:10}}>{options.map(([letter,text])=>{const chosen=selected===letter;const correct=current.correct_answer===letter;let background='#f8fafc',border='#dfe6ee',color='#24364b';if(isSubmitted&&correct){background='#ecfdf5';border='#86efac';color='#166534'}else if(isSubmitted&&chosen&&!correct){background='#fef2f2';border='#fca5a5';color='#991b1b'}else if(chosen){background='#eff6ff';border='#93c5fd';color='#1d4ed8'}return <button key={letter} disabled={isSubmitted} onClick={()=>setAnswers(v=>({...v,[current.id]:letter}))} style={{textAlign:'left',border:`1px solid ${border}`,background,color,borderRadius:13,padding:'13px 14px',fontSize:15,lineHeight:1.45,fontWeight:chosen?800:600,cursor:isSubmitted?'default':'pointer'}}><strong>{letter}.</strong> {text}</button>})}</div>
    {!isSubmitted?<button disabled={!selected} onClick={()=>setSubmitted(v=>({...v,[current.id]:true}))} style={{marginTop:16,border:0,borderRadius:12,padding:'11px 17px',background:selected?'#1748b7':'#cbd5e1',color:'white',fontWeight:900,cursor:selected?'pointer':'not-allowed'}}>Valider la réponse</button>:<div style={{marginTop:18}}><div style={{background:selected===current.correct_answer?'#ecfdf5':'#fff7ed',border:`1px solid ${selected===current.correct_answer?'#bbf7d0':'#fed7aa'}`,borderRadius:14,padding:15}}><strong style={{color:selected===current.correct_answer?'#166534':'#9a3412'}}>{selected===current.correct_answer?'Bonne réponse ✅':`Bonne réponse : ${current.correct_answer}`}</strong><p style={{margin:'7px 0 0',color:'#475569',lineHeight:1.65}}>{current.explanation}</p></div>{current.option_rationales&&<div style={{marginTop:12,display:'grid',gap:8}}>{options.map(([letter])=><div key={letter} style={{background:'#f8fafc',borderRadius:11,padding:'10px 12px',fontSize:13,color:'#475569',lineHeight:1.55}}><strong style={{color:'#0b1f59'}}>{letter} :</strong> {current.option_rationales?.[letter]}</div>)}</div>}<div style={{marginTop:12,background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'12px 14px',color:'#1e3a8a',lineHeight:1.55}}><strong>Point à retenir :</strong> {current.learning_point}</div><button onClick={()=>{if(index===questions.length-1)setFinished(true);else setIndex(i=>i+1)}} style={{marginTop:15,border:0,borderRadius:12,padding:'11px 17px',background:'#0f766e',color:'white',fontWeight:900,cursor:'pointer'}}>{index===questions.length-1?'Voir mon résultat':'Question suivante →'}</button></div>}
  </section>;
}
