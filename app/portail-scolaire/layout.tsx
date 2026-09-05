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
        #ps-add-student-form{margin-top:12px;padding:14px;border:1px solid #dde6ef;border-radius:14px;background:#f8fafc}
        #ps-add-student-form .ps-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        #ps-add-student-form label{display:block;font-size:13px;font-weight:800;margin-bottom:5px}
        #ps-add-student-form input{width:100%;padding:11px;border:1px solid #dde6ef;border-radius:11px;background:#fff}
        #ps-add-student-form .ps-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        #ps-add-student-form button,#ps-add-student-toggle{border:0;border-radius:11px;padding:11px 14px;background:#0f4c81;color:#fff;font-weight:800;cursor:pointer}
        #ps-add-student-cancel{background:#eef3f8!important;color:#0f4c81!important}
        @media(max-width:720px){#ps-add-student-form .ps-grid{grid-template-columns:1fr}}
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
      `}} />
    </>
  )
}
