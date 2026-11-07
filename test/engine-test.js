// Usage: node test/engine-test.js index.html
const fs=require('fs');const s=fs.readFileSync(process.argv[2],'utf8');
const eng=s.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
eval(eng+';globalThis.E={optimize,genPrices,parsePrices,parseNum,SCEN};');

const base={Pch:50,Pdis:50,cap:100,socMin:.05,socMax:.95,soc0:.2,rte:.88,aux:.3,deg:45,cycPerDay:2,finalEq:true,Tw:96.5,Ti:4.5};
let ok=true;const chk=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)ok=false;};
for(const sc of ['spring','summer','winter','flat']){
  const pr=genPrices(sc,20261108); let t0=Date.now(); const r=optimize(pr,base); const ms=Date.now()-t0;
  const T=r.tot; const sum=T.revenue-T.energyCost-T.tarW-T.tarI-T.deg-T.auxEnergy-T.auxTar;
  console.log(sc, 'net',T.net.toFixed(0),'in',T.gridIn.toFixed(2),'out',T.gridOut.toFixed(2),'cyc',T.cycles.toFixed(3),'lambda',r.meta.lambda.toFixed(1),'ms',ms,'kc/kd',r.meta.kc,r.meta.kd,'maxPdis',Math.max(...r.rows.map(x=>x.pDis)).toFixed(2),'maxPch',Math.max(...r.rows.map(x=>x.pCh)).toFixed(2));
  chk(Math.abs(T.gridIn*r.etaC - T.gridOut/r.etaD - (T.Eend-T.E0))<1e-6, sc+' energy balance');
  chk(Math.abs(sum-T.net)<1e-6, sc+' P&L lines sum');
  chk(Math.abs(T.Eend-T.E0)<1e-9, sc+' final SoC = initial');
  chk(T.cycles<=2+1e-6, sc+' cycle limit');
  chk(r.rows.every(x=>x.Eafter>=5-1e-9&&x.Eafter<=95+1e-9 && x.pCh<=50+1e-9 && x.pDis<=50+1e-9), sc+' bounds');
  chk(!(r.rows.some(x=>x.pCh>0&&x.pDis>0)), sc+' no simultaneous');
  // brute check: each discharge-paired charge profitable-ish: net >= idle (0 - aux cost)
  const idle=-r.rows.reduce((a,x)=>a+x.auxEnergy+x.auxTar,0); chk(T.net>=idle-1e-6, sc+' beats idle');
}
const r0=optimize(genPrices('spring',1),{...base,Tw:0,Ti:0}), r1=optimize(genPrices('spring',1),base);
chk(r0.tot.net>=r1.tot.net, 'no-tariff profit >= with tariffs');
chk(parseNum('1.234,56')===1234.56 && parseNum('1234.56')===1234.56 && parseNum('-12,5')===-12.5 && parseNum('1,234.5')===1234.5 && parseNum('1.234')===1234, 'parseNum formats');
chk(JSON.stringify(parsePrices('Interval;Pret\n1;452,18\n2;-3,50\n3;1.204,00'))==='[452.18,-3.5,1204]', 'parsePrices OPCOM-like rows');
chk(parsePrices('450.5, 460.2, -10').length===3,'parsePrices single line');
const week=[];for(let d=0;d<7;d++)week.push(...genPrices('summer',d));let t0=Date.now();const rw=optimize(week,base);console.log('7 days ms',Date.now()-t0,'net',rw.tot.net.toFixed(0));
chk(!rw.error,'7-day run');
const rf=optimize(genPrices('flat',3),base); console.log('flat net',rf.tot.net.toFixed(0),'out',rf.tot.gridOut.toFixed(1));
console.log(ok?'ALL PASS':'SOME FAILED');
const rc=optimize(genPrices('spring',20261108),{...base,cycPerDay:1});
console.log('cyc1', rc.tot.cycles.toFixed(3), 'lambda', rc.meta.lambda.toFixed(1), 'net', rc.tot.net.toFixed(0), 'active', rc.meta.lambdaActive);
console.log((rc.tot.cycles<=1+1e-6 && rc.meta.lambdaActive && Math.abs(rc.tot.revenue-rc.tot.energyCost-rc.tot.tarW-rc.tot.tarI-rc.tot.deg-rc.tot.auxEnergy-rc.tot.auxTar-rc.tot.net)<1e-6)?'PASS binding cycle limit, lambda not in P&L':'FAIL cycle');
