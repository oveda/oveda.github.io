import{c as oe,h as ie,l as m}from"./QBtn.d238dfaf.js";import{d as se,e as F,f as ve,B as pe,c as g,h as ne,g as ue,M as V,$ as he,r as v,N as e,a0 as W,U as j,a1 as H,R as P,a2 as s,a3 as O,a4 as N,O as r,a5 as de,a6 as me,Q as _e}from"./index.5799aa8a.js";import{u as fe,a as ye,b as re}from"./stopWatchModel.cf60fc1d.js";import{_ as ce}from"./plugin-vue_export-helper.21dcd24c.js";var We=oe({name:"QPage",props:{padding:Boolean,styleFn:Function},setup(t,{slots:f}){const{proxy:{$q:p}}=ue(),a=se(ve,F);if(a===F)return console.error("QPage needs to be a deep child of QLayout"),F;if(se(pe,F)===F)return console.error("QPage needs to be child of QPageContainer"),F;const h=g(()=>{const n=(a.header.space===!0?a.header.size:0)+(a.footer.space===!0?a.footer.size:0);if(typeof t.styleFn=="function"){const u=a.isContainer.value===!0?a.containerHeight.value:p.screen.height;return t.styleFn(n,u)}return{minHeight:a.isContainer.value===!0?a.containerHeight.value-n+"px":p.screen.height===0?n!==0?`calc(100vh - ${n}px)`:"100vh":p.screen.height-n+"px"}}),d=g(()=>`q-page${t.padding===!0?" q-layout-padding":""}`);return()=>ne("main",{class:d.value,style:h.value},ie(f.default))}});const be={true:"inset",item:"item-inset","item-thumbnail":"item-thumbnail-inset"},U={xs:2,sm:4,md:8,lg:16,xl:24};var ke=oe({name:"QSeparator",props:{...fe,spaced:[Boolean,String],inset:[Boolean,String],vertical:Boolean,color:String,size:String},setup(t){const f=ue(),p=ye(t,f.proxy.$q),a=g(()=>t.vertical===!0?"vertical":"horizontal"),l=g(()=>` q-separator--${a.value}`),h=g(()=>t.inset!==!1?`${l.value}-${be[t.inset]}`:""),d=g(()=>`q-separator${l.value}${h.value}`+(t.color!==void 0?` bg-${t.color}`:"")+(p.value===!0?" q-separator--dark":"")),n=g(()=>{const u={};if(t.size!==void 0&&(u[t.vertical===!0?"width":"height"]=t.size),t.spaced!==!1){const _=t.spaced===!0?`${U.md}px`:t.spaced in U?`${U[t.spaced]}px`:t.spaced,y=t.vertical===!0?["Left","Right"]:["Top","Bottom"];u[`margin${y[0]}`]=u[`margin${y[1]}`]=_}return u});return()=>ne("hr",{class:d.value,style:n.value,"aria-orientation":a.value})}});const ge={key:0,class:"row no-wrap"},Se={key:1,style:{"font-weight":"500"},class:"q-pt-md"},Ce={key:2,class:"round-times-container"},we={key:3},Re={class:"round-times-container"},Te=V({__name:"StopWatch",props:{heat:{type:Number,required:!0}},setup(t,{expose:f}){const p=t;he(w=>({d901ad46:b.value}));const a=v(null),l=v(!1),h=v(null),d=v("00:00.00"),n=v(new Map),u=v(0),_=g(()=>re()),y=g(()=>n.value.get(u.value)),b=g(()=>_.value.numberOfResultColumns),x=()=>{l.value||(l.value=!0,a.value=new Date,n.value.set(u.value,[]),h.value=setInterval(()=>M(),20))},$=()=>{!l.value||(l.value=!1,h.value&&(clearInterval(h.value),h.value=null))},o=()=>{l.value||(a.value=null,d.value="00:00.00",n.value.clear(),u.value=0)},S=()=>{if(!l.value)return;const w=n.value.get(u.value);w&&w.push(d.value)},M=()=>{if(!a.value)return;const w=new Date,R=new Date(w.getTime()-a.value.getTime()),c=R.getUTCMinutes(),i=R.getUTCSeconds(),k=R.getUTCMilliseconds();d.value=D(c,2)+":"+D(i,2)+"."+D(k,2);const C=R.getTime()/1e3;_.value.autoStart&&C>=_.value.autoStartIntervalInSec&&($(),u.value=u.value+1,x())},D=(w,R)=>{for(var c="",i=0;i<R;i++)c+="0";return(c+w).slice(-R)};return f({stopWatchStart:x,stopWatchEnd:$,stopWatchReset:o,stopWatchRoundTime:S,running:l}),(w,R)=>(e(),W("div",null,[j("div",null,"Heat "+H(p.heat),1),j("div",{class:"full-width row justify-center text-h5",onClick:S,style:{cursor:"pointer"}},H(d.value),1),_.value.showIndividualHeatControlButtons?(e(),W("div",ge,[P(m,{flat:"",round:"",size:"20px",icon:"play_arrow","aria-label":"Start",onClick:x,disable:l.value},null,8,["disable"]),P(m,{flat:"",round:"",size:"20px",icon:"stop","aria-label":"Stop",onClick:$,disable:!l.value},null,8,["disable"]),P(m,{flat:"",round:"",size:"20px",icon:"replay","aria-label":"Reset",onClick:o,disable:l.value},null,8,["disable"])])):s("",!0),y.value&&y.value.length?(e(),W("div",Se,H(l.value?"Swimmer times":"Summary"),1)):s("",!0),l.value||!_.value.autoStart?(e(),W("div",Ce,[(e(!0),W(O,null,N(y.value,(c,i)=>(e(),W("div",{key:c},H(i+1)+" - "+H(c),1))),128))])):(e(),W("div",we,[(e(!0),W(O,null,N(n.value,([c,i])=>(e(),W("div",{key:c},[P(ke,{class:"q-my-xs"}),j("span",null,"Round "+H(c+1)+":",1),j("div",Re,[(e(!0),W(O,null,N(i,(k,C)=>(e(),W("div",{key:k},H(C+1)+" - "+H(k),1))),128))])]))),128))]))]))}});var T=ce(Te,[["__scopeId","data-v-47977e42"]]);const xe=t=>(de("data-v-b70070b8"),t=t(),me(),t),$e={class:"row no-wrap justify-between absolute-full"},qe={class:"column no-wrap justify-between"},Ee={class:"row justify-center",style:{"overflow-y":"auto"}},Ie={key:0,class:"row no-wrap justify-center",style:{height:"96px"}},ze={key:0,class:"column",style:{gap:"10px"}},Be=xe(()=>j("div",{style:{"font-weight":"500"}},"Splits",-1)),Qe=V({__name:"StopWatchContainer",setup(t){const f=v(),p=v(),a=v(),l=v(),h=v(),d=v(),n=v(),u=v(),_=v(),y=v(),b=v([]),x=v(!1),$=g(()=>re()),o=g(()=>$.value.numberOfHeats),S=g(()=>$.value.startTimeInSec),M=()=>{x.value=!0,f.value&&f.value.stopWatchStart(),p.value&&b.value.push(setTimeout(()=>p.value.stopWatchStart(),S.value*1e3)),a.value&&b.value.push(setTimeout(()=>a.value.stopWatchStart(),2*S.value*1e3)),l.value&&b.value.push(setTimeout(()=>l.value.stopWatchStart(),3*S.value*1e3)),h.value&&b.value.push(setTimeout(()=>h.value.stopWatchStart(),4*S.value*1e3)),d.value&&b.value.push(setTimeout(()=>d.value.stopWatchStart(),5*S.value*1e3)),n.value&&b.value.push(setTimeout(()=>n.value.stopWatchStart(),6*S.value*1e3)),u.value&&b.value.push(setTimeout(()=>u.value.stopWatchStart(),7*S.value*1e3)),_.value&&b.value.push(setTimeout(()=>_.value.stopWatchStart(),8*S.value*1e3)),y.value&&b.value.push(setTimeout(()=>y.value.stopWatchStart(),9*S.value*1e3))},D=()=>{var c,i,k,C,q,E,I,z,B,Q;x.value=!1,R(),(c=f.value)==null||c.stopWatchEnd(),(i=p.value)==null||i.stopWatchEnd(),(k=a.value)==null||k.stopWatchEnd(),(C=l.value)==null||C.stopWatchEnd(),(q=h.value)==null||q.stopWatchEnd(),(E=d.value)==null||E.stopWatchEnd(),(I=n.value)==null||I.stopWatchEnd(),(z=u.value)==null||z.stopWatchEnd(),(B=_.value)==null||B.stopWatchEnd(),(Q=y.value)==null||Q.stopWatchEnd()},w=()=>{var c,i,k,C,q,E,I,z,B,Q;D(),(c=f.value)==null||c.stopWatchReset(),(i=p.value)==null||i.stopWatchReset(),(k=a.value)==null||k.stopWatchReset(),(C=l.value)==null||C.stopWatchReset(),(q=h.value)==null||q.stopWatchReset(),(E=d.value)==null||E.stopWatchReset(),(I=n.value)==null||I.stopWatchReset(),(z=u.value)==null||z.stopWatchReset(),(B=_.value)==null||B.stopWatchReset(),(Q=y.value)==null||Q.stopWatchReset()},R=()=>{var c;(c=b.value)==null||c.forEach(i=>{i&&clearTimeout(i)}),b.value=[]};return(c,i)=>{var k,C,q,E,I,z,B,Q,L,K,A,G,J,X,Y,Z,ee,te,ae,le;return e(),W("div",$e,[j("div",qe,[j("div",Ee,[o.value>0?(e(),r(T,{key:0,ref_key:"stopWatch_1",ref:f,heat:1,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>1?(e(),r(T,{key:1,ref_key:"stopWatch_2",ref:p,heat:2,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>2?(e(),r(T,{key:2,ref_key:"stopWatch_3",ref:a,heat:3,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>3?(e(),r(T,{key:3,ref_key:"stopWatch_4",ref:l,heat:4,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>4?(e(),r(T,{key:4,ref_key:"stopWatch_5",ref:h,heat:5,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>5?(e(),r(T,{key:5,ref_key:"stopWatch_6",ref:d,heat:6,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>6?(e(),r(T,{key:6,ref_key:"stopWatch_7",ref:n,heat:7,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>7?(e(),r(T,{key:7,ref_key:"stopWatch_8",ref:u,heat:8,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>8?(e(),r(T,{key:8,ref_key:"stopWatch_9",ref:_,heat:9,class:"q-ma-sm stop-watch"},null,512)):s("",!0),o.value>9?(e(),r(T,{key:9,ref_key:"stopWatch_10",ref:y,heat:10,class:"q-ma-sm stop-watch"},null,512)):s("",!0)]),$.value.showIndividualHeatControlButtons?s("",!0):(e(),W("div",Ie,[P(m,{flat:"",round:"",size:"32px",icon:"play_arrow","aria-label":"Start",onClick:M,disable:x.value},null,8,["disable"]),P(m,{flat:"",round:"",size:"32px",icon:"stop","aria-label":"Stop",onClick:D,disable:!x.value},null,8,["disable"]),P(m,{flat:"",round:"",size:"32px",icon:"replay","aria-label":"Reset",onClick:w,disable:x.value},null,8,["disable"])]))]),$.value.showSidebarSplitButtons?(e(),W("div",ze,[Be,o.value>0?(e(),r(m,{key:0,label:"1",color:"primary",class:"split-button",onClick:(k=f.value)==null?void 0:k.stopWatchRoundTime,disable:!((C=f.value)!=null&&C.running)},null,8,["onClick","disable"])):s("",!0),o.value>1?(e(),r(m,{key:1,label:"2",color:"primary",class:"split-button",onClick:(q=p.value)==null?void 0:q.stopWatchRoundTime,disable:!((E=p.value)!=null&&E.running)},null,8,["onClick","disable"])):s("",!0),o.value>2?(e(),r(m,{key:2,label:"3",color:"primary",class:"split-button",onClick:(I=a.value)==null?void 0:I.stopWatchRoundTime,disable:!((z=a.value)!=null&&z.running)},null,8,["onClick","disable"])):s("",!0),o.value>3?(e(),r(m,{key:3,label:"4",color:"primary",class:"split-button",onClick:(B=l.value)==null?void 0:B.stopWatchRoundTime,disable:!((Q=l.value)!=null&&Q.running)},null,8,["onClick","disable"])):s("",!0),o.value>4?(e(),r(m,{key:4,label:"5",color:"primary",class:"split-button",onClick:(L=h.value)==null?void 0:L.stopWatchRoundTime,disable:!((K=h.value)!=null&&K.running)},null,8,["onClick","disable"])):s("",!0),o.value>5?(e(),r(m,{key:5,label:"6",color:"primary",class:"split-button",onClick:(A=d.value)==null?void 0:A.stopWatchRoundTime,disable:!((G=d.value)!=null&&G.running)},null,8,["onClick","disable"])):s("",!0),o.value>6?(e(),r(m,{key:6,label:"7",color:"primary",class:"split-button",onClick:(J=n.value)==null?void 0:J.stopWatchRoundTime,disable:!((X=n.value)!=null&&X.running)},null,8,["onClick","disable"])):s("",!0),o.value>7?(e(),r(m,{key:7,label:"8",color:"primary",class:"split-button",onClick:(Y=u.value)==null?void 0:Y.stopWatchRoundTime,disable:!((Z=u.value)!=null&&Z.running)},null,8,["onClick","disable"])):s("",!0),o.value>8?(e(),r(m,{key:8,label:"9",color:"primary",class:"split-button",onClick:(ee=_.value)==null?void 0:ee.stopWatchRoundTime,disable:!((te=_.value)!=null&&te.running)},null,8,["onClick","disable"])):s("",!0),o.value>9?(e(),r(m,{key:9,label:"10",color:"primary",class:"split-button",onClick:(ae=y.value)==null?void 0:ae.stopWatchRoundTime,disable:!((le=y.value)!=null&&le.running)},null,8,["onClick","disable"])):s("",!0)])):s("",!0)])}}});var He=ce(Qe,[["__scopeId","data-v-b70070b8"]]);const Me=V({__name:"IndexPage",setup(t){return(f,p)=>(e(),r(We,{class:"row justify-evenly"},{default:_e(()=>[P(He)]),_:1}))}});export{Me as default};
