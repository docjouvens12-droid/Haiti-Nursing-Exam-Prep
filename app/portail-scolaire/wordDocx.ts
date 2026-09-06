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
  Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,HeadingLevel,BorderStyle,TableLayoutType
 }=await import('docx')

 const pageWidth=10000
 const border={style:BorderStyle.SINGLE,size:1,color:'B7C6D4'}
 const tableBorders={top:border,bottom:border,left:border,right:border,insideHorizontal:border,insideVertical:border}
 const widthsFor=(count:number)=>{
  if(count<=2)return [7000,3000]
  if(count===3)return [2200,5800,2000]
  if(count===4)return [4300,1700,2000,2000]
  const each=Math.floor(pageWidth/Math.max(1,count))
  return Array.from({length:count},()=>each)
 }
 const cells=(values:string[],header=false,widths?:number[])=>values.map((v,i)=>new TableCell({
  width:{size:widths?.[i]||Math.floor(pageWidth/Math.max(1,values.length)),type:WidthType.DXA},
  children:[new Paragraph({spacing:{before:40,after:40},children:[new TextRun({text:v,bold:header,size:20})]})]
 }))

 const body:any[]=[]
 if(opts.schoolName)body.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:opts.schoolName,bold:true,size:32})]}))
 if(opts.contact)body.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:opts.contact,size:18,color:'5E6A78'})]}))
 body.push(new Paragraph({text:opts.title,heading:HeadingLevel.HEADING_1,alignment:AlignmentType.CENTER,spacing:{before:180,after:220}}))

 const infoRows=[] as any[]
 const infoWidths=[5000,5000]
 for(let i=0;i<opts.info.length;i+=2){
  const a=opts.info[i],b=opts.info[i+1]
  infoRows.push(new TableRow({children:[
   new TableCell({width:{size:infoWidths[0],type:WidthType.DXA},children:[new Paragraph({children:[new TextRun({text:`${a[0]}: `,bold:true,size:20}),new TextRun({text:a[1]||'—',size:20})]})]}),
   new TableCell({width:{size:infoWidths[1],type:WidthType.DXA},children:[new Paragraph({children:b?[new TextRun({text:`${b[0]}: `,bold:true,size:20}),new TextRun({text:b[1]||'—',size:20})]:[new TextRun({text:'',size:20})]})]})
  ]}))
 }
 body.push(new Table({width:{size:pageWidth,type:WidthType.DXA},columnWidths:infoWidths,layout:TableLayoutType.FIXED,borders:tableBorders,rows:infoRows}))
 body.push(new Paragraph({text:'',spacing:{after:120}}))

 const mainWidths=widthsFor(opts.headers.length||2)
 body.push(new Table({
  width:{size:pageWidth,type:WidthType.DXA},
  columnWidths:mainWidths,
  layout:TableLayoutType.FIXED,
  borders:tableBorders,
  rows:[new TableRow({children:cells(opts.headers,true,mainWidths)}),...opts.rows.map(r=>new TableRow({children:cells(r,false,mainWidths)}))]
 }))

 if(opts.generalLabel){
  body.push(new Paragraph({spacing:{before:240},children:[
   new TextRun({text:`${opts.generalLabel}: `,bold:true,size:26}),
   new TextRun({text:opts.generalValue||'—',bold:true,size:26})
  ]}))
 }

 body.push(new Paragraph({text:opts.validationTitle,heading:HeadingLevel.HEADING_2,spacing:{before:380,after:240}}))
 const validationWidths=[4800,4800]
 const noBorder={style:BorderStyle.NONE,size:0,color:'FFFFFF'}
 const validationBorders={top:noBorder,bottom:noBorder,left:noBorder,right:noBorder,insideHorizontal:noBorder,insideVertical:noBorder}
 body.push(new Table({
  width:{size:pageWidth,type:WidthType.DXA},
  columnWidths:[5000,5000],
  layout:TableLayoutType.FIXED,
  borders:validationBorders,
  rows:[
   new TableRow({children:[
    new TableCell({width:{size:5000,type:WidthType.DXA},margins:{right:260},children:[
     new Paragraph({spacing:{before:420,after:20},children:[new TextRun({text:'____________________________',size:20})]}),
     new Paragraph({spacing:{after:160},children:[new TextRun({text:opts.signatureLabel,bold:true,size:20})]})
    ]}),
    new TableCell({width:{size:5000,type:WidthType.DXA},margins:{left:260},children:[
     new Paragraph({spacing:{before:420,after:20},children:[new TextRun({text:'____________________________',size:20})]}),
     new Paragraph({spacing:{after:160},children:[new TextRun({text:opts.stampLabel,bold:true,size:20})]})
    ]})
   ]}),
   new TableRow({children:[
    new TableCell({columnSpan:2,width:{size:pageWidth,type:WidthType.DXA},children:[
     new Paragraph({spacing:{before:260,after:20},children:[new TextRun({text:'____________________________________________',size:20})]}),
     new Paragraph({children:[new TextRun({text:opts.dateLabel,bold:true,size:20})]})
    ]})
   ]})
  ]
 }))

 const doc=new Document({sections:[{
  properties:{page:{size:{width:11906,height:16838},margin:{top:720,right:720,bottom:720,left:720}}},
  children:body
 }]})
 const blob=await Packer.toBlob(doc)
 const url=URL.createObjectURL(blob)
 const a=document.createElement('a')
 a.href=url
 a.download=opts.filename.endsWith('.docx')?opts.filename:`${opts.filename}.docx`
 document.body.appendChild(a)
 a.click();a.remove()
 setTimeout(()=>URL.revokeObjectURL(url),1500)
}
