import{c as ae,h as le,k as h}from"./QBtn.6a1df002.js";import{d as te,e as z,f as se,B as oe,c as F,h as ne,g as ue,L as D,r as u,M as e,_ as j,S as P,$ as N,a0 as l,a1 as ce,a2 as re,N as s,Q as I,O as ie}from"./index.ef30795c.js";import{u as pe}from"./stopWatchModel.5de40875.js";import{_ as ve}from"./plugin-vue_export-helper.21dcd24c.js";var he=ae({name:"QPage",props:{padding:Boolean,styleFn:Function},setup(E,{slots:d}){const{proxy:{$q:r}}=ue(),a=te(se,z);if(a===z)return console.error("QPage needs to be a deep child of QLayout"),z;if(te(oe,z)===z)return console.error("QPage needs to be child of QPageContainer"),z;const i=F(()=>{const o=(a.header.space===!0?a.header.size:0)+(a.footer.space===!0?a.footer.size:0);if(typeof E.styleFn=="function"){const m=a.isContainer.value===!0?a.containerHeight.value:r.screen.height;return E.styleFn(o,m)}return{minHeight:a.isContainer.value===!0?a.containerHeight.value-o+"px":r.screen.height===0?o!==0?`calc(100vh - ${o}px)`:"100vh":r.screen.height-o+"px"}}),p=F(()=>`q-page${E.padding===!0?" q-layout-padding":""}`);return()=>ne("main",{class:p.value,style:i.value},le(d.default))}});const de={class:"full-width row justify-center text-h4"},me={key:0,style:{"font-weight":"500"},class:"q-pt-md"},f=D({__name:"StopWatch",props:{lane:{type:Number,required:!0}},setup(E,{expose:d}){const r=E,a=u(null),c=u(!1),i=u(null),p=u("00:00:00.000"),o=u([]),m=()=>{c.value||(c.value=!0,a.value=new Date,i.value=setInterval(()=>$(),20))},_=()=>{!c.value||(c.value=!1,i.value&&(clearInterval(i.value),i.value=null))},W=()=>{c.value||(a.value=null,p.value="00:00:00.000",o.value=[])},v=()=>{!c.value||o.value.push(p.value)},$=()=>{if(!a.value)return;const t=new Date,n=new Date(t.getTime()-a.value.getTime()),y=n.getUTCHours(),Q=n.getUTCMinutes(),H=n.getUTCSeconds(),L=n.getUTCMilliseconds();p.value=B(y,2)+":"+B(Q,2)+":"+B(H,2)+"."+B(L,3)},B=(t,n)=>{for(var y="",Q=0;Q<n;Q++)y+="0";return(y+t).slice(-n)};return d({stopWatchStart:m,stopWatchEnd:_,stopWatchReset:W,stopWatchRoundTime:v,running:c}),(t,n)=>(e(),j("div",null,[P("div",null,"Lane "+N(r.lane),1),P("div",de,N(p.value),1),o.value.length?(e(),j("div",me," Round times: ")):l("",!0),(e(!0),j(ce,null,re(o.value,y=>(e(),j("div",{key:y},N(y),1))),128))]))}});const fe={class:"row no-wrap absolute-full"},_e={class:"column",style:{gap:"10px"}},We={class:"column no-wrap justify-between"},ye={class:"row justify-center",style:{"overflow-y":"auto"}},ke={class:"row justify-center",style:{height:"96px"}},be=D({__name:"StopWatchContainer",setup(E){const d=u(),r=u(),a=u(),c=u(),i=u(),p=u(),o=u(),m=u(),_=u(),W=u(),v=u([]),$=u(!1),B=F(()=>pe()),t=F(()=>B.value.numberOfLanes),n=F(()=>B.value.timeInSecBetweenSwimmer),y=()=>{$.value=!0,d.value&&d.value.stopWatchStart(),r.value&&v.value.push(setTimeout(()=>r.value.stopWatchStart(),n.value*1e3)),a.value&&v.value.push(setTimeout(()=>a.value.stopWatchStart(),2*n.value*1e3)),c.value&&v.value.push(setTimeout(()=>c.value.stopWatchStart(),3*n.value*1e3)),i.value&&v.value.push(setTimeout(()=>i.value.stopWatchStart(),4*n.value*1e3)),p.value&&v.value.push(setTimeout(()=>p.value.stopWatchStart(),5*n.value*1e3)),o.value&&v.value.push(setTimeout(()=>o.value.stopWatchStart(),6*n.value*1e3)),m.value&&v.value.push(setTimeout(()=>m.value.stopWatchStart(),7*n.value*1e3)),_.value&&v.value.push(setTimeout(()=>_.value.stopWatchStart(),8*n.value*1e3)),W.value&&v.value.push(setTimeout(()=>W.value.stopWatchStart(),9*n.value*1e3))},Q=()=>{var k,b,g,S,C,T,w,R,x,q;$.value=!1,L(),(k=d.value)==null||k.stopWatchEnd(),(b=r.value)==null||b.stopWatchEnd(),(g=a.value)==null||g.stopWatchEnd(),(S=c.value)==null||S.stopWatchEnd(),(C=i.value)==null||C.stopWatchEnd(),(T=p.value)==null||T.stopWatchEnd(),(w=o.value)==null||w.stopWatchEnd(),(R=m.value)==null||R.stopWatchEnd(),(x=_.value)==null||x.stopWatchEnd(),(q=W.value)==null||q.stopWatchEnd()},H=()=>{var k,b,g,S,C,T,w,R,x,q;Q(),(k=d.value)==null||k.stopWatchReset(),(b=r.value)==null||b.stopWatchReset(),(g=a.value)==null||g.stopWatchReset(),(S=c.value)==null||S.stopWatchReset(),(C=i.value)==null||C.stopWatchReset(),(T=p.value)==null||T.stopWatchReset(),(w=o.value)==null||w.stopWatchReset(),(R=m.value)==null||R.stopWatchReset(),(x=_.value)==null||x.stopWatchReset(),(q=W.value)==null||q.stopWatchReset()},L=()=>{var k;(k=v.value)==null||k.forEach(b=>{b&&clearTimeout(b)}),v.value=[]};return(k,b)=>{var g,S,C,T,w,R,x,q,M,O,U,V,K,A,G,J,X,Y,Z,ee;return e(),j("div",fe,[P("div",_e,[t.value>0?(e(),s(h,{key:0,label:"Split 1",color:"primary",class:"split-button",onClick:(g=d.value)==null?void 0:g.stopWatchRoundTime,disable:!((S=d.value)!=null&&S.running)},null,8,["onClick","disable"])):l("",!0),t.value>1?(e(),s(h,{key:1,label:"Split 2",color:"primary",class:"split-button",onClick:(C=r.value)==null?void 0:C.stopWatchRoundTime,disable:!((T=r.value)!=null&&T.running)},null,8,["onClick","disable"])):l("",!0),t.value>2?(e(),s(h,{key:2,label:"Split 3",color:"primary",class:"split-button",onClick:(w=a.value)==null?void 0:w.stopWatchRoundTime,disable:!((R=a.value)!=null&&R.running)},null,8,["onClick","disable"])):l("",!0),t.value>3?(e(),s(h,{key:3,label:"Split 4",color:"primary",class:"split-button",onClick:(x=c.value)==null?void 0:x.stopWatchRoundTime,disable:!((q=c.value)!=null&&q.running)},null,8,["onClick","disable"])):l("",!0),t.value>4?(e(),s(h,{key:4,label:"Split 5",color:"primary",class:"split-button",onClick:(M=i.value)==null?void 0:M.stopWatchRoundTime,disable:!((O=i.value)!=null&&O.running)},null,8,["onClick","disable"])):l("",!0),t.value>5?(e(),s(h,{key:5,label:"Split 6",color:"primary",class:"split-button",onClick:(U=p.value)==null?void 0:U.stopWatchRoundTime,disable:!((V=p.value)!=null&&V.running)},null,8,["onClick","disable"])):l("",!0),t.value>6?(e(),s(h,{key:6,label:"Split 7",color:"primary",class:"split-button",onClick:(K=o.value)==null?void 0:K.stopWatchRoundTime,disable:!((A=o.value)!=null&&A.running)},null,8,["onClick","disable"])):l("",!0),t.value>7?(e(),s(h,{key:7,label:"Split 8",color:"primary",class:"split-button",onClick:(G=m.value)==null?void 0:G.stopWatchRoundTime,disable:!((J=m.value)!=null&&J.running)},null,8,["onClick","disable"])):l("",!0),t.value>8?(e(),s(h,{key:8,label:"Split 9",color:"primary",class:"split-button",onClick:(X=_.value)==null?void 0:X.stopWatchRoundTime,disable:!((Y=_.value)!=null&&Y.running)},null,8,["onClick","disable"])):l("",!0),t.value>9?(e(),s(h,{key:9,label:"Split 10",color:"primary",class:"split-button",onClick:(Z=W.value)==null?void 0:Z.stopWatchRoundTime,disable:!((ee=W.value)!=null&&ee.running)},null,8,["onClick","disable"])):l("",!0)]),P("div",We,[P("div",ye,[t.value>0?(e(),s(f,{key:0,ref_key:"stopWatch_1",ref:d,lane:1,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>1?(e(),s(f,{key:1,ref_key:"stopWatch_2",ref:r,lane:2,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>2?(e(),s(f,{key:2,ref_key:"stopWatch_3",ref:a,lane:3,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>3?(e(),s(f,{key:3,ref_key:"stopWatch_4",ref:c,lane:4,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>4?(e(),s(f,{key:4,ref_key:"stopWatch_5",ref:i,lane:5,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>5?(e(),s(f,{key:5,ref_key:"stopWatch_6",ref:p,lane:6,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>6?(e(),s(f,{key:6,ref_key:"stopWatch_7",ref:o,lane:7,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>7?(e(),s(f,{key:7,ref_key:"stopWatch_8",ref:m,lane:8,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>8?(e(),s(f,{key:8,ref_key:"stopWatch_9",ref:_,lane:9,class:"q-ma-sm stop-watch"},null,512)):l("",!0),t.value>9?(e(),s(f,{key:9,ref_key:"stopWatch_10",ref:W,lane:10,class:"q-ma-sm stop-watch"},null,512)):l("",!0)]),P("div",ke,[I(h,{flat:"",round:"",size:"32px",icon:"play_arrow","aria-label":"Start",onClick:y,disable:$.value},null,8,["disable"]),I(h,{flat:"",round:"",size:"32px",icon:"stop","aria-label":"Stop",onClick:Q,disable:!$.value},null,8,["disable"]),I(h,{flat:"",round:"",size:"32px",icon:"replay","aria-label":"Reset",onClick:H,disable:$.value},null,8,["disable"])])])])}}});var ge=ve(be,[["__scopeId","data-v-2b9074d0"]]);const Re=D({__name:"IndexPage",setup(E){return(d,r)=>(e(),s(he,{class:"row justify-evenly"},{default:ie(()=>[I(ge)]),_:1}))}});export{Re as default};
