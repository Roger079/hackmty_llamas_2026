import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { ChartProps, RecordRow, SeriesConfig } from './types';
import { arc, extent, format, num, palette, path, pointer, resolve, rows, scale, statusColor } from './utils';

const margin={top:30,right:20,bottom:42,left:58};
function useWidth(){const ref=useRef<HTMLDivElement>(null);const [w,setW]=useState(640);useEffect(()=>{const o=new ResizeObserver(()=>setW(ref.current?.clientWidth||640));if(ref.current)o.observe(ref.current);return()=>o.disconnect()},[]);return[ref,w] as const}
const axis=(w:number,h:number,values:number[],fmt:(x:number)=>string)=>{const [lo,hi]=extent(values);const ticks=Array.from({length:5},(_,i)=>lo+(hi-lo)*i/4);return <>{ticks.map(v=>{const y=scale(v,[lo,hi],[h-margin.bottom,margin.top]);return <g key={v}><line x1={margin.left} x2={w-margin.right} y1={y} y2={y} stroke="#E6EDF4"/><text x={margin.left-9} y={y+4} textAnchor="end" fontSize="10" fill="#6D85A1">{fmt(v)}</text></g>})}<line x1={margin.left} x2={w-margin.right} y1={h-margin.bottom} y2={h-margin.bottom} stroke="#C9D7E5"/></>}
function pointsFor(data:RecordRow[], s:SeriesConfig, i:number, w:number,h:number, all:number[]){const xk=s.xKey||'x',yk=s.yKey||'y',[lo,hi]=extent(all);return data.map((d,j)=>({d,x:scale(j,[0,Math.max(data.length-1,1)],[margin.left,w-margin.right]),y:scale(num(d[yk]),[lo,hi],[h-margin.bottom,margin.top]),v:num(d[yk]),label:String(d[xk]??j),color:s.color||palette[i%palette.length]}))}
function Cartesian({p,w,h,data,series}: {p:ChartProps;w:number;h:number;data:RecordRow[];series:SeriesConfig[]}){
  const rawData = data.length ? data : rows(p.data, p.dataPath);
  const firstRow = rawData[0] || {};
  const catKey = p.categoryKey || Object.keys(firstRow).find(k => typeof firstRow[k] === 'string' && !['color', 'status'].includes(k)) || 'label';

  if (!series.length) {
    const numKeys = Object.keys(firstRow).filter(k => k !== catKey && (typeof firstRow[k] === 'number' || (!isNaN(Number(firstRow[k])) && firstRow[k] !== '')));
    if (numKeys.length > 1) {
      series = numKeys.map((k, idx) => ({
        dataPath: p.dataPath || '',
        xKey: catKey,
        yKey: k,
        name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        color: palette[idx % palette.length]
      }));
    } else {
      series = [{ dataPath: p.dataPath || '', xKey: catKey, yKey: p.valueKey || numKeys[0] || 'value', color: palette[0] }];
    }
  }

  const source = series.map(s => {
    const r = rows(p.data, s.dataPath);
    return r.length ? r : rawData;
  });

  const main = source[0]?.length ? source[0] : rawData;
  const count = Math.max(main.length, 1);
  const isStacked = p.chartType === 'stackedBar' || p.chartType === 'stackedArea';
  const isGrouped = p.chartType === 'groupedBar';

  const singleValues: number[] = source.flatMap((d, i) => d.map(r => num(r[series[i].yKey || p.valueKey || 'value'])));
  const stackedSums: number[] = main.map((_, i) => series.reduce((sum, s, k) => sum + Math.max(0, num((source[k][i] || main[i])?.[s.yKey || p.valueKey || 'value'])), 0));
  const allValues = isStacked ? [...singleValues, ...stackedSums] : singleValues;
  const [lo, hi] = extent(allValues.length ? allValues : [0, 100]);

  const y = (v: number) => scale(v, [Math.min(0, lo), Math.max(hi, 1)], [h - margin.bottom, margin.top]);
  const x = (i: number) => scale(i, [0, Math.max(count - 1, 1)], [margin.left, w - margin.right]);
  const bw = (w - margin.left - margin.right) / count * 0.62;

  const marks = p.chartType === 'barHorizontal' ? main.map((d, i) => {
    const v = num(d[p.valueKey || series[0]?.yKey || 'value']);
    const yy = margin.top + i * (h - margin.top - margin.bottom) / count;
    return (
      <g key={i}>
        <text x={margin.left - 7} y={yy + 15} textAnchor="end" fontSize="10" fill="#526B87" fontWeight="600">
          {String(d[catKey] ?? '')}
        </text>
        <rect
          x={margin.left}
          y={yy}
          width={scale(v, [0, Math.max(hi, 1)], [0, w - margin.left - margin.right])}
          height={Math.max(8, (h - margin.top - margin.bottom) / count - 8)}
          rx="5"
          fill={v < 0 ? p.colorNegative || '#C7354F' : p.colorPositive || '#E4003B'}
        />
      </g>
    );
  }) : ['bar', 'groupedBar', 'stackedBar', 'waterfall', 'histogram'].includes(p.chartType) ? main.flatMap((d, i) => {
    const vals = (isGrouped || isStacked)
      ? series.map((s, k) => num((source[k]?.[i] || d)?.[s.yKey || p.valueKey || 'value']))
      : [num(d[p.valueKey || series[0]?.yKey || 'value'])];
    let base = 0;
    return vals.map((v, k) => {
      const xx = isGrouped ? (x(i) - bw / 2 + (bw / vals.length) * k) : (x(i) - bw / 2);
      const yy = isStacked ? y(base + Math.max(v, 0)) : y(Math.max(v, 0));
      const hh = isStacked ? Math.abs(y(base) - y(base + v)) : Math.abs(y(0) - y(v));
      if (isStacked) base += Math.max(0, v);
      return (
        <rect
          key={`${i}-${k}`}
          x={xx}
          y={yy}
          width={isGrouped ? Math.max(bw / vals.length - 2, 4) : bw}
          height={Math.max(hh, 2)}
          rx="3"
          fill={series[k]?.color || palette[k % palette.length]}
        >
          <title>{`${series[k]?.name || 'Valor'}: ${format(v, p.valueFormat, p.currency)}`}</title>
        </rect>
      );
    });
  }) : series.map((s, i) => {
    const pts = pointsFor(source[i] || main, s, i, w, h, allValues);
    const last = pts[pts.length - 1];
    const d = path(pts.map(q => [q.x, q.y]));
    const fill = p.chartType.includes('area') ? `${d} L${last?.x},${h - margin.bottom} L${pts[0]?.x},${h - margin.bottom} Z` : undefined;
    return (
      <g key={i}>
        {fill && <path d={fill} fill={pts[0]?.color} opacity=".14" />}
        <path d={d} fill="none" stroke={pts[0]?.color} strokeWidth="2.5" />
        {pts.map((q, j) => (
          <circle key={j} cx={q.x} cy={q.y} r="3" fill="#fff" stroke={q.color} strokeWidth="2" />
        ))}
      </g>
    );
  });

  return (
    <>
      <g>{axis(w, h, allValues, v => format(v, p.valueFormat, p.currency))}</g>
      {marks}
      <g>
        {main.map((d, i) => (
          <text key={i} x={x(i)} y={h - 15} textAnchor="middle" fontSize="10" fill="#6D85A1" fontWeight="600">
            {String(d[catKey] ?? '').slice(0, 12)}
          </text>
        ))}
      </g>
    </>
  );
}
function Radial({p,w,h,data}:{p:ChartProps;w:number;h:number;data:RecordRow[]}){const cx=w/2,cy=h/2,r=Math.min(w,h)/2-30, vals:number[]=data.map(d=>num(d[p.valueKey||'value']));const total=vals.reduce((a,b)=>a+b,0)||1;let angle=-Math.PI/2;return <>{data.map((d,i)=>{const next=angle+Math.max(0,vals[i])/total*Math.PI*2;const out=<path key={i} d={arc(cx,cy,r,angle,next,p.chartType==='donut'?r*.6:0)} fill={palette[i%palette.length]} stroke="#FFFFFF" strokeWidth="2" onClick={()=>p.action&&p.onAction?.(p.action.event,d)} style={{cursor:p.action?'pointer':'default'}}/>;angle=next;return out})}<text x={cx} y={cy-2} textAnchor="middle" fontSize="11" fill="#6D85A1" fontWeight="600">{p.chartType==='donut'?'Total':''}</text><text x={cx} y={cy+18} textAnchor="middle" fontSize="18" fontWeight="700" fill="#061D3A">{p.chartType==='donut'?format(total,p.valueFormat,p.currency):''}</text></>}
function Gauge({p,w,h}:{p:ChartProps;w:number;h:number}){const min=num(resolve(p.gaugeMin,p.data)),max=num(resolve(p.gaugeMax,p.data),100),value=num(resolve(p.gaugeValue,p.data));const cx=w/2,cy=h*.76,r=Math.min(w*.38,h*.62),ratio=Math.max(0,Math.min(1,(value-min)/(max-min||1)));const bands=p.thresholds||[{from:min,to:max,status:'neutral'} as any];return <>{bands.map((b,i)=>{const from=num(resolve(b.from,p.data)),to=num(resolve(b.to,p.data));return <path key={i} d={arc(cx,cy,r,Math.PI+Math.PI*(from-min)/(max-min||1),Math.PI+Math.PI*(to-min)/(max-min||1),r-15)} fill={statusColor[(b.status||'neutral') as keyof typeof statusColor]}/>})}<line x1={cx} y1={cy} x2={cx+r*.78*Math.cos(Math.PI+Math.PI*ratio)} y2={cy+r*.78*Math.sin(Math.PI+Math.PI*ratio)} stroke="#061D3A" strokeWidth="3"/><circle cx={cx} cy={cy} r="6" fill="#061D3A"/><text x={cx} y={cy+30} textAnchor="middle" fontSize="22" fontWeight="700" fill="#061D3A">{format(value,p.valueFormat,p.currency)}</text></>}
function Special({p,w,h,data}:{p:ChartProps;w:number;h:number;data:RecordRow[]}){const key=p.valueKey||'value'; if(p.chartType==='histogram'){const values=data.map(d=>num(d[key]));const [lo,hi]=extent(values), bins=Array.from({length:8},()=>0);values.forEach(v=>bins[Math.min(7,Math.floor((v-lo)/(hi-lo||1)*8))]++);return <Cartesian p={{...p,chartType:'bar',data:{bins:bins.map((v,i)=>({label:Math.round(lo+(hi-lo)*i/8),value:v}))},dataPath:'/bins',categoryKey:'label',valueKey:'value'}} w={w} h={h} data={[] } series={[]}/>}
 if(p.chartType==='treemap'){const total=data.reduce((a,d)=>a+Math.max(0,num(d[key])),0)||1;let x=margin.left;const hh=h-margin.top-margin.bottom;return <>{data.map((d,i)=>{const ww=(w-margin.left-margin.right)*Math.max(0,num(d[key]))/total,ret=<g key={i}><rect x={x} y={margin.top} width={ww} height={hh} fill={palette[i%palette.length]} stroke="#fff"/><text x={x+6} y={margin.top+20} fontSize="11" fill="#fff">{String(d[p.categoryKey||'label']??'')}</text></g>;x+=ww;return ret})}</>}
 if(p.chartType==='sunburst'){const total=data.reduce((a,d)=>a+Math.max(0,num(d[key])),0)||1,cx=w/2,cy=h/2,r=Math.min(w,h)/2-24;let a=-Math.PI/2;return <>{data.map((d,i)=>{const next=a+Math.max(0,num(d[key]))/total*Math.PI*2,ret=<path key={i} d={arc(cx,cy,r,a,next,r*.42)} fill={palette[i%palette.length]} stroke="#fff"/>;a=next;return ret})}</>}
 if(p.chartType==='scatter'||p.chartType==='bubble'){const s=p.series?.[0],xk=s?.xKey||p.categoryKey||'x',yk=s?.yKey||key,sk=s?.sizeKey||'size';const [xl,xh]=extent(data.map(d=>num(d[xk]))),[yl,yh]=extent(data.map(d=>num(d[yk]))),[sl,sh]=extent(data.map(d=>num(d[sk],1)));return <>{axis(w,h,data.map(d=>num(d[yk])),v=>format(v,p.valueFormat,p.currency))}{data.map((d,i)=><circle key={i} cx={scale(num(d[xk]),[xl,xh],[margin.left,w-margin.right])} cy={scale(num(d[yk]),[yl,yh],[h-margin.bottom,margin.top])} r={p.chartType==='bubble'?4+16*scale(num(d[sk],1),[sl,sh],[0,1]):5} fill={palette[i%palette.length]} opacity=".72"><title>{`${d[xk]} · ${d[yk]}`}</title></circle>)}</>}
 if(p.chartType==='candlestick'){const s=p.series?.[0],ok=s?.openKey||'open',hk=s?.highKey||'high',lk=s?.lowKey||'low',ck=s?.closeKey||'close',vals=data.flatMap(d=>[num(d[hk]),num(d[lk])]),[lo,hi]=extent(vals),step=(w-margin.left-margin.right)/Math.max(data.length,1);return <>{axis(w,h,vals,v=>format(v,p.valueFormat,p.currency))}{data.map((d,i)=>{const x=margin.left+step*(i+.5),up=num(d[ck])>=num(d[ok]),yy=(v:number)=>scale(v,[lo,hi],[h-margin.bottom,margin.top]);return <g key={i}><line x1={x} x2={x} y1={yy(num(d[hk]))} y2={yy(num(d[lk]))} stroke={up?'#008A5A':'#C7354F'}/><rect x={x-step*.25} y={yy(Math.max(num(d[ok]),num(d[ck])))} width={step*.5} height={Math.max(2,Math.abs(yy(num(d[ok]))-yy(num(d[ck]))))} fill={up?'#008A5A':'#C7354F'}/></g>})}</>}
 if(p.chartType==='boxplot'){const s=p.series?.[0],q1=s?.q1Key||'q1',med=s?.medianKey||'median',q3=s?.q3Key||'q3',min=s?.minKey||'min',max=s?.maxKey||'max',vals=data.flatMap(d=>[num(d[min]),num(d[q1]),num(d[med]),num(d[q3]),num(d[max])]),[lo,hi]=extent(vals),step=(w-margin.left-margin.right)/Math.max(data.length,1),yy=(v:number)=>scale(v,[lo,hi],[h-margin.bottom,margin.top]);return <>{axis(w,h,vals,v=>format(v,p.valueFormat,p.currency))}{data.map((d,i)=>{const x=margin.left+step*(i+.5);return <g key={i}><line x1={x} x2={x} y1={yy(num(d[min]))} y2={yy(num(d[max]))} stroke="#4A515E"/><rect x={x-step*.25} y={yy(num(d[q3]))} width={step*.5} height={Math.abs(yy(num(d[q1]))-yy(num(d[q3])))} fill="#FDE2E4" stroke="#EB0029"/><line x1={x-step*.25} x2={x+step*.25} y1={yy(num(d[med]))} y2={yy(num(d[med]))} stroke="#EB0029" strokeWidth="2"/></g>})}</>}
 if(p.chartType==='bullet'){const max=num(resolve(p.gaugeMax,p.data),Math.max(num(resolve(p.bulletTarget,p.data)),num(resolve(p.bulletValue,p.data)),1));const v=num(resolve(p.bulletValue,p.data)),t=num(resolve(p.bulletTarget,p.data));return <><rect x={margin.left} y={h/2-18} width={w-margin.left-margin.right} height="36" rx="7" fill="#EAEFF5"/>{(p.thresholds||[]).map((b,i)=><rect key={i} x={scale(num(resolve(b.from,p.data)),[0,max],[margin.left,w-margin.right])} y={h/2-18} width={scale(num(resolve(b.to,p.data))-num(resolve(b.from,p.data)),[0,max],[0,w-margin.left-margin.right])} height="36" fill={statusColor[b.status||'neutral']} opacity=".24"/>)}<rect x={margin.left} y={h/2-8} width={scale(v,[0,max],[0,w-margin.left-margin.right])} height="16" rx="4" fill="#E4003B"/><line x1={scale(t,[0,max],[margin.left,w-margin.right])} x2={scale(t,[0,max],[margin.left,w-margin.right])} y1={h/2-28} y2={h/2+28} stroke="#061D3A" strokeWidth="3"/></>}
 if(p.chartType==='calendarHeatmap'){const max=Math.max(...data.map(d=>num(d[key])),1);return <>{data.map((d,i)=>{const col=i%13,row=Math.floor(i/13);return <g key={i}><rect x={margin.left+col*24} y={margin.top+row*24} width="18" height="18" rx="3" fill="#EB0029" opacity={.12+.88*num(d[key])/max}/><title>{`${d[p.dateKey||'date']}: ${d[key]}`}</title></g>})}</>}
 if(p.chartType==='radar'){const n=Math.max(data.length,3),cx=w/2,cy=h/2,r=Math.min(w,h)/2-38,max=Math.max(...data.map(d=>num(d[key])),1);const radarPoints=data.map((d,i)=>{const a=-Math.PI/2+i*Math.PI*2/n,rr=r*num(d[key])/max;return [cx+rr*Math.cos(a),cy+rr*Math.sin(a)] as [number,number]});return <>{Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/n;return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#E2E6EC"/>})}<path d={path(radarPoints)+' Z'} fill="#EB0029" opacity=".2" stroke="#EB0029" strokeWidth="2"/></>}
 return <Cartesian p={p} w={w} h={h} data={data} series={p.series||[]}/>}
export function Chart(p:ChartProps){const [ref,w]=useWidth(),h=p.height||300;const data=rows(p.data,p.dataPath);const title=resolve(p.title,p.data);const series=useMemo(()=>p.series||[],[p.series]);const isRadial=['pie','donut'].includes(p.chartType);return <section ref={ref} className={p.className} style={{background:'#FFFFFF',border:'1px solid #DCE7F0',borderRadius:16,padding:20,boxShadow:'0 8px 24px -16px rgba(6,29,58,.28)'}}>{title&&<h3 style={{margin:'0 0 4px',fontSize:17,fontWeight:700,color:'#061D3A',letterSpacing:'-0.01em'}}>{title}</h3>}{resolve(p.subtitle,p.data)&&<p style={{margin:'0 0 14px',fontSize:12,color:'#6D85A1'}}>{resolve(p.subtitle,p.data)}</p>}<svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title||p.chartType}>{isRadial?<Radial p={p} w={w} h={h} data={data}/>:p.chartType==='gauge'?<Gauge p={p} w={w} h={h}/>:<Special p={p} w={w} h={h} data={data}/>}</svg>{resolve(p.showLegend,p.data)!==false&&series.length>1&&<div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:12,color:'#526B87',fontWeight:600}}>{series.map((s,i)=><span key={i}><i style={{display:'inline-block',width:8,height:8,borderRadius:8,background:s.color||palette[i],marginRight:6}}/>{resolve(s.name,p.data)||`Serie ${i+1}`}</span>)}</div>}</section>}
