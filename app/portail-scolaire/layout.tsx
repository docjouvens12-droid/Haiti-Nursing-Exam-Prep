import type { ReactNode } from 'react'

export default function PortailScolaireLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.ps-page) .mobile-student-nav,
        body:has(.ps-page) .mobile-student-nav-spacer,
        body:has(.ps-page) .pwa-splash {
          display: none !important;
        }
        body:has(.ps-page) { padding-bottom: 0 !important; }
        #ps-add-student-wrap{margin:0 0 16px}
        #ps-add-student-form,#ps-add-teacher-form{margin-top:12px;padding:14px;border:1px solid #dde6ef;border-radius:14px;background:#f8fafc}
        #ps-add-student-form .ps-grid,#ps-add-teacher-form .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        #ps-add-student-form label,#ps-add-teacher-form label{display:block;font-size:13px;font-weight:800;margin-bottom:5px}
        #ps-add-student-form input,#ps-add-teacher-form input,#ps-add-teacher-form select{width:100%;padding:11px;border:1px solid #dde6ef;border-radius:11px;background:#fff}
        #ps-add-student-form .ps-row,#ps-add-teacher-form .ps-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        #ps-add-student-form button,#ps-add-student-toggle,#ps-add-teacher-form button,#ps-add-teacher-toggle,.ps-teacher-action{border:0;border-radius:11px;padding:11px 14px;background:#0f4c81;color:#fff;font-weight:800;cursor:pointer}
        #ps-add-student-cancel,#ps-add-teacher-cancel{background:#eef3f8!important;color:#0f4c81!important}
        #ps-teacher-list{display:grid;gap:10px;margin-top:14px}
        .ps-teacher-card{border:1px solid #dde6ef;border-radius:14px;padding:14px;background:#fff}
        .ps-teacher-name{font-weight:800;font-size:17px;margin-bottom:4px}
        .ps-teacher-meta{color:#6b7280;font-size:14px;margin-bottom:10px}
        .ps-teacher-actions{display:flex;gap:8px;flex-wrap:wrap}
        .ps-teacher-action.secondary{background:#eef3f8;color:#0f4c81}
        .ps-teacher-action.danger{background:#fff1f1;color:#a52a2a}
        @media(max-width:720px){#ps-add-student-form .ps-grid,#ps-add-teacher-form .ps-grid{grid-template-columns:1fr}}
      `}</style>
      {children}
      <script dangerouslySetInnerHTML={{__html:`
        (function(){
          var KEY='portail_scolaire_extra_students_v1';
          function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
          function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
          function isFrench(){return document.body.innerText.indexOf('Gérer les élèves')!==-1}
          function findStudentsCard(){
            var hs=document.querySelectorAll('h2');
            for(var i=0;i<hs.length;i++){
              var t=(hs[i].textContent||'').trim();
              if(t==='Gérer les élèves'||t==='Jere elèv') return hs[i].closest('.card');
            }
            return null;
          }
          function renderRows(card){
            var table=card&&card.querySelector('table'); if(!table) return;
            var body=table.querySelector('tbody'); if(!body) return;
            body.querySelectorAll('tr[data-extra-student="1"]').forEach(function(r){r.remove()});
            read().forEach(function(s){
              var tr=document.createElement('tr'); tr.setAttribute('data-extra-student','1');
              tr.innerHTML='<td>'+s.id+'</td><td>'+s.name+'</td><td>'+s.level+'</td><td>'+s.section+'</td><td><span style="display:inline-block;padding:8px 10px;border-radius:9px;background:#eef3f8;color:#0f4c81;font-weight:700">'+(isFrench()?'Ajouté':'Ajoute')+'</span></td>';
              body.appendChild(tr);
            });
          }
          function bind(){
            var card=findStudentsCard(); if(!card) return;
            renderRows(card);
            if(card.querySelector('#ps-add-student-wrap')) return;
            var table=card.querySelector('table'); if(!table) return;
            var wrap=document.createElement('div'); wrap.id='ps-add-student-wrap';
            var fr=isFrench();
            wrap.innerHTML='<button id="ps-add-student-toggle" type="button">➕ '+(fr?'Ajouter un élève':'Ajoute yon elèv')+'</button>'+
              '<form id="ps-add-student-form" style="display:none">'+
              '<h3 style="margin-top:0">'+(fr?'Ajouter un élève':'Ajoute yon elèv')+'</h3>'+
              '<div class="ps-grid">'+
              '<div><label>'+(fr?'Nom de l’élève':'Non elèv')+'</label><input name="name" required></div>'+
              '<div><label>'+(fr?'Classe / Niveau':'Klas / Nivo')+'</label><input name="level" required placeholder="9e Année Fondamentale"></div>'+
              '<div><label>'+(fr?'Section':'Seksyon')+'</label><input name="section" required placeholder="A"></div>'+
              '<div><label>'+(fr?'Année académique':'Ane akademik')+'</label><input name="year" required value="2026–2027"></div>'+
              '</div><div class="ps-row"><button type="submit">'+(fr?'Enregistrer':'Anrejistre')+'</button><button type="button" id="ps-add-student-cancel">'+(fr?'Annuler':'Anile')+'</button></div></form>';
            card.insertBefore(wrap,table);
            var toggle=wrap.querySelector('#ps-add-student-toggle');
            var form=wrap.querySelector('#ps-add-student-form');
            var cancel=wrap.querySelector('#ps-add-student-cancel');
            toggle.addEventListener('click',function(){form.style.display='block';toggle.style.display='none';});
            cancel.addEventListener('click',function(){form.style.display='none';toggle.style.display='inline-block';form.reset();});
            form.addEventListener('submit',function(e){
              e.preventDefault();
              var data=new FormData(form), extras=read();
              var id='ELV-'+String(4+extras.length).padStart(3,'0');
              extras.push({id:id,name:String(data.get('name')||''),level:String(data.get('level')||''),section:String(data.get('section')||''),year:String(data.get('year')||'')});
              write(extras); form.reset(); form.style.display='none'; toggle.style.display='inline-block'; renderRows(card);
            });
          }
          bind();
          new MutationObserver(function(){setTimeout(bind,0)}).observe(document.body,{subtree:true,childList:true});
        })();

        (function(){
          var KEY='portail_scolaire_teachers_v1';
          function defaults(){return [
            {id:'ENS-001',name:'Nadia Charles',subject:'Sciences',classes:'9e Année Fondamentale – A'},
            {id:'ENS-002',name:'Marc Pierre',subject:'Mathématiques',classes:'8e Année Fondamentale – B'}
          ]}
          function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:defaults()}catch(e){return defaults()}}
          function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
          function fr(){return document.body.innerText.indexOf('Gérer les enseignants')!==-1}
          function findCard(){
            var hs=document.querySelectorAll('h2');
            for(var i=0;i<hs.length;i++){
              var t=(hs[i].textContent||'').trim();
              if(t==='Gérer les enseignants'||t==='Jere pwofesè') return hs[i].closest('.card');
            }
            return null;
          }
          function render(card){
            var list=card.querySelector('#ps-teacher-list'); if(!list) return;
            var isFr=fr(); list.innerHTML='';
            read().forEach(function(t,index){
              var item=document.createElement('div'); item.className='ps-teacher-card';
              item.innerHTML='<div class="ps-teacher-name">'+t.name+'</div><div class="ps-teacher-meta">'+t.id+' • '+t.subject+' • '+t.classes+'</div><div class="ps-teacher-actions">'+
              '<button class="ps-teacher-action" data-act="edit" data-i="'+index+'">'+(isFr?'Modifier':'Modifye')+'</button>'+
              '<button class="ps-teacher-action secondary" data-act="class" data-i="'+index+'">'+(isFr?'Classes':'Klas')+'</button>'+
              '<button class="ps-teacher-action secondary" data-act="subject" data-i="'+index+'">'+(isFr?'Matières':'Matiyè')+'</button>'+
              '<button class="ps-teacher-action danger" data-act="delete" data-i="'+index+'">'+(isFr?'Retirer':'Retire')+'</button></div>';
              list.appendChild(item);
            });
            list.querySelectorAll('button[data-act]').forEach(function(btn){
              btn.addEventListener('click',function(){
                var i=Number(btn.getAttribute('data-i')), action=btn.getAttribute('data-act'), teachers=read(), t=teachers[i], isFr=fr();
                if(!t) return;
                if(action==='delete'){
                  if(confirm(isFr?'Retirer cet enseignant de la liste ?':'Retire pwofesè sa a nan lis la?')){teachers.splice(i,1);write(teachers);render(card)}
                  return;
                }
                var field=action==='edit'?'name':action==='class'?'classes':'subject';
                var label=action==='edit'?(isFr?'Nom de l’enseignant':'Non pwofesè'):action==='class'?(isFr?'Classes assignées':'Klas yo asiyen'):(isFr?'Matières assignées':'Matiyè yo asiyen');
                var value=prompt(label,t[field]);
                if(value!==null&&value.trim()){t[field]=value.trim();teachers[i]=t;write(teachers);render(card)}
              });
            });
          }
          function bind(){
            var card=findCard(); if(!card) return;
            var notice=card.querySelector('.notice'); if(notice) notice.style.display='none';
            if(card.querySelector('#ps-teacher-manager')){render(card);return}
            var isFr=fr(), wrap=document.createElement('div'); wrap.id='ps-teacher-manager';
            wrap.innerHTML='<button id="ps-add-teacher-toggle" type="button">➕ '+(isFr?'Ajouter un enseignant':'Ajoute yon pwofesè')+'</button>'+
              '<form id="ps-add-teacher-form" style="display:none">'+
              '<h3 style="margin-top:0">'+(isFr?'Ajouter un enseignant':'Ajoute yon pwofesè')+'</h3><div class="ps-grid">'+
              '<div><label>'+(isFr?'Nom complet':'Non konplè')+'</label><input name="name" required></div>'+
              '<div><label>'+(isFr?'Matière principale':'Matiyè prensipal')+'</label><input name="subject" required placeholder="Sciences"></div>'+
              '<div><label>'+(isFr?'Classes assignées':'Klas yo asiyen')+'</label><input name="classes" required placeholder="9e Année Fondamentale – A"></div>'+
              '<div><label>ID</label><input name="id" placeholder="ENS-003"></div></div>'+
              '<div class="ps-row"><button type="submit">'+(isFr?'Enregistrer':'Anrejistre')+'</button><button type="button" id="ps-add-teacher-cancel">'+(isFr?'Annuler':'Anile')+'</button></div></form><div id="ps-teacher-list"></div>';
            card.appendChild(wrap);
            var toggle=wrap.querySelector('#ps-add-teacher-toggle'), form=wrap.querySelector('#ps-add-teacher-form'), cancel=wrap.querySelector('#ps-add-teacher-cancel');
            toggle.addEventListener('click',function(){form.style.display='block';toggle.style.display='none'});
            cancel.addEventListener('click',function(){form.style.display='none';toggle.style.display='inline-block';form.reset()});
            form.addEventListener('submit',function(e){
              e.preventDefault();var data=new FormData(form), teachers=read();
              var id=String(data.get('id')||'').trim()||('ENS-'+String(teachers.length+1).padStart(3,'0'));
              teachers.push({id:id,name:String(data.get('name')||''),subject:String(data.get('subject')||''),classes:String(data.get('classes')||'')});
              write(teachers);form.reset();form.style.display='none';toggle.style.display='inline-block';render(card)
            });
            render(card);
          }
          bind();
          new MutationObserver(function(){setTimeout(bind,0)}).observe(document.body,{subtree:true,childList:true});
        })();
      `}} />
    </>
  )
}
