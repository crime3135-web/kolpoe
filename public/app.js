const $=s=>document.querySelector(s),app=$('#app');
const R={RUB:1,USDT:.011,EUR:.0095,UAH:.45,KZT:5.3,TON:.0037,BTC:1.1e-7,ETH:3.7e-6,LTC:1.2e-4,SOL:7.3e-5,STARS:.85},
S={RUB:'₽',USDT:'USDT',EUR:'€',UAH:'₴',KZT:'₸',TON:'TON',BTC:'BTC',ETH:'ETH',LTC:'LTC',SOL:'SOL',STARS:'⭐'},
D={BTC:8,ETH:6,LTC:5,SOL:4,TON:3,STARS:0},
CN={RUB:'Российский рубль',USDT:'Tether (доллар в крипте)',EUR:'Евро',UAH:'Гривна',KZT:'Тенге',TON:'Toncoin (Gram)',BTC:'Bitcoin',ETH:'Ethereum',LTC:'Litecoin',SOL:'Solana',STARS:'Telegram Stars'};
const nf=(v,k)=>v.toLocaleString('ru',{maximumFractionDigits:D[k]??2});
const ST={wait:['Ожидает оплаты','w'],paid:['Оплачена','p'],handed:['Товар передан','p'],done:['Успешно','o'],cancel:['Отменена','x']};
let db={users:{},deals:{},pay:[],wd:[],me:null},SK=null;try{localStorage.setItem('t',1);SK=localStorage}catch(e){try{sessionStorage.setItem('t',1);SK=sessionStorage}catch(e){}}
try{Object.assign(db,JSON.parse(SK.getItem('cd'))||{},{users:{},deals:{},pay:[],wd:[],me:null})}catch(e){}
const save=()=>{try{SK.setItem('cd',JSON.stringify({theme:db.theme,lang:db.lang}))}catch(e){}};
const TOK='cdtok';
function sync(s){db.me=s.me;db.users=s.users;db.deals=s.deals;db.pay=s.pay;db.wd=s.wd}
async function api(a,b,q){try{const r=await fetch((window.API_BASE||'')+'/api/'+a,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(localStorage.getItem(TOK)||'')},body:JSON.stringify(b||{})}),j=await r.json();
if(j.token)localStorage.setItem(TOK,j.token);if(j.state)sync(j.state);
if(j.err){if(j.err=='auth'){localStorage.removeItem(TOK);db.me=null}else if(!q)toast(j.err);return null}return j}catch(e){if(!q)toast('Нет связи с сервером');return null}}
const sup=t=>'https://t.me/CrystalOTCHelp?text='+encodeURIComponent(t+'. Ник: '+db.me);
let H0=innerHeight;addEventListener('resize',()=>{H0=Math.max(H0,innerHeight);document.body.classList.toggle('kb',innerHeight<H0*.8)});
document.addEventListener('focusin',e=>{if(e.target.matches('input:not([type=radio]):not([type=file]),textarea'))setTimeout(()=>e.target.scrollIntoView({block:'center',behavior:'smooth'}),300)});
document.addEventListener('click',e=>{if(e.target.closest('.btn,.chip,#tb a,.sw'))navigator.vibrate&&navigator.vibrate(8)});
function logout(){api('logout',{},1);localStorage.removeItem(TOK);db.me=null;db.users={};db.deals={};db.pay=[];db.wd=[];toast('Вы вышли из аккаунта');const t='#/auth/reg';location.hash==t?go():location.hash=t}
const L=()=>db.lang||'ru',T=(r,e)=>L()=='en'?e:r;
const mg=u=>u;
const me=()=>mg(db.users[db.me]);
const bal=u=>Object.entries(u.w).reduce((s,[k,v])=>s+v/R[k],0);
function spend(u,x){for(const k of [u.cur,...Object.keys(R)]){if(x<=1e-9)break;const t=Math.min(u.w[k]/R[k],x);u.w[k]-=t*R[k];x-=t}}
function setLang(l){db.lang=l;save();document.documentElement.lang=l;go()}
function langSheet(){SL.lg={opts:[['ru','🇷🇺 Русский'],['en','🇬🇧 English']],v:L(),fn:setLang,t:T('Язык','Language')};osl('lg')}
let ret='';const SL={};
function ds(id,opts,v,fn,t){SL[id]={opts,v,fn,t};const o=opts.find(x=>x[0]==v)||opts[0];return `<button type="button" class="ds" id="${id}" onclick="osl('${id}')"><span>${o[1]}</span>${ic('down')}</button>`}
function osl(id){const c=SL[id],o=document.createElement('div');o.className='ov';o.onclick=e=>{if(e.target==o)o.remove()};
o.innerHTML=`<div class="sh"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h2>${c.t||''}</h2><button class="chip" onclick="this.closest('.ov').remove()" aria-label="Закрыть">✕</button></div>${c.opts.map(([k,l,sub])=>`<button class="opt ${k==c.v?'on':''}" onclick="pks('${id}','${k}',this)"><span class="ol">${l}${sub?`<small>${sub}</small>`:''}</span>${k==c.v?ic('check'):''}</button>`).join('')}</div>`;document.body.appendChild(o)}
function pks(id,k,b){const c=SL[id],o=c.opts.find(x=>x[0]==k);c.v=k;b.closest('.ov').remove();const e=$('#'+id);if(e&&e.firstElementChild)e.firstElementChild.innerHTML=o[1];c.fn(k)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,c)=>nf(v*R[c],c)+' '+S[c];
const h=s=>{let x=7;for(const c of s)x=(x*31+c.charCodeAt(0))>>>0;return x.toString(36)};
const IC={home:'M3 11l9-8 9 8M5 10v10h14V10',plus:'M12 5v14M5 12h14',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',user:'M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8',gear:'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',login:'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',card:'M2 5h20v14H2zM2 10h20',stars:'M12 2l3 7 7 .6-5.3 4.7 1.6 7.2-6.3-3.7-6.3 3.7 1.6-7.2L2 9.6 9 9z',crypto:'M3 7h16a2 2 0 012 2v10H5a2 2 0 01-2-2zM3 7V5a2 2 0 012-2h12M16 14h2',back:'M15 18l-6-6 6-6',down:'M6 9l6 6 6-6',send:'M22 2L11 13M22 2l-7 20-4-9-9-4z',out:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',trash:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',check:'M20 6L9 17l-5-5',clock:'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18',all:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'};
const ic=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="${IC[n]}"/></svg>`;
document.documentElement.dataset.theme=db.theme||'crystal';
const reqs=u=>u.reqs=u.reqs||[];
const RL={stars:'Telegram Stars',crypto:'Крипто',card:'Карта'};
const flg=r=>r.cc&&CT[r.cc]?CT[r.cc][0]+' ':'';
const rdet=r=>r.t=='stars'?r.a:r.t=='card'?(r.sbp?`СБП +${r.a} · ${r.b}`:flg(r)+'•••• '+r.a.slice(-4)):`${r.a} · ${r.b} · ${r.c.slice(0,6)}…${r.c.slice(-4)}`;
const rtxt=r=>r.t=='stars'?'Stars · '+r.a:r.t=='crypto'?`${r.a} · ${r.b} · ${r.c}`:r.sbp?`СБП +${r.a} · ${r.b}`:flg(r)+'Карта · '+r.a.replace(/(\d{4})(?=\d)/g,'$1 ');
const rmask=r=>r.t=='card'?(r.sbp?rdet(r):flg(r)+'Карта · •••• '+r.a.slice(-4)):rtxt(r);
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2400)}
const val=id=>$('#'+id).value.trim();

function nav(){const r=(location.hash||'#/').slice(2).split('/'),p=r[0],key=({d:'deals',reqs:'profile',settings:'profile',wd:'profile',topup:'profile',auth:'auth/'+(r[1]||mode)}[p])||p;
const tabs=db.me?[['','home',T('Главная','Home')],['new','plus',T('Создать','Create')],['deals','list',T('Сделки','Deals')],['fx','crypto',T('Обмен','Exchange')],['profile','user',T('Профиль','Profile')]]:[['','home',T('Главная','Home')],['auth/reg','plus',T('Регистрация','Sign up')],['auth/in','login',T('Вход','Log in')]];
$('#tl').innerHTML=tabs.map(([k,i,t])=>`<a href="#/${k}" class="${k==key?'on':''}">${ic(i)}<span>${t}</span></a>`).join('');
const hb=$('#hb');hb.style.display=db.me?'':'none';hb.innerHTML=ic('user')+' '+esc(db.me||'');$('#lg').textContent=L().toUpperCase();
requestAnimationFrame(()=>{const a=$('#tl .on'),n=$('#ind');if(!a){n.style.opacity=0;return}n.style.opacity=1;n.style.width=a.offsetWidth+'px';n.style.height=a.offsetHeight+'px';n.style.transform=`translate(${a.offsetLeft}px,${a.offsetTop}px)`})}
function go(){nav();const r=(location.hash||'#/').slice(2).split('/'),p=r[0];
if(['new','deals','profile','settings','reqs','wd','fx','topup'].includes(p)&&!db.me)return location.hash='#/auth/in';
document.body.classList.remove('chat','kb');if(!['reqs','auth','new'].includes(p))ret='';app.style.animation='none';app.offsetHeight;app.style.animation='';
({'':home,auth,new:newDeal,deals,profile,settings,topup:topPage,reqs:reqPage,wd:wdPage,fx:fxPage,d:deal}[p]||home)(r[1]);window.scrollTo(0,0)}
const qk=()=>`<div class="grid" style="margin-bottom:16px">${[['new','plus','Создать сделку'],['deals','list','Мои сделки'],['reqs','card','Реквизиты'],['profile','user','Профиль']].map(([h,i,t])=>`<a class="st qa" href="#/${h}">${ic(i)}<b style="font-size:15px">${t}</b></a>`).join('')}</div><div class="card"><label style="margin-top:0">Открыть сделку по номеру</label><div class="row" style="flex-wrap:nowrap"><input id="dn" placeholder="Номер сделки" autocapitalize="characters"><button class="btn" style="margin:0;width:auto" onclick="location.hash='#/d/'+val('dn').replace('#','').toUpperCase()">Открыть</button></div></div>`;

function home(){const st=[['plus',T('Создаёте сделку','Create a deal'),T('Продавец указывает товар, сумму и реквизиты и получает ссылку.','The seller sets item, price and payout details and gets a link.')],['user',T('Заходит покупатель','The buyer joins'),T('Открывает ссылку, и вы сразу попадаете в общий чат сделки.','Opens the link and you both land in the deal chat.')],['crypto',T('Оплата замораживается','Funds are frozen'),T('Покупатель платит с баланса, деньги хранятся у Crystal до конца сделки.','The buyer pays from balance; Crystal holds the money until the end.')],['stars',T('Передача товара','Item handover'),T('Продавец передаёт товар и присылает скриншот в чат.','The seller hands over the item and sends a screenshot in chat.')],['check',T('Подтверждение','Confirmation'),T('Покупатель подтверждает, и деньги уходят продавцу. Споры решает поддержка.','The buyer confirms and the seller gets paid. Disputes go to support.')]];
app.innerHTML=`<section class="hero"><svg class="fl" viewBox="0 0 100 100" width="76"><polygon points="50,4 82,34 50,50 18,34" fill="var(--ac)"/><polygon points="18,34 50,50 50,96" fill="var(--ac2)"/><polygon points="82,34 50,50 50,96" fill="var(--ac2)" opacity=".7"/></svg><h1>${T('Безопасные сделки с NFT и цифровыми товарами','Safe deals for NFTs and digital goods')}</h1><p>${T('Crystal Deals держит деньги покупателя, пока он не получит товар. Работаем с 2025 года.','Crystal Deals holds the buyer’s money until the item is received. Since 2025.')}</p>
${db.me?'':`<a class="btn" href="#/auth/reg">${T('Зарегистрироваться','Sign up')}</a> `}<a class="btn g" href="https://t.me/TheCrystalPost" target="_blank" rel="noopener">${T('Канал в Telegram','Telegram channel')}</a></section>${db.me?qk():`<a class="btn g" href="#/auth/in" style="margin-bottom:16px">${T('Уже есть аккаунт? Войти','Have an account? Log in')}</a>`}
<div class="card"><h3>${T('Как это работает','How it works')}</h3><ol class="steps" style="margin-top:16px">${st.map(([i,a,b],n)=>`<li><span class="ri">${ic(i)}</span><span><b>${n+1}. ${a}</b><br><span class="mu">${b}</span></span></li>`).join('')}</ol></div>
<div class="card"><h3>${T('Контакты','Contacts')}</h3><p class="mu"><a href="https://t.me/TheCrystalPost" target="_blank" rel="noopener">t.me/TheCrystalPost</a><br><a href="https://t.me/CrystalOTCHelp" target="_blank" rel="noopener">@CrystalOTCHelp</a></p></div>`}
let mode='reg';
function auth(m){if(m)mode=m;
if(db.me){app.innerHTML=`<div class="card"><h2>${T('Вы вошли как','Signed in as')} ${esc(db.me)}</h2><p class="mu">${T('Чтобы зарегистрировать другой аккаунт, сначала выйдите.','Log out first to use another account.')}</p><button class="btn" onclick="logout()">${ic('out')} ${T('Выйти','Log out')}</button></div>`;return}
app.innerHTML=`<div class="card" style="max-width:420px;margin:12px auto"><div class="seg" style="margin-bottom:12px"><button class="${L()=='ru'?'on':''}" onclick="setLang('ru')">🇷🇺 Русский</button><button class="${L()=='en'?'on':''}" onclick="setLang('en')">🇬🇧 English</button></div><div class="seg"><a href="#/auth/reg" class="${mode=='reg'?'on':''}">${T('Регистрация','Sign up')}</a><a href="#/auth/in" class="${mode=='in'?'on':''}">${T('Вход','Log in')}</a></div><h2 style="margin-top:18px">${mode=='reg'?T('Создайте аккаунт','Create account'):T('С возвращением','Welcome back')}</h2>
<label>${T('Ник','Nickname')}</label><input id="u" autocomplete="username" autocapitalize="none" maxlength="20"><label>${T('Пароль','Password')}</label><input id="pw" type="password" autocomplete="${mode=='reg'?'new-password':'current-password'}">
<button class="btn" onclick="doAuth()">${mode=='reg'?T('Зарегистрироваться','Sign up'):T('Войти','Log in')}</button></div>`}
async function doAuth(){const u=val('u'),p=$('#pw').value;if(u.length<3||p.length<6)return toast('Ник от 3 символов, пароль от 6');
const j=await api(mode=='reg'?'register':'login',{nick:u,pass:p});if(!j)return;toast('Добро пожаловать, '+u);const g=ret;ret='';location.hash=g||'#/profile'}
let pick=null;
function newDeal(){pick=reqs(me()).find(r=>r.main)||reqs(me())[0]||null;const c=me().cur;app.innerHTML=`<div class="card"><h2>Новая сделка</h2>
<label>Тип товара</label>${ds('t',[['NFT','NFT'],['Аккаунт','Аккаунт'],['Разное','Разное']],'NFT',()=>{},'Тип товара')}
<label>Сумма (${S[c]})</label><input id="a" type="number" min="1" step="any" inputmode="decimal">
<label>Реквизиты для получения оплаты</label><div id="rqb"></div>
<label>Ссылка на товар</label><input id="lk" placeholder="https://...">
<button class="btn" onclick="mk()">Создать сделку</button></div><div id="res"></div>`;rqb()}
function rqb(open){const l=reqs(me());$('#rqb').innerHTML=!l.length?`<button class="btn" style="margin-top:0" onclick="ret='#/new';location.hash='#/reqs'">${ic('plus')} Привязать реквизиты</button>`
:`${pick?`<div class="box row">${ic(pick.t)}<span>${esc(rmask(pick))}</span></div>`:''}<button class="btn g" onclick="rqb(1)">${ic(pick?'list':'plus')} ${pick?'Выбрать другие':'Добавить реквизиты'}</button>${open?`<div style="margin-top:10px">${l.map(r=>`<button class="deal" style="width:100%;background:none;border:0;border-top:1px solid var(--line);color:inherit;font:inherit;cursor:pointer;text-align:left" onclick="pk('${r.id}')"><span class="row">${ic(r.t)} ${esc(rmask(r))}</span></button>`).join('')}</div>`:''}`}
function pk(id){pick=reqs(me()).find(r=>r.id==id);rqb()}
async function mk(){const a=parseFloat(val('a')),lk=val('lk');if(!pick)return toast('Добавьте реквизиты');if(!(a>0)||!/\S+\.\S+/.test(lk))return toast('Укажите сумму и ссылку на товар (https://...)');
const j=await api('deal.create',{type:SL.t.v,amt:a/R[me().cur],rq:rtxt(pick),lk});if(!j)return;
const id=j.id;
const url=location.href.split('#')[0]+'#/d/'+id;
$('#res').innerHTML=`<div class="card"><h3>Сделка создана</h3><p class="mu">Отправьте эту ссылку покупателю:</p><div class="box" id="url">${esc(url)}</div><div class="row"><button class="btn" onclick="navigator.clipboard.writeText($('#url').textContent).then(()=>toast('Ссылка скопирована'))">${ic('list')} Копировать</button><a class="btn g" href="#/d/${id}">Открыть сделку</a></div></div>`}

let fl='all';
function deals(){const c=me().cur,l=Object.values(db.deals).filter(d=>(d.seller==db.me||d.buyer==db.me)&&(fl=='all'||(fl=='wait'?['wait','paid'].includes(d.st):d.st==fl))).sort((a,b)=>b.t-a.t);
const F=[['all','Все','all'],['wait','Ожидание','clock'],['done','Успешные','check']];
app.innerHTML=`<div class="card"><h2>Мои сделки</h2><div class="row" style="margin:12px 0 4px">${F.map(([k,t,i])=>`<button class="chip ${k==fl?'on':''}" onclick="fl='${k}';deals()">${ic(i)} ${t}</button>`).join('')}</div>${l.length?l.map(d=>`<a class="deal" href="#/d/${d.id}"><div><b>${esc(d.type)} · #${d.id}</b><div class="mu">${d.seller==db.me?'Вы продаёте':'Вы покупаете'}</div></div><div style="text-align:right"><b>${fmt(d.amt,c)}</b><br><span class="tag ${ST[d.st][1]}">${ST[d.st][0]}</span></div></a>`).join(''):'<p class="mu">Здесь пусто. Создайте сделку или смените фильтр.</p><a class="btn" href="#/new">Создать сделку</a>'}</div>`}

const NT={created:d=>T(`Сделка #${d.id} создана. Отправьте ссылку покупателю.`,`Deal #${d.id} created. Send the link to the buyer.`),
join_s:d=>T(`Покупатель ${d.buyer} присоединился к сделке #${d.id}.`,`Buyer ${d.buyer} joined deal #${d.id}.`),
join_b:d=>T(`Вы присоединились к сделке #${d.id}. Продавец: ${d.seller}. Оплатите сделку кнопкой сверху.`,`You joined deal #${d.id}. Seller: ${d.seller}. Pay with the button above.`),
paid_b:d=>T(`Вы успешно оплатили сделку #${d.id}. Ожидайте передачи товара от продавца.`,`You paid deal #${d.id}. Wait for the seller to hand over the item.`),
paid_s:d=>T(`Покупатель оплатил сделку #${d.id}. Пожалуйста, следуйте правилам нашего проекта.`,`The buyer paid deal #${d.id}. Please follow our project rules.`),
shot_s:d=>T('Скриншот отправлен покупателю. Ожидайте подтверждения.','Screenshot sent to the buyer. Wait for confirmation.'),
shot_b:d=>T('Продавец передал товар и прислал скриншот. Проверьте его и подтвердите получение.','The seller handed over the item and sent a screenshot. Check it and confirm.'),
done:d=>T(`Покупатель ${d.buyer} подтвердил успешное выполнение заказа #${d.id} и отправил деньги продавцу ${d.seller}.`,`Buyer ${d.buyer} confirmed order #${d.id} and sent the money to seller ${d.seller}.`),
done_b:d=>T(`Сделка #${d.id} закрыта, средства отправлены продавцу.`,`Deal #${d.id} is closed, funds were sent to the seller.`),
done_s:d=>T(`Сделка #${d.id} закрыта, средства зачислены на ваш баланс.`,`Deal #${d.id} is closed, funds were added to your balance.`),
refund:d=>T(`Сделка #${d.id} отменена менеджером, средства возвращены покупателю.`,`Deal #${d.id} was cancelled by a manager, the buyer was refunded.`),
cancel:d=>T(`Сделка #${d.id} отменена продавцом.`,`Deal #${d.id} was cancelled by the seller.`)};
const sys=(d,to,x)=>(d.m=d.m||[]).push({k:'s',to,t:Date.now(),x});
let CUR='';const cd=()=>db.deals[CUR];
const dd=t=>new Date(t).toLocaleDateString('ru',{day:'2-digit',month:'2-digit',year:'2-digit'});
async function deal(id){const u=me();
if(!u){ret=location.hash;app.innerHTML=`<div class="card"><h2>${T('Сделка','Deal')} #${esc(id)}</h2><p class="mu">${T('Войдите или зарегистрируйтесь, чтобы открыть сделку.','Log in or sign up to open the deal.')}</p><a class="btn" href="#/auth/in">${T('Войти','Log in')}</a><a class="btn g" href="#/auth/reg">${T('Регистрация','Sign up')}</a></div>`;return}
const j=await api('deal.open',{id}),d=db.deals[id];
if(!j||!d){app.innerHTML=`<div class="card"><h2>${T('Сделка не найдена','Deal not found')}</h2><p class="mu">${T('Проверьте ссылку или номер сделки.','Check the link or deal ID.')}</p></div>`;return}
CUR=id;document.body.classList.add('chat');
app.innerHTML=`<div class="cw"><div class="ct"><button class="chip" onclick="location.hash='#/deals'" aria-label="Назад">${ic('back')}</button><h3>${esc(d.type)} · #${d.id}</h3><span class="tag ${ST[d.st][1]}">${ST[d.st][0]}</span></div><div class="ab" id="ab"></div><div id="msgs"></div>
<div class="cb"><label class="chip" style="margin:0;cursor:pointer" aria-label="Фото">${ic('plus')}<input type="file" accept="image/*" hidden onchange="att(this)"></label><input id="mt" placeholder="${T('Сообщение…','Message…')}" autocomplete="off" onkeydown="if(event.key=='Enter')send()"><button class="btn" aria-label="Send" onclick="send()">${ic('send')}</button></div><input type="file" accept="image/*" id="shot" hidden onchange="att(this,1)"></div>`;msgs()}
function msgs(){const d=cd();if(!d||!$('#msgs'))return;const sel=db.me==d.seller;
$('#msgs').innerHTML=(d.m||[]).filter(m=>m.k=='m'||m.to=='all'||m.to==(sel?'seller':'buyer')).map(m=>m.k=='s'?`<div class="sy"><b>${ic('stars')} Crystal ${T('уведомление','notification')} ${dd(m.t)}</b>${esc(NT[m.x](d))}</div>`:`<div class="mb ${m.f==db.me?'me':''}">${m.i?`<img alt="" src="${m.i}">`:''}${esc(m.x||'')}<small>${esc(m.f)} · ${new Date(m.t).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join('');
$('#msgs').scrollTop=1e9;acts()}
function acts(){const d=cd(),sel=db.me==d.seller,B=(f,t,c)=>`<button class="btn ${c||'g'}" onclick="${f}">${t}</button>`,A=(h,t)=>`<a class="btn g" href="${h}" target="_blank" rel="noopener">${t}</a>`;
let h=B('info()',ic('list')+' '+T('Информация','Info'));
if(sel&&d.st=='wait')h+=A('https://t.me/share/url?url='+encodeURIComponent(location.href.split('#')[0]+'#/d/'+d.id),ic('out')+' Telegram')+B('cnl()',T('Отменить','Cancel'),'r');
if(!sel&&d.st=='wait')h+=B('pay()',T('Оплатить ','Pay ')+fmt(d.amt,me().cur),'');
if(sel&&d.st=='paid')h+=A(sup('Передача товара по сделке #'+d.id),T('Передать товар','Hand over item'))+B("$('#shot').click()",T('Подтвердить передачу','Confirm handover'),'');
if(!sel&&d.st=='handed')h+=B('fin()',T('Подтвердить получение','Confirm receipt'),'');
if(!sel&&(d.st=='paid'||d.st=='handed'))h+=A(sup('Спор по сделке #'+d.id),T('Открыть спор','Dispute'));
$('#ab').innerHTML=h}
function info(){const d=cd(),c=me().cur,sel=db.me==d.seller,ok=/^https?:\/\//.test(d.lk),
X=[[T('Товар','Item'),ok?`<a href="${esc(d.lk)}" target="_blank" rel="noopener noreferrer">${esc(d.lk)}</a>`:esc(d.lk)],[T('Номер сделки','Deal ID'),'#'+d.id],[T('Тип','Type'),esc(d.type)],[T('Продавец','Seller'),esc(d.seller)],[T('Покупатель','Buyer'),esc(d.buyer||'—')],[T('Ваша роль','Your role'),sel?T('Продавец','Seller'):T('Покупатель','Buyer')],[T('Статус','Status'),ST[d.st][0]],[T('Создана','Created'),new Date(d.t).toLocaleString('ru')]];
const o=document.createElement('div');o.className='ov';o.onclick=e=>{if(e.target==o)o.remove()};
o.innerHTML=`<div class="sh"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><h2>${T('Информация о сделке','Deal info')}</h2><button class="chip" onclick="this.closest('.ov').remove()" aria-label="Закрыть">✕</button></div><div class="bal" style="margin:10px 0 6px">${fmt(d.amt,c)}</div>${X.map(([k,v])=>`<div class="ir"><span>${k}</span><span>${v}</span></div>`).join('')}</div>`;document.body.appendChild(o)}
async function send(){const t=val('mt');if(!t)return;$('#mt').value='';await api('deal.send',{id:CUR,x:t});msgs()}
function att(i,shot){const f=i.files[0];if(!f)return;const im=new Image();im.onload=async()=>{const c=document.createElement('canvas'),k=Math.min(1,720/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);const img=c.toDataURL('image/jpeg',.7);
if(shot){if(await api('deal.shot',{id:CUR,i:img}))deal(CUR)}else{await api('deal.send',{id:CUR,i:img});msgs()}};im.src=URL.createObjectURL(f);i.value=''}
async function pay(){if(await api('deal.pay',{id:CUR}))deal(CUR)}
async function fin(){if(await api('deal.fin',{id:CUR}))deal(CUR)}
async function cnl(){if(await api('deal.cancel',{id:CUR}))deal(CUR)}
function wdPage(){const u=me(),l=reqs(u),W=(db.wd||[]).filter(x=>x.u==u.nick).reverse();
app.innerHTML=`<div class="card"><h2>${T('Заявка на вывод','Withdrawal request')}</h2>${!l.length?`<div class="box">${T('Добавьте реквизиты, чтобы вывести средства.','Add payout details first.')}</div><a class="btn" href="#/reqs">${ic('plus')} ${T('Добавить реквизиты','Add details')}</a>`:`<label>${T('Куда вывести','Payout to')}</label>${l.map(r=>`<label class="rq" style="cursor:pointer"><input type="radio" name="wr" value="${r.id}" ${r.main?'checked':''} style="width:auto;min-height:0"><span class="ri">${ic(r.t)}</span><span style="flex:1;word-break:break-all">${esc(rdet(r))}</span></label>`).join('')}
<label>${T('Сумма','Amount')} (${S[u.cur]}) · ${T('доступно','available')} ${fmt(bal(u),u.cur)}</label><input id="wa" type="number" inputmode="decimal" min="1" step="any"><button class="btn" onclick="wd()">${T('Отправить заявку','Submit request')}</button>
<p class="mu" style="font-size:13px">${T('Вывод будет обработан, обычно это занимает до 24 часов.','Withdrawals are processed, usually within 24 hours.')}</p>`}</div>
<div class="card"><h3>${T('Мои заявки','My requests')}</h3>${W.map(x=>`<div class="deal"><div><b>#${x.id}</b><div class="mu">${esc(x.rq)}</div></div><div style="text-align:right"><b>${fmt(x.amt,u.cur)}</b><br><span class="tag w">${T('В обработке','Processing')}</span></div></div>`).join('')||`<p class="mu">${T('Заявок пока нет.','No requests yet.')}</p>`}</div>`}
async function wd(){const u=me(),a=parseFloat(val('wa')),rid=(document.querySelector('input[name=wr]:checked')||{}).value;if(!rid||!(a>0))return toast(T('Выберите реквизиты и сумму','Choose details and amount'));if(await api('wd',{rid,amt:a/R[u.cur]})){toast(T('Заявка отправлена, обработка до 24 часов','Request sent, up to 24 hours'));wdPage()}}
const TONW='UQC9Z52pCtofOwqvCA3F9vr3D98b6mqV8gJlSQgIht87FoGm';
function cpf(t){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast(T('Скопировано','Copied'))}catch(e){}a.remove()}
function cp(t){try{navigator.clipboard.writeText(t).then(()=>toast(T('Скопировано','Copied')),()=>cpf(t))}catch(e){cpf(t)}}
function tav(){const a=parseFloat(val('ta'))||0;$('#tq').textContent='≈ '+fmt(a/R.TON,me().cur)}
async function mkPay(){const a=parseFloat(val('ta'));if(!(a>=0.5))return toast(T('Минимум 0.5 TON','Minimum 0.5 TON'));if(await api('pay.create',{amt:a}))topPage()}
async function cancelPay(){await api('pay.cancel');topPage()}
async function chkPay(){const m=$('#pm');m.innerHTML=`<p class="mu">${T('Проверяем…','Checking…')}</p>`;const j=await api('pay.check',{},1);
if(!j){m.innerHTML=`<p class="mu">${T('Не удалось проверить. Попробуйте ещё раз.','Could not check. Try again.')}</p>`;return}
if(j.status=='done'){toast(T('Оплата получена, баланс пополнен','Payment received, balance topped up'));topPage()}else if(j.status=='exp'){toast(T('Время оплаты истекло','Payment expired'));topPage()}
else m.innerHTML=`<p class="mu">${T('Платёж с таким комментарием пока не найден. Подождите 1–2 минуты и проверьте снова.','Payment with this comment is not found yet. Wait 1–2 minutes and check again.')}</p>`}
function topPage(){const u=me(),P=db.pay=db.pay||[],cur=P.find(p=>p.u==u.nick&&p.st=='wait'&&Date.now()-p.t<1.8e6),oth=`<a class="btn g" href="${sup(T('Хочу пополнить баланс другим способом','I want to top up another way'))}" target="_blank" rel="noopener">${T('Другие способы оплаты','Other payment methods')}</a>`,
H=P.filter(p=>p.u==u.nick&&p.st=='done').reverse().slice(0,5).map(p=>`<div class="deal"><b>${p.c}</b><span class="o">+${nf(p.got,'TON')} TON</span></div>`).join('');
if(!cur){app.innerHTML=`<div class="card"><h2>${T('Пополнение баланса','Top up balance')}</h2><p class="mu">${T('Оплата в TON через Tonkeeper или любой TON-кошелёк.','Pay in TON via Tonkeeper or any TON wallet.')}</p><label>${T('Сумма в TON','Amount in TON')}</label><input id="ta" type="number" inputmode="decimal" min="0.5" step="any" oninput="tav()"><div class="mu" id="tq" style="margin-top:6px;font-size:12px"></div><button class="btn" onclick="mkPay()">${T('Создать оплату','Create payment')}</button>${oth}</div>${H?`<div class="card"><h3>${T('Последние пополнения','Recent top-ups')}</h3>${H}</div>`:''}`;return}
const nano=Math.round(cur.amt*1e9);
app.innerHTML=`<div class="card"><h2>${T('Оплата','Payment')}: ${cur.amt} TON</h2><p class="mu">≈ ${fmt(cur.amt/R.TON,u.cur)} · ${T('действует 30 минут','valid for 30 minutes')}</p>
<label>${T('Адрес кошелька','Wallet address')}</label><div class="box" style="margin-top:0">${TONW}</div><button class="chip" style="margin-top:8px" onclick="cp('${TONW}')">${T('Копировать адрес','Copy address')}</button>
<label>${T('Комментарий (обязательно)','Comment (required)')}</label><div class="box" style="margin-top:0;font-weight:800;color:var(--ac)">${cur.c}</div><button class="chip" style="margin-top:8px" onclick="cp('${cur.c}')">${T('Копировать комментарий','Copy comment')}</button>
<div class="box" style="font-size:12.5px">${T('Отправьте не меньше указанной суммы и обязательно укажите комментарий. Без него платёж не засчитается автоматически.','Send at least the amount shown and be sure to add the comment. Without it the payment will not be credited automatically.')}</div>
<a class="btn" href="https://app.tonkeeper.com/transfer/${TONW}?amount=${nano}&text=${cur.c}" target="_blank" rel="noopener">${T('Открыть в Tonkeeper','Open in Tonkeeper')}</a>
<div class="row"><button class="btn g" onclick="chkPay()">${ic('check')} ${T('Проверить оплату','Check payment')}</button><button class="btn r" onclick="cancelPay()">${T('Отклонить','Cancel')}</button></div>${oth}<div id="pm" style="margin-top:10px"></div></div>`}
let fx1='',fx2='RUB';
function fxSwap(){const u=me();if(!(u.w[fx2]>1e-9))return toast(T('В этой валюте у вас нет средств','You have no funds in this currency'));[fx1,fx2]=[fx2,fx1];fxPage()}
function fxPage(){const u=me(),all=Object.keys(R),own=all.filter(k=>u.w[k]>1e-9);
if(!own.includes(fx1))fx1=own[0]||'';if(fx2==fx1||!R[fx2])fx2=all.find(k=>k!=fx1);
const lb=k=>`<span class="cc">${S[k]}</span>${k}`,g=n=>n.toLocaleString('ru',{maximumFractionDigits:8});
app.innerHTML=`<div class="card"><h2>${T('Обменник валют','Currency exchange')}</h2>${!own.length?`<div class="box">${T('У вас пока нет средств для обмена. Пополните баланс.','You have no funds to exchange yet. Top up your balance.')}</div><a class="btn" href="#/topup">${T('Пополнить','Top up')}</a>`:`<label>${T('Что обменять','Exchange')}</label>${ds('f1',own.map(k=>[k,lb(k),CN[k]+' · '+nf(u.w[k],k)+' '+S[k]]),fx1,k=>{fx1=k;fxPage()},T('Что обменять','Exchange'))}
<div class="row" style="justify-content:center;margin:10px 0"><button class="chip" onclick="fxSwap()" aria-label="swap">⇅</button></div>
<label style="margin-top:0">${T('На что обменять','Receive')}</label>${ds('f2',all.filter(k=>k!=fx1).map(k=>[k,lb(k),CN[k]+' · 1 '+fx1+' = '+g(R[k]/R[fx1])+' '+k]),fx2,k=>{fx2=k;fxv()},T('На что обменять','Receive'))}
<label>${T('Сумма','Amount')}</label><input id="fa" type="number" inputmode="decimal" oninput="fxv()"><button class="chip" style="margin-top:8px" onclick="$('#fa').value=me().w[fx1];fxv()">${T('Всё','Max')}</button>
<div class="box" id="fr"></div><button class="btn" onclick="fxGo()">${T('Обменять','Exchange')}</button><p class="mu" style="font-size:12px">${T('Курсы демонстрационные. Для обмена показаны только валюты, которые у вас есть.','Demo rates. Only currencies you hold can be exchanged.')}</p>`}</div>`;if(own.length)fxv()}
function fxv(){const a=parseFloat(val('fa'))||0,f=n=>n.toLocaleString('ru',{maximumFractionDigits:8});if(!$('#fr'))return;$('#fr').innerHTML=`1 ${fx1} = ${f(R[fx2]/R[fx1])} ${fx2}<br><b>${T('Вы получите','You get')}: ${nf(a*R[fx2]/R[fx1],fx2)} ${S[fx2]}</b>`}
async function fxGo(){const a=parseFloat(val('fa'));if(fx1==fx2||!(a>0))return toast(T('Проверьте валюты и сумму','Check currencies and amount'));if(await api('fx',{from:fx1,to:fx2,amt:a})){toast(T('Обмен выполнен','Exchange done'));fxPage()}}
async function setCur(k){if(await api('setcur',{cur:k}))profile()}
let rt='stars';
function profile(){const u=me(),L=Object.values(db.deals).filter(d=>d.seller==u.nick||d.buyer==u.nick).sort((a,b)=>b.t-a.t),n=s=>L.filter(d=>d.st==s).length,dn=n('done'),tot=L.filter(d=>d.st=='done').reduce((s,d)=>s+d.amt,0),rate=L.length?Math.round(dn/L.length*100):0;
app.innerHTML=`<div class="card pf" style="position:relative"><a href="#/settings" class="chip" style="position:absolute;top:14px;right:14px" aria-label="Настройки">${ic('gear')}</a><label class="av big" style="margin:0 auto 10px;cursor:pointer">${u.avatar?`<img alt="" src="${u.avatar}">`:esc(u.nick[0].toUpperCase())}<input type="file" accept="image/*" hidden onchange="setAv(this)"></label><h2>${esc(u.nick)}</h2><div class="mu" style="font-size:12px">${T('С','Since')} ${new Date(u.since||Date.now()).toLocaleDateString('ru')} · тап по аватару меняет фото</div></div>
<div class="card"><span class="mu">Баланс</span><div class="bal">${fmt(bal(u),u.cur)}</div><div class="mu" style="font-size:13px">${Object.entries(u.w).filter(([k,v])=>v>1e-9).map(([k,v])=>nf(v,k)+' '+S[k]).join(' · ')}</div><div class="cr">${Object.keys(R).map(k=>`<button class="chip ${k==u.cur?'on':''}" onclick="setCur('${k}')">${k}</button>`).join('')}</div><div class="row"><a class="btn" href="#/topup">Пополнить</a><a class="btn g" href="#/wd">Вывести</a><a class="btn g" href="#/fx">Обмен</a></div></div>
<div class="grid"><div class="st">${ic('all')}<b>${L.length}</b><span>Всего сделок</span></div><div class="st">${ic('check')}<b class="o">${dn}</b><span>Успешных</span></div><div class="st">${ic('clock')}<b class="w">${n('wait')+n('paid')+n('handed')}</b><span>В ожидании</span></div><div class="st">${ic('crypto')}<b style="font-size:18px">${fmt(tot,u.cur)}</b><span>Оборот</span></div></div>
<div class="card" style="margin-top:16px"><div class="row" style="justify-content:space-between"><b>Успешность</b><b>${rate}%</b></div><div class="bar"><i style="width:${rate}%"></i></div></div>
<a class="card row" href="#/reqs" style="justify-content:space-between;text-decoration:none;color:var(--tx)"><span class="row">${ic('card')}<b>Реквизиты</b></span><span class="mu">${reqs(u).length?'Привязано: '+reqs(u).length:'Добавить'}</span></a>
<div class="card"><h3>Последние сделки</h3>${L.slice(0,3).map(d=>`<a class="deal" href="#/d/${d.id}"><b>${esc(d.type)} · #${d.id}</b><span class="tag ${ST[d.st][1]}">${ST[d.st][0]}</span></a>`).join('')||'<p class="mu">Пока нет сделок.</p>'}</div>
<button class="btn g" onclick="logout()">${ic('out')} Выйти</button>`}
const W=['Crypto Bot','xRocket','Wallet','Tonkeeper','Другой'],N=['TON','TRC20','ERC20','BEP20','BTC'];
function reqPage(){const l=reqs(me());
app.innerHTML=`<div class="card"><h2>Реквизиты</h2><p class="mu">Сюда придут деньги по сделкам. Первые реквизиты становятся основными.</p>${l.length?l.map(r=>`<div class="rq ${r.main?'main':''}"><span class="ri">${ic(r.t)}</span><div style="flex:1;min-width:0"><b>${RL[r.t]}${r.main?' · основной':''}</b><div class="mu" style="word-break:break-all">${esc(rdet(r))}</div></div><button class="chip" aria-label="Сделать основными" onclick="mainReq('${r.id}')">${ic('check')}</button><button class="chip" aria-label="Удалить" onclick="delReq('${r.id}')">${ic('trash')}</button></div>`).join(''):'<div class="box">Пока пусто. Привяжите первые реквизиты ниже.</div>'}</div>
<div class="card"><h3>Привязать новые</h3><div class="seg" style="margin-top:12px">${Object.entries(RL).map(([k,v])=>`<button class="${k==rt?'on':''}" onclick="rt='${k}';reqPage()">${ic(k)} ${v}</button>`).join('')}</div><div id="rf"></div><button class="btn" onclick="addReq()">${ic('plus')} Привязать</button></div>`;rf()}
const chips=(id,a)=>`<div class="row" style="margin-bottom:8px">${a.map(x=>`<button class="chip" onclick="$('#${id}').value='${x=='Другой'?'':x}';$('#${id}').focus()">${x}</button>`).join('')}</div>`;
let cc='RU',cm='card';
const CT={UA:['🇺🇦','Украина','Ukraine'],RU:['🇷🇺','Россия','Russia'],BY:['🇧🇾','Беларусь','Belarus'],KZ:['🇰🇿','Казахстан','Kazakhstan']};
function rf(){$('#rf').innerHTML=rt=='stars'?`<label>Юзернейм в Telegram</label><input id="r1" placeholder="@username" autocapitalize="none" autocomplete="off"><p class="mu" style="font-size:13px">На этот аккаунт придут Stars.</p>`
:rt=='crypto'?`<label>Кошелёк</label>${chips('r1',W)}<input id="r1" placeholder="Название кошелька"><label>Сеть</label>${chips('r2',N)}<input id="r2" placeholder="Сеть"><label>Адрес</label><input id="r3" autocomplete="off" autocapitalize="none">`
:`<label>${T('Страна','Country')}</label>${ds('rc',Object.entries(CT).map(([k,v])=>[k,v[0]+' '+T(v[1],v[2])]),cc,k=>{cc=k;if(cc!='RU')cm='card';rf()},T('Страна','Country'))}${cc=='RU'?`<div class="seg" style="margin-top:12px"><button class="${cm=='card'?'on':''}" onclick="cm='card';rf()">${T('Карта','Card')}</button><button class="${cm=='sbp'?'on':''}" onclick="cm='sbp';rf()">СБП</button></div>`:''}${cm=='sbp'&&cc=='RU'?`<label>${T('Телефон','Phone')}</label><input id="r1" inputmode="tel" placeholder="+7 900 000-00-00"><label>${T('Банк','Bank')}</label><input id="r2" placeholder="Сбер, Тинькофф…">`:`<label>${T('Номер карты','Card number')}</label><input id="r1" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" oninput="fc(this)"><p id="cb" class="mu" style="font-size:13px"></p>`}`}
function fc(i){const d=i.value.replace(/\D/g,'').slice(0,16);i.value=d.replace(/(\d{4})(?=\d)/g,'$1 ');$('#cb').textContent=d[0]=='4'?'Visa':d[0]=='5'?'Mastercard':d[0]=='2'?'Мир':''}
async function addReq(){const a=val('r1'),r={t:rt,a};
if(rt=='stars'){if(!/^@?\w{5,32}$/.test(a))return toast('Введите юзернейм от 5 символов');r.a='@'+a.replace('@','')}
else if(rt=='crypto'){r.b=val('r2');r.c=val('r3');if(!a||!r.b||r.c.length<10)return toast('Заполните кошелёк, сеть и адрес')}
else{r.cc=cc;if(cc=='RU'&&cm=='sbp'){r.sbp=1;r.a=a.replace(/\D/g,'');r.b=val('r2');if(r.a.length<10||!r.b)return toast(T('Укажите телефон и банк','Enter phone and bank'))}else{r.a=a.replace(/\s/g,'');if(!/^\d{16}$/.test(r.a))return toast(T('Номер карты: 16 цифр','Card number: 16 digits'))}}
if(await api('req.add',{r})){toast('Реквизиты привязаны');if(ret){const g=ret;ret='';location.hash=g;return}reqPage()}}
async function mainReq(id){if(await api('req.main',{id}))reqPage()}
async function delReq(id){if(await api('req.del',{id}))reqPage()}
function setAv(i){const f=i.files[0];if(!f)return;const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,128,128);api('avatar',{img:c.toDataURL('image/jpeg',.8)}).then(()=>profile())};im.src=URL.createObjectURL(f)}

const TH=[['crystal','Кристалл','#5ee7ff','#0b0e1f'],['black','Чёрная','#ffffff','#000000'],['redblack','Красно-чёрная','#ff2d4d','#0a0305'],['white','Белая','#6a48e8','#f2f4ff']];
function setTh(k){db.theme=k;document.documentElement.dataset.theme=k;save();settings()}
function settings(){app.innerHTML=`<div class="card"><h2>Тема оформления</h2><div class="grid" style="margin-top:14px;grid-template-columns:repeat(2,1fr)">${TH.map(([k,n,a,b])=>`<button class="sw ${(db.theme||'crystal')==k?'on':''}" style="background:${b};color:${a}" onclick="setTh('${k}')"><i style="background:${a}"></i>${n}${(db.theme||'crystal')==k?ic('check'):''}</button>`).join('')}</div></div>
<div class="card"><h2>${T('Язык','Language')}</h2><div class="seg" style="margin-top:12px"><button class="${L()=='ru'?'on':''}" onclick="setLang('ru');settings()">🇷🇺 Русский</button><button class="${L()=='en'?'on':''}" onclick="setLang('en');settings()">🇬🇧 English</button></div></div><div class="card"><h2>Смена пароля</h2><label>Текущий пароль</label><input id="o" type="password" autocomplete="current-password"><label>Новый пароль</label><input id="n" type="password" autocomplete="new-password"><button class="btn" onclick="chPw()">Изменить пароль</button></div><button class="btn g" onclick="logout()">${ic('out')} Выйти из аккаунта</button>`}
async function chPw(){const n=$('#n').value;if(n.length<6)return toast('Новый пароль от 6 символов');if(await api('passwd',{old:$('#o').value,nw:n})){toast('Пароль изменён');settings()}}
const EN=`Создать сделку=Create deal|Мои сделки=My deals|Реквизиты для получения оплаты=Payout details|Реквизиты привязаны=Details linked|Реквизиты=Payout details|Открыть сделку по номеру=Open a deal by ID|Номер сделки=Deal ID|Открыть сделку=Open deal|Открыть=Open|Профиль=Profile|Добро пожаловать, =Welcome, |Ник от 3 символов, пароль от 6=Nickname 3+ characters, password 6+|Этот ник занят=This nickname is taken|Неверный ник или пароль=Wrong nickname or password|Вы вышли из аккаунта=Signed out|Новая сделка=New deal|Тип товара=Item type|Аккаунт=Account|Разное=Other|Сумма=Amount|Ссылка на товар=Item link|Привязать реквизиты=Link payout details|Привязать новые=Link new|Привязать=Link|Выбрать другие=Choose another|Добавить реквизиты=Add details|Добавьте реквизиты=Add details|Укажите сумму и ссылку на товар (https://...)=Enter amount and item link|Укажите сумму и ссылку на товар=Enter amount and item link|Сделка создана=Deal created|Отправьте эту ссылку покупателю:=Send this link to the buyer:|Копировать=Copy|Ссылка скопирована=Link copied|Все=All|Ожидание=Pending|Успешные=Successful|Вы продаёте=You are selling|Вы покупаете=You are buying|Здесь пусто. Создайте сделку или смените фильтр.=Nothing here. Create a deal or change the filter.|Ожидает оплаты=Awaiting payment|Оплачена=Paid|Товар передан=Item handed over|Успешно=Completed|Отменена=Cancelled|Баланс=Balance|Пополнить=Top up|Вывести=Withdraw|Обмен=Exchange|Всего сделок=Total deals|Успешных=Successful|В ожидании=In progress|Оборот=Turnover|Успешность=Success rate|Привязано: =Linked: |Добавить=Add|Последние сделки=Recent deals|Пока нет сделок.=No deals yet.|Выйти из аккаунта=Log out|Выйти=Log out| · тап по аватару меняет фото= · tap the avatar to change photo|Сюда придут деньги по сделкам. Первые реквизиты становятся основными.=Your payouts go here. The first details become the main ones.|основной=main|Пока пусто. Привяжите первые реквизиты ниже.=Empty for now. Link your first details below.|Крипто=Crypto|Карта=Card|Юзернейм в Telegram=Telegram username|На этот аккаунт придут Stars.=Stars will be sent to this account.|Кошелёк=Wallet|Сеть=Network|Адрес=Address|Название кошелька=Wallet name|Введите юзернейм от 5 символов=Enter a username of 5+ characters|Заполните кошелёк, сеть и адрес=Fill in wallet, network and address|Другой=Other|Тема оформления=Theme|Кристалл=Crystal|Чёрная=Black|Красно-чёрная=Red & black|Белая=White|Смена пароля=Change password|Текущий пароль неверный=Current password is wrong|Текущий пароль=Current password|Новый пароль от 6 символов=New password must be 6+ characters|Новый пароль=New password|Изменить пароль=Change password|Пароль изменён=Password changed|Недостаточно средств=Insufficient funds|Настройки=Settings|Назад=Back|Закрыть=Close|Российский рубль=Russian ruble|Гривна=Hryvnia|Тенге=Tenge|Евро=Euro|Tether (доллар в крипте)=Tether (dollar in crypto)|Сделка не найдена=Deal not found`.split('|').map(x=>x.split('=')).sort((a,b)=>b[0].length-a[0].length);
const t1=v=>{for(const[a,b]of EN)if(v.includes(a))v=v.split(a).join(b);return v};
function tr(n){if(n.nodeType==3){const v=t1(n.nodeValue);if(v!=n.nodeValue)n.nodeValue=v}else if(n.nodeType==1&&!/^(SCRIPT|STYLE)$/.test(n.tagName)){if(n.placeholder)n.placeholder=t1(n.placeholder);n.childNodes.forEach(tr)}}
new MutationObserver(ms=>{if(L()!='en')return;ms.forEach(m=>{m.addedNodes.forEach(tr);if(m.type=='characterData')tr(m.target)})}).observe(document.body,{childList:true,subtree:true,characterData:true});
const snap=()=>JSON.stringify([db.deals,db.pay,db.wd,(db.users[db.me]||{}).w]);
async function poll(){if(!db.me||document.hidden)return;const a=snap();if(!await api('state',{},1)||a==snap())return;const p=(location.hash||'#/').slice(2).split('/')[0];if(p=='d'&&$('#msgs'))msgs();else if(p=='deals')deals();else if(p=='profile')profile()}
async function boot(){if(localStorage.getItem(TOK))await api('state',{},1);go();setInterval(poll,4000)}
addEventListener('hashchange',go);addEventListener('load',()=>{boot();if(!SK)toast('Хранилище недоступно: данные пропадут при закрытии');setTimeout(()=>$('#ld').classList.add('off'),900)});