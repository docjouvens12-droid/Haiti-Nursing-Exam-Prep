'use client'

export default function MoviPassengerDesign() {
  return <style>{`
    body.passenger-hard-v2{background:#f5f8f7!important;color:#0f2136!important}
    body.passenger-hard-v2 .phone-frame{background:#f5f8f7!important}

    body.passenger-hard-v2 .map-panel.real-map-panel{
      height:46dvh!important;
      min-height:335px!important;
      max-height:470px!important;
      border-radius:0 0 30px 30px!important;
      overflow:hidden!important;
      box-shadow:0 18px 44px rgba(10,34,28,.08)!important;
    }

    body.passenger-hard-v2 .topbar{
      top:calc(12px + env(safe-area-inset-top))!important;
      left:14px!important;
      right:14px!important;
      grid-template-columns:46px minmax(0,1fr) 46px!important;
      gap:10px!important;
      z-index:40!important;
    }

    body.passenger-hard-v2 .round-button{
      width:46px!important;
      height:46px!important;
      border-radius:16px!important;
      border:1px solid rgba(219,231,226,.95)!important;
      background:rgba(255,255,255,.97)!important;
      color:#10243a!important;
      box-shadow:0 10px 26px rgba(16,32,51,.13)!important;
      backdrop-filter:blur(16px)!important;
      -webkit-backdrop-filter:blur(16px)!important;
    }

    body.passenger-hard-v2 .brand-chip{
      justify-self:center!important;
      min-width:124px!important;
      max-width:180px!important;
      height:48px!important;
      padding:6px 14px 6px 7px!important;
      border-radius:17px!important;
      border:1px solid rgba(216,229,223,.95)!important;
      background:rgba(255,255,255,.97)!important;
      box-shadow:0 10px 26px rgba(16,32,51,.11)!important;
      backdrop-filter:blur(16px)!important;
      -webkit-backdrop-filter:blur(16px)!important;
    }

    body.passenger-hard-v2 .brand-chip .brand-mark{
      width:34px!important;
      height:34px!important;
      border-radius:12px!important;
      background:linear-gradient(145deg,#18a06f,#08794f)!important;
      color:#fff!important;
      box-shadow:0 7px 18px rgba(11,132,88,.25)!important;
      font-size:0!important;
    }
    body.passenger-hard-v2 .brand-chip .brand-mark:after{
      content:'M';
      font-size:18px!important;
      line-height:1!important;
      font-weight:950!important;
      letter-spacing:-.08em!important;
      transform:skew(-6deg);
    }
    body.passenger-hard-v2 .brand-chip strong{
      font-size:0!important;
      color:#0c2038!important;
      font-weight:950!important;
      letter-spacing:-.035em!important;
    }
    body.passenger-hard-v2 .brand-chip strong:after{
      content:'MOVI';
      font-size:17px!important;
      line-height:1!important;
    }
    body.passenger-hard-v2 .brand-chip small{display:none!important}

    body.passenger-hard-v2 .booking-sheet{
      width:calc(100% - 18px)!important;
      max-width:452px!important;
      margin:-58px auto 0!important;
      padding:13px 14px calc(108px + env(safe-area-inset-bottom))!important;
      border-radius:30px 30px 0 0!important;
      border:1px solid #e2ebe7!important;
      border-bottom:0!important;
      background:rgba(255,255,255,.99)!important;
      box-shadow:0 -10px 34px rgba(16,32,51,.09)!important;
      z-index:45!important;
    }

    body.passenger-hard-v2 .grabber{
      width:42px!important;
      height:4px!important;
      margin:1px auto 12px!important;
      border-radius:999px!important;
      background:#d7e1dd!important;
    }

    body.passenger-hard-v2 .passenger-booking-head{
      max-width:398px!important;
      margin:0 auto 12px!important;
      padding:0 2px!important;
    }
    body.passenger-hard-v2 .passenger-booking-head small{
      color:#0d8a5b!important;
      font-size:9px!important;
      letter-spacing:.11em!important;
    }
    body.passenger-hard-v2 .passenger-booking-head strong{
      color:#0e2037!important;
      font-size:22px!important;
      letter-spacing:-.035em!important;
    }
    body.passenger-hard-v2 .passenger-booking-head span{
      color:#7b8884!important;
      font-size:10px!important;
    }
    body.passenger-hard-v2 .passenger-booking-head-icon{
      width:42px!important;
      height:42px!important;
      border-radius:14px!important;
      background:#e8f7f1!important;
      border:1px solid #d3ebe2!important;
      box-shadow:0 7px 18px rgba(12,126,84,.08)!important;
    }

    body.passenger-hard-v2 .route-card{
      max-width:398px!important;
      margin:0 auto!important;
      padding:5px 12px!important;
      border-radius:20px!important;
      border:1px solid #dce7e2!important;
      background:#fff!important;
      box-shadow:0 9px 24px rgba(16,32,51,.055)!important;
    }
    body.passenger-hard-v2 .route-line{min-height:60px!important}
    body.passenger-hard-v2 .route-line:first-child{border-bottom:1px solid #eef3f1!important}
    body.passenger-hard-v2 .pickup-dot{background:#0c9362!important;box-shadow:0 0 0 5px #e9f7f2!important}
    body.passenger-hard-v2 .destination-dot{background:#10243a!important;box-shadow:0 0 0 5px #eef2f5!important}
    body.passenger-hard-v2 .input-wrap label{color:#7c8985!important;font-size:8.5px!important}
    body.passenger-hard-v2 .input-wrap input{color:#11263d!important;font-size:16px!important;font-weight:800!important}

    body.passenger-hard-v2 .section-heading,
    body.passenger-hard-v2 .ride-list,
    body.passenger-hard-v2 .payment-row,
    body.passenger-hard-v2 .request-button,
    body.passenger-hard-v2 .searching-card,
    body.passenger-hard-v2 .ride-error{
      max-width:398px!important;
      margin-left:auto!important;
      margin-right:auto!important;
    }

    body.passenger-hard-v2 .section-heading{margin-top:16px!important}
    body.passenger-hard-v2 .section-heading h2{font-size:16px!important;color:#10243a!important}
    body.passenger-hard-v2 .passenger-service-subtitle{color:#87938f!important}

    body.passenger-hard-v2 .ride-list{gap:10px!important;margin-top:9px!important}
    body.passenger-hard-v2 .ride-option{
      min-height:108px!important;
      border-radius:20px!important;
      border:1px solid #e0e9e5!important;
      background:#fff!important;
      box-shadow:0 7px 20px rgba(16,32,51,.045)!important;
    }
    body.passenger-hard-v2 .ride-option.selected{
      border:1.5px solid #46a784!important;
      background:linear-gradient(180deg,#f3fbf8 0%,#ebf7f2 100%)!important;
      box-shadow:0 10px 24px rgba(13,139,92,.11)!important;
    }
    body.passenger-hard-v2 .ride-option.selected:after{background:#0c8d5e!important}
    body.passenger-hard-v2 .ride-icon{background:#f0f6f3!important}
    body.passenger-hard-v2 .ride-copy strong{color:#10243a!important}
    body.passenger-hard-v2 .ride-price{color:#087d54!important}

    body.passenger-hard-v2 .payment-row{
      margin-top:12px!important;
      padding:12px!important;
      border-radius:18px!important;
      border:1px solid #dbe8e3!important;
      background:#f7fbf9!important;
      box-shadow:none!important;
    }
    body.passenger-hard-v2 .payment-icon{background:#e7f5ef!important}
    body.passenger-hard-v2 .payment-row button{color:#087d54!important}

    body.passenger-hard-v2 .request-button{
      margin-top:12px!important;
      min-height:61px!important;
      border-radius:19px!important;
      background:linear-gradient(135deg,#13a16d 0%,#087c53 100%)!important;
      box-shadow:0 13px 30px rgba(8,124,83,.24)!important;
    }
    body.passenger-hard-v2 .request-button:disabled{
      background:#afbbb7!important;
      box-shadow:none!important;
    }

    body.passenger-hard-v2 .nav-drawer{
      border-radius:0 28px 28px 0!important;
      background:#fff!important;
      box-shadow:22px 0 55px rgba(8,29,24,.18)!important;
    }

    @media(max-width:420px){
      body.passenger-hard-v2 .map-panel.real-map-panel{height:44dvh!important;min-height:318px!important}
      body.passenger-hard-v2 .booking-sheet{width:calc(100% - 10px)!important;margin-top:-52px!important;padding-left:12px!important;padding-right:12px!important}
      body.passenger-hard-v2 .brand-chip{height:44px!important;min-width:116px!important}
      body.passenger-hard-v2 .brand-chip .brand-mark{width:31px!important;height:31px!important}
      body.passenger-hard-v2 .brand-chip strong:after{font-size:16px!important}
      body.passenger-hard-v2 .passenger-booking-head strong{font-size:20px!important}
    }
  `}</style>
}
