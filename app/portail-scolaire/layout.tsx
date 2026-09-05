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
        body:has(.ps-page) {
          padding-bottom: 0 !important;
        }
        #teacher-action-panel h3{margin-top:0}
        #teacher-action-panel .teacher-action-grid{display:grid;gap:10px}
        #teacher-action-panel .teacher-action-item{border:1px solid #dde6ef;border-radius:12px;padding:12px;background:#f8fafc}
      `}</style>
      {children}
      <script dangerouslySetInnerHTML={{__html:`
        (function(){
          function bindTeacherMenu(){
            var menus=document.querySelectorAll('.menu');
            menus.forEach(function(menu){
              if(menu.dataset.teacherBound==='1') return;
              var items=menu.querySelectorAll('.menuBtn');
              if(items.length!==4) return;
              menu.dataset.teacherBound='1';
              var titlesHT=['Antre nòt','Nòt mwen voye','Klas mwen yo','Rezime klas'];
              var titlesFR=['Saisir les notes','Notes envoyées','Mes classes','Résumé de classe'];
              items.forEach(function(item,index){
                item.setAttribute('role','button');
                item.setAttribute('tabindex','0');
                function open(){
                  var old=document.getElementById('teacher-action-panel');
                  if(old) old.remove();
                  var french=document.body.innerText.indexOf('Tableau de bord Enseignant')!==-1;
                  var title=(french?titlesFR:titlesHT)[index];
                  var panel=document.createElement('section');
                  panel.className='card';
                  panel.id='teacher-action-panel';
                  var content='';
                  if(index===0){
                    content=french
                      ? '<p class="muted">Écran de saisie des notes prêt pour la prochaine connexion à Supabase.</p><div class="teacher-action-grid"><div class="teacher-action-item">Élève</div><div class="teacher-action-item">Matière</div><div class="teacher-action-item">Note</div><div class="teacher-action-item">Envoyer à la Direction</div></div>'
                      : '<p class="muted">Ekran pou antre nòt la pare pou pwochen koneksyon ak Supabase.</p><div class="teacher-action-grid"><div class="teacher-action-item">Elèv</div><div class="teacher-action-item">Matiyè</div><div class="teacher-action-item">Nòt</div><div class="teacher-action-item">Voye bay Direksyon</div></div>';
                  }else if(index===1){
                    content=french?'<p class="muted">Les notes envoyées à la Direction apparaîtront ici.</p>':'<p class="muted">Nòt pwofesè a voye bay Direksyon ap parèt isit la.</p>';
                  }else if(index===2){
                    content=french?'<div class="teacher-action-grid"><div class="teacher-action-item"><b>9e Année Fondamentale – Section A</b><br/>Sciences</div><div class="teacher-action-item"><b>8e Année Fondamentale – Section B</b><br/>Sciences</div></div>':'<div class="teacher-action-grid"><div class="teacher-action-item"><b>9e Année Fondamentale – Section A</b><br/>Syans</div><div class="teacher-action-item"><b>8e Année Fondamentale – Section B</b><br/>Syans</div></div>';
                  }else{
                    content=french?'<p class="muted">Le résumé de classe affichera les effectifs, notes envoyées et moyennes.</p>':'<p class="muted">Rezime klas la ap montre kantite elèv, nòt voye ak mwayèn yo.</p>';
                  }
                  panel.innerHTML='<h3>'+title+'</h3>'+content;
                  var card=menu.closest('.card');
                  if(card&&card.parentNode) card.parentNode.insertBefore(panel,card.nextSibling);
                  panel.scrollIntoView({behavior:'smooth',block:'start'});
                }
                item.addEventListener('click',open);
                item.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
              });
            });
          }
          bindTeacherMenu();
          new MutationObserver(bindTeacherMenu).observe(document.body,{subtree:true,childList:true});
        })();
      `}} />
    </>
  )
}
