/** Brand B simplified CSS drawing for Satori/Next ImageResponse.
 * The website icon remains the complete HN SVG artwork.
 * CSS-only shapes avoid brittle nested SVG image rendering on Apple/Android routes.
 */
export default function HNIconArtwork({ size }: { size: number }) {
  const u = size / 512;
  const px = (n: number) => Math.round(n * u);
  return (
    <div style={{ position: "relative", display: "flex", overflow: "hidden",
      width: size, height: size, borderRadius: px(90),
      background: "linear-gradient(140deg,#087bd1,#073979 42%,#07184c 100%)" }}>
      <div style={{position:"absolute",left:px(82),top:px(178),display:"flex",
        fontFamily:"Arial,sans-serif",fontSize:px(224),lineHeight:1,fontWeight:900,
        color:"#ffffff",letterSpacing:px(-28)}}>H</div>
      <div style={{position:"absolute",left:px(242),top:px(180),display:"flex",
        fontFamily:"Arial,sans-serif",fontSize:px(224),lineHeight:1,fontWeight:900,
        color:"#15cbf2",letterSpacing:px(-12)}}>N</div>
      <div style={{position:"absolute",left:px(273),top:px(111),width:px(170),height:px(73),
        display:"flex",background:"#f7fbff",borderRadius:px(14),transform:"rotate(-7deg)",
        border:`${Math.max(1,px(3))}px solid #cce5fa`}} />
      <div style={{position:"absolute",left:px(290),top:px(159),width:px(137),height:px(39),
        display:"flex",background:"#f7fbff",borderRadius:px(26),border:`${Math.max(1,px(2))}px solid #bed9f5`}} />
      <div style={{position:"absolute",left:px(428),top:px(156),width:px(9),height:px(78),
        display:"flex",background:"#f82f50",borderRadius:px(5)}} />
      <div style={{position:"absolute",left:px(419),top:px(224),width:px(25),height:px(48),
        display:"flex",background:"#f82f50",borderRadius:px(9)}} />
      <div style={{position:"absolute",left:px(123),top:px(207),width:px(96),height:px(117),
        display:"flex",border:`${Math.max(2,px(14))}px solid #ffffff`,borderTop:"0px solid transparent",
        borderRadius:`0px 0px ${px(68)}px ${px(68)}px`}} />
      <div style={{position:"absolute",left:px(114),top:px(190),width:px(29),height:px(29),
        display:"flex",background:"#29e5ee",border:`${Math.max(1,px(2))}px solid #e3ffff`,borderRadius:"50%"}} />
      <div style={{position:"absolute",left:px(207),top:px(190),width:px(29),height:px(29),
        display:"flex",background:"#29e5ee",border:`${Math.max(1,px(2))}px solid #e3ffff`,borderRadius:"50%"}} />
      <div style={{position:"absolute",left:px(175),top:px(311),width:px(222),height:px(105),
        display:"flex",borderBottom:`${Math.max(2,px(14))}px solid white`,
        borderRight:`${Math.max(2,px(14))}px solid white`,
        borderRadius:`0px 0px ${px(117)}px ${px(114)}px`,transform:"rotate(-3deg)"}} />
      <div style={{position:"absolute",left:px(376),top:px(356),width:px(77),height:px(77),
        display:"flex",background:"#08336f",border:`${Math.max(2,px(8))}px solid #4fe1fc`,borderRadius:"50%",alignItems:"center",justifyContent:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",
          width:px(54),height:px(54),borderRadius:"50%",background:"#e9faff",
          fontSize:px(38),color:"#ee2149"}}>♥</div>
      </div>
    </div>
  );
}
