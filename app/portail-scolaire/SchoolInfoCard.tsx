'use client'

type SchoolInfo={
 school_name?:string|null
 address?:string|null
 phone?:string|null
 email?:string|null
 logo_url?:string|null
}|null

export default function SchoolInfoCard({school,ht}:{school:SchoolInfo;ht:boolean}){
 const labels=ht
  ?{title:'Enfòmasyon lekòl',name:'Non lekòl la',phone:'Telefòn',address:'Adrès',email:'E-mail',logo:'Logo lekòl la'}
  :{title:'Informations de l’école',name:'Nom de l’école',phone:'Téléphone',address:'Adresse',email:'E-mail',logo:'Logo de l’école'}
 const value=(v?:string|null)=>v?.trim()||'—'
 return <div data-native-school-info="true" style={{border:'1px solid #dde6ef',borderRadius:18,padding:22,marginBottom:24,background:'#fff',boxShadow:'0 8px 24px rgba(20,33,61,.05)'}}>
  <div style={{fontSize:30,fontWeight:900,color:'#14213d',marginBottom:20}}>{labels.title}</div>
  <div style={{display:'grid',gap:14}}>
   <div><div style={{fontWeight:800,marginBottom:6}}>{labels.name}</div><div style={{border:'1px solid #d9e3ec',borderRadius:12,padding:'13px 14px',background:'#fff',fontSize:17}}>{value(school?.school_name)||'Portail Scolaire Haïti'}</div></div>
   <div><div style={{fontWeight:800,marginBottom:6}}>{labels.phone}</div><div style={{border:'1px solid #d9e3ec',borderRadius:12,padding:'13px 14px',background:'#fff',fontSize:17}}>{value(school?.phone)}</div></div>
   <div><div style={{fontWeight:800,marginBottom:6}}>{labels.address}</div><div style={{border:'1px solid #d9e3ec',borderRadius:12,padding:'13px 14px',background:'#fff',fontSize:17}}>{value(school?.address)}</div></div>
   <div><div style={{fontWeight:800,marginBottom:6}}>{labels.email}</div><div style={{border:'1px solid #d9e3ec',borderRadius:12,padding:'13px 14px',background:'#fff',fontSize:17}}>{value(school?.email)}</div></div>
   <div><div style={{fontWeight:800,marginBottom:6}}>{labels.logo}</div><div style={{border:'1px solid #d9e3ec',borderRadius:12,padding:'13px 14px',background:'#fff'}}>{school?.logo_url?<img src={school.logo_url} alt={labels.logo} style={{maxWidth:120,maxHeight:100,objectFit:'contain',display:'block'}}/>:<div style={{color:'#6b7280'}}>—</div>}</div></div>
  </div>
 </div>
}
