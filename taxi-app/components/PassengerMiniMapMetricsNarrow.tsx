'use client'

export default function PassengerMiniMapMetricsNarrow() {
  return <style>{`
    .passenger-live-top-map .passenger-live-top-map-metrics{
      left:8px!important;
      top:64px!important;
      width:150px!important;
      grid-template-rows:40px 18px!important;
      border-radius:11px!important;
    }
    .passenger-live-top-map .passenger-live-top-map-metric{
      padding:5px 6px 4px!important;
    }
    .passenger-live-top-map .passenger-live-top-map-metric span{
      font-size:5.2px!important;
      letter-spacing:.01em!important;
    }
    .passenger-live-top-map .passenger-live-top-map-metric strong{
      margin-top:2px!important;
      font-size:12px!important;
    }
    .passenger-live-top-map .trip-endpoints{
      gap:5px!important;
      padding:0 5px!important;
      font-size:5px!important;
    }
    .passenger-live-top-map .trip-endpoints b{
      width:4px!important;
      height:4px!important;
    }
  `}</style>
}
