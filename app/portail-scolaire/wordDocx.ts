'use client'

type ExportOptions={
 filename:string
 title:string
 schoolName?:string
 contact?:string
 info:Array<[string,string]>
 headers:string[]
 rows:string[][]
 generalLabel?:string
 generalValue?:string
 validationTitle:string
 signatureLabel:string
 stampLabel:string
 dateLabel:string
}

export async function downloadAcademicDocx(opts:ExportOptions){
 const {
  Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,HeadingLevel,BorderStyle
 }=await import('docx')

 const border={style:BorderStyle.SINGLE,size:1,color:'B7C6D4'}
 const tableBorders={top:border,bottom:border,left:border,right:border,insideHorizontal:border,insideVertical:border}
 const cells=(values:string[],header=false)=>values.map(v=>new TableCell({
  children:[new Paragraph({children:[new TextRun({text:v,bold:header})]})]
 }))

 const body:any[]=[]
 if(opts.schoolName)body.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:opts.schoolName,bold:true,size:32})]}))
 if(opts.contact)body.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:opts.contact,size:18,color:'5E6A78'})]}))
 body.push(new Paragraph({text:opts.title,heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER,spacing:{before:180,after:220}}))

 const infoRows=[] as any[]
 for(let i=0;i<opts.info.length;i+=2){
  const a=opts.info[i],b=opts.info[i+1]
  infoRows.push(new TableRow({children:[
   new TableCell({children:[new Paragraph({children:[new TextRun({text:`${a[0]}: `,bold:true}),new TextRun(a[1]||'—')]})]}),
   new TableCell({children:[new Paragraph({children:b?[new TextRun({text:`${b[0]}: `,bold:true}),new TextRun(b[1]||'—')]:[new TextRun('')]})]})
  ]}))
 }
 body.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:tableBorders,rows:infoRows}))
 body.push(new Paragraph({text:'',spacing:{after:120}}))

 body.push(new Table({
  width:{size:100,type:WidthType.PERCENTAGE},
  borders:tableBorders,
  rows:[new TableRow({children:cells(opts.headers,true)}),...opts.rows.map(r=>new TableRow({children:cells(r)}))]
 }))

 if(opts.generalLabel){
  body.push(new Paragraph({spacing:{before:240},children:[
   new TextRun({text:`${opts.generalLabel}: `,bold:true,size:26}),
   new TextRun({text:opts.generalValue||'—',bold:true,size:26})
  ]}))
 }

 body.push(new Paragraph({text:opts.validationTitle,heading:HeadingLevel.HEADING_2,spacing:{before:380,after:320}}))
 body.push(new Table({
  width:{size:100,type:WidthType.PERCENTAGE},
  borders:{top:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},bottom:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},left:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},right:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideHorizontal:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},insideVertical:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}},
  rows:[
   new TableRow({children:[
    new TableCell({children:[new Paragraph({text:'\n\n'}),new Paragraph({text:opts.signatureLabel,border:{top:{style:BorderStyle.SINGLE,size:6,color:'333333'}}})]}),
    new TableCell({children:[new Paragraph({text:'\n\n'}),new Paragraph({text:opts.stampLabel,border:{top:{style:BorderStyle.SINGLE,size:6,color:'333333'}}})]})
   ]}),
   new TableRow({children:[
    new TableCell({columnSpan:2,children:[new Paragraph({text:'\n'}),new Paragraph({text:opts.dateLabel,border:{top:{style:BorderStyle.SINGLE,size:6,color:'333333'}}})]})
   ]})
  ]
 }))

 const doc=new Document({sections:[{properties:{},children:body}]})
 const blob=await Packer.toBlob(doc)
 const url=URL.createObjectURL(blob)
 const a=document.createElement('a')
 a.href=url
 a.download=opts.filename.endsWith('.docx')?opts.filename:`${opts.filename}.docx`
 document.body.appendChild(a)
 a.click();a.remove()
 setTimeout(()=>URL.revokeObjectURL(url),1500)
}
