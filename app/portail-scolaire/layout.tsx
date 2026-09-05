import type { ReactNode } from 'react'

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash { display:none!important; }
        body:has(.ps-page){padding-bottom:0!important}
        #ps-add-student-wrap{margin:0 0 16px}
        #ps-add-student-form,#ps-add-teacher-form{margin-top:12px;padding:14px;border:1px solid #dde6ef;border-radius:14px;background:#f8fafc}
        .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        #ps-add-student-form label,#ps-add-teacher-form label{display:block;font-size:13px;font-weight:800;margin-bottom:5px}
        #ps-add-student-form input,#ps-add-teacher-form input{width:100%;padding:11px;border:1px solid #dde6ef;border-radius:11px;background:#fff}
        .ps-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        #ps-add-student-form button,#ps-add-student-toggle,#ps-add-teacher-form button,#ps-add-teacher-toggle,.ps-teacher-action{border:0;border-radius:11px;padding:11px 14px;background:#0f4c81;color:#fff;font-weight:800;cursor:pointer}
        #ps-add-student-cancel,#ps-add-teacher-cancel{background:#eef3f8!important;color:#0f4c81!important}
        #ps-teacher-list{display:grid;gap:10px;margin-top:14px}
        .ps-teacher-card{border:1px solid #dde6ef;border-radius:14px;padding:14px;background:#fff}
        .ps-teacher-name{font-weight:800;font-size:17px;margin-bottom:4px}
        .ps-teacher-meta{color:#6b7280;font-size:14px;margin-bottom:10px}
        .ps-teacher-actions{display:flex;gap:8px;flex-wrap:wrap}
        .ps-teacher-action.secondary{background:#eef3f8;color:#0f4c81}
        .ps-teacher-action.danger{background:#fff1f1;color:#a52a2a}
        @media(max-width:720px){.ps-grid{grid-template-columns:1fr}}
      `}</style>
      {children}
      <script dangerouslySetInnerHTML={{__html:`
        (function(){
          var STUDENT_KEY='portail_scolaire_extra_students_v1';
          function sRead(){try{return JSON.parse(localStorage.getItem(STUDENT_KEY)||'[]')}catch(e){return []}}
          function sWrite(v){localStorage.setItem(STUDENT_KEY,JSON.stringify(v))}
          function isFrenchStudents(){return document.body.innerText.indexOf('Gérer les élèves')!==-1}
          function findStudentsCard(){
            var hs=document.querySelectorAll('h2');
            for(var i=0;i<hs.length;i++){
              var t=(hs[i].textContent||'').trim();
              if(t==='Gérer les élèves'||t==='Jere elèv') return hs[i].closest('.card');
            }
            return null;
          }
          function renderStudentRows(card){
            var table=card&&card.querySelector('table');if(!table)return;
            var body=table.querySelector('tbody');if(!body)return;
            body.querySelectorAll('tr[data-extra-student="1"]').forEach(function(r){r.remove()});
            sRead().forEach(function(s){
              var tr=document.createElement('tr');tr.setAttribute('data-extra-student','1');
              tr.innerHTML='<td>'+s.id+'</td><td>'+s.name+'</td><td>'+s.level+'</td><td>'+s.section+'</td><td><span style="display:inline-block;padding:8px 10px;border-radius:9px;background:#eef3f8;color:#0f4c81;font-weight:700">'+(isFrenchStudents()?'Ajouté':'Ajoute')+'</span></td>';
              body.appendChild(tr);
            });
          }
          function bindStudents(){
            var card=findStudentsCard();if(!card)return false;
            renderStudentRows(card);
            if(card.querySelector('#ps-add-student-wrap'))return true;
            var table=card.querySelector('table');if(!table)return false;
            var fr=isFrenchStudents(),wrap=document.createElement('div');wrap.id='ps-add-student-wrap';
            wrap.innerHTML='<button id="ps-add-student-toggle" type="button">➕ '+(fr?'Ajouter un élève':'Ajoute yon elèv')+'</button><form id="ps-add-student-form" style="display:none"><h3 style="margin-top:0">'+(fr?'Ajouter un élève':'Ajoute yon elèv')+'</h3><div class="ps-grid"><div><label>'+(fr?'Nom de l’élève':'Non elèv')+'</label><input name="name" required></div><div><label>'+(fr?'Classe / Niveau':'Klas / Nivo')+'</label><input name="level" required></div><div><label>'+(fr?'Section':'Seksyon')+'</label><input name="section" required></div><div><label>'+(fr?'Année académique':'Ane akademik')+'</label><input name="year" required value="2026–2027"></div></div><div class="ps-row"><button type="submit">'+(fr?'Enregistrer':'Anrejistre')+'</button><button type="button" id="ps-add-student-cancel">'+(fr?'Annuler':'Anile')+'</button></div></form>';
            card.insertBefore(wrap,table);
            var toggle=wrap.querySelector('#ps-add-student-toggle'),form=wrap.querySelector('#ps-add-student-form'),cancel=wrap.querySelector('#ps-add-student-cancel');
            toggle.addEventListener('click',function(){form.style.display='block';toggle.style.display='none'});
            cancel.addEventListener('click',function(){form.style.display='none';toggle.style.display='inline-block';form.reset()});
            form.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(form),extras=sRead();var id='ELV-'+String(4+extras.length).padStart(3,'0');extras.push({id:id,name:String(d.get('name')||''),level:String(d.get('level')||''),section:String(d.get('section')||''),year:String(d.get('year')||'')});sWrite(extras);form.reset();form.style.display='none';toggle.style.display='inline-block';renderStudentRows(card)});
            return true;
          }

          var TEACHER_KEY='portail_scolaire_teachers_v2';
          function tDefaults(){return [{id:'ENS-001',name:'Nadia Charles',subject:'Sciences',classes:'9e Année Fondamentale',section:'A'},{id:'ENS-002',name:'Marc Pierre',subject:'Mathématiques',classes:'8e Année Fondamentale',section:'B'}]}
          function tRead(){try{var v=JSON.parse(localStorage.getItem(TEACHER_KEY)||'null');return Array.isArray(v)?v:tDefaults()}catch(e){return tDefaults()}}
          function tWrite(v){localStorage.setItem(TEACHER_KEY,JSON.stringify(v))}
          function isFrenchTeachers(){return document.body.innerText.indexOf('Gérer les enseignants')!==-1}
          function findTeachersCard(){
            var hs=document.querySelectorAll('h2');
            for(var i=0;i<hs.length;i++){
              var t=(hs[i].textContent||'').trim();
              if(t==='Gérer les enseignants'||t==='Jere pwofesè')return hs[i].closest('.card');
            }
            return null;
          }
          function renderTeachers(card){
            var list=card.querySelector('#ps-teacher-list');if(!list)return;
            var fr=isFrenchTeachers(),teachers=tRead();list.innerHTML='';
            teachers.forEach(function(t,index){
              var section=t.section?(' • '+(fr?'Section ':'Seksyon ')+t.section):'';
              var item=document.createElement('div');item.className='ps-teacher-card';
              item.innerHTML='<div class="ps-teacher-name">'+t.name+'</div><div class="ps-teacher-meta">'+t.id+' • '+t.subject+' • '+t.classes+section+'</div><div class="ps-teacher-actions"><button type="button" class="ps-teacher-action" data-act="edit" data-i="'+index+'">'+(fr?'Modifier':'Modifye')+'</button><button type="button" class="ps-teacher-action secondary" data-act="class" data-i="'+index+'">'+(fr?'Classes':'Klas')+'</button><button type="button" class="ps-teacher-action secondary" data-act="section" data-i="'+index+'">'+(fr?'Section':'Seksyon')+'</button><button type="button" class="ps-teacher-action secondary" data-act="subject" data-i="'+index+'">'+(fr?'Matières':'Matiyè')+'</button><button type="button" class="ps-teacher-action danger" data-act="delete" data-i="'+index+'">'+(fr?'Retirer':'Retire')+'</button></div>';
              list.appendChild(item);
            });
          }
          function handleTeacherAction(e,card){
            var btn=e.target.closest('button[data-act]');if(!btn)return;
            var i=Number(btn.getAttribute('data-i')),act=btn.getAttribute('data-act'),teachers=tRead(),t=teachers[i],fr=isFrenchTeachers();if(!t)return;
            if(act==='delete'){
              if(confirm(fr?'Retirer cet enseignant de la liste ?':'Retire pwofesè sa a nan lis la?')){teachers.splice(i,1);tWrite(teachers);renderTeachers(card)}
              return;
            }
            var field=act==='edit'?'name':act==='class'?'classes':act==='section'?'section':'subject';
            var label=act==='edit'?(fr?'Nom de l’enseignant':'Non pwofesè'):act==='class'?(fr?'Classes assignées':'Klas yo asiyen'):act==='section'?(fr?'Section assignée':'Seksyon li asiyen'):(fr?'Matières assignées':'Matiyè yo asiyen');
            var value=prompt(label,t[field]||'');
            if(value!==null&&value.trim()){t[field]=value.trim();teachers[i]=t;tWrite(teachers);renderTeachers(card)}
          }
          function bindTeachers(){
            var card=findTeachersCard();if(!card)return false;
            if(card.dataset.teacherManagerBound==='1')return true;
            card.dataset.teacherManagerBound='1';
            var nativeList=card.querySelector('.teacherList');if(nativeList)nativeList.style.display='none';
            var directButtons=card.querySelectorAll(':scope > .btn');directButtons.forEach(function(b){b.style.display='none'});
            var directForms=card.querySelectorAll(':scope > form');directForms.forEach(function(f){f.style.display='none'});
            var fr=isFrenchTeachers(),wrap=document.createElement('div');wrap.id='ps-teacher-manager';
            wrap.innerHTML='<button id="ps-add-teacher-toggle" type="button">➕ '+(fr?'Ajouter un enseignant':'Ajoute yon pwofesè')+'</button><form id="ps-add-teacher-form" style="display:none"><h3 style="margin-top:0">'+(fr?'Ajouter un enseignant':'Ajoute yon pwofesè')+'</h3><div class="ps-grid"><div><label>'+(fr?'Nom complet':'Non konplè')+'</label><input name="name" required></div><div><label>'+(fr?'Matière principale':'Matiyè prensipal')+'</label><input name="subject" required></div><div><label>'+(fr?'Classes assignées':'Klas yo asiyen')+'</label><input name="classes" required></div><div><label>'+(fr?'Section':'Seksyon')+'</label><input name="section" required placeholder="A"></div></div><div class="ps-row"><button type="submit">'+(fr?'Enregistrer':'Anrejistre')+'</button><button type="button" id="ps-add-teacher-cancel">'+(fr?'Annuler':'Anile')+'</button></div></form><div id="ps-teacher-list"></div>';
            card.appendChild(wrap);
            var toggle=wrap.querySelector('#ps-add-teacher-toggle'),form=wrap.querySelector('#ps-add-teacher-form'),cancel=wrap.querySelector('#ps-add-teacher-cancel'),list=wrap.querySelector('#ps-teacher-list');
            toggle.addEventListener('click',function(){form.style.display='block';toggle.style.display='none'});
            cancel.addEventListener('click',function(){form.style.display='none';toggle.style.display='inline-block';form.reset()});
            form.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(form),teachers=tRead();var id='ENS-'+String(teachers.length+1).padStart(3,'0');teachers.push({id:id,name:String(d.get('name')||''),subject:String(d.get('subject')||''),classes:String(d.get('classes')||''),section:String(d.get('section')||'')});tWrite(teachers);form.reset();form.style.display='none';toggle.style.display='inline-block';renderTeachers(card)});
            list.addEventListener('click',function(e){handleTeacherAction(e,card)});
            renderTeachers(card);
            return true;
          }

          function bindAll(){bindStudents();bindTeachers()}
          bindAll();
          var observer=new MutationObserver(function(){bindAll()});
          observer.observe(document.body,{subtree:true,childList:true});
        })();
      `}} />
    </>
  )
}
