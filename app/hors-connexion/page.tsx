"use client";

export default function HorsConnexionPage() {
  return (
    <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:"28px",background:"linear-gradient(155deg,#061636,#0b2558 55%,#0b4d70)",color:"white",textAlign:"center"}}>
      <section style={{width:"min(520px,100%)",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.14)",borderRadius:24,padding:"34px 24px",boxShadow:"0 24px 70px rgba(0,0,0,.22)"}}>
        <div style={{width:76,height:76,borderRadius:22,display:"grid",placeItems:"center",margin:"0 auto 20px",background:"rgba(255,255,255,.12)",fontSize:34}}>↯</div>
        <h1 style={{margin:"0 0 12px",fontSize:28}}>Connexion Internet indisponible</h1>
        <p style={{margin:"0 auto",maxWidth:420,lineHeight:1.65,color:"#dce9ff"}}>Haiti Nursing Exam Prep reste accessible pour les éléments déjà enregistrés sur votre appareil. Une connexion est toutefois nécessaire pour charger de nouvelles questions, enregistrer une réponse ou soumettre un examen.</p>
        <div style={{margin:"24px 0",padding:"14px",borderRadius:14,background:"rgba(255,207,97,.12)",color:"#ffe6a6",fontSize:13,lineHeight:1.55}}>Pour protéger votre progression, ne commencez pas un nouvel examen tant que la connexion n’est pas revenue.</div>
        <button type="button" onClick={() => window.location.reload()} style={{border:0,borderRadius:12,padding:"13px 20px",background:"#42d7cf",color:"#062044",fontWeight:800,fontSize:14,cursor:"pointer"}}>Réessayer la connexion</button>
        <p style={{margin:"18px 0 0",fontSize:11,color:"rgba(229,242,255,.7)"}}>Préparation infirmière • Haïti</p>
      </section>
    </main>
  );
}
