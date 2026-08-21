(() => {
const articles=Array.isArray(window.articles)?window.articles:[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const sanitizeHTML=(html)=>{
  const tpl=document.createElement("template");
  tpl.innerHTML=String(html||"");
  const allowed=new Set(["P","BR","STRONG","EM","U","S","H2","H3","UL","OL","LI","BLOCKQUOTE","A","IMG"]);
  [...tpl.content.querySelectorAll("*")].forEach(el=>{
    if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);return;}
    [...el.attributes].forEach(attr=>{
      const n=attr.name.toLowerCase(),v=attr.value.trim();
      const ok=(el.tagName==="A"&&["href","target","rel"].includes(n))||(el.tagName==="IMG"&&["src","alt","title"].includes(n));
      if(!ok)el.removeAttribute(attr.name);
      else if((n==="href"||n==="src")&&!/^https?:\/\//i.test(v)&&!v.startsWith("/"))el.removeAttribute(attr.name);
    });
    if(el.tagName==="A"){el.setAttribute("target","_blank");el.setAttribute("rel","noopener noreferrer nofollow");}
  });
  return tpl.innerHTML;
};
const formatDate=v=>{try{return new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(v+"T00:00:00"))}catch{return v}};
$("#year").textContent=new Date().getFullYear();

const slides=$$(".slide"), dots=$("#dots"); let slide=0, timer;
slides.forEach((_,i)=>{const b=document.createElement("button");b.setAttribute("aria-label","Slide "+(i+1));b.onclick=()=>showSlide(i);dots.appendChild(b)});
function showSlide(i){slide=(i+slides.length)%slides.length;slides.forEach((x,n)=>x.classList.toggle("active",n===slide));dots.children[slide]?.classList.add("active");[...dots.children].forEach((x,n)=>x.classList.toggle("active",n===slide));}
function next(){showSlide(slide+1)} function restart(){clearInterval(timer);timer=setInterval(next,6500)}
$("#next").onclick=()=>{next();restart()};$("#prev").onclick=()=>{showSlide(slide-1);restart()};showSlide(0);restart();

const navToggle=$("#navToggle"),nav=$("#navMenu");navToggle.onclick=()=>nav.classList.toggle("open");$$("nav a").forEach(a=>a.onclick=()=>nav.classList.remove("open"));

const cats=[...new Set(articles.map(a=>a.category).filter(Boolean))];cats.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;$("#category").appendChild(o)});
const cards=$("#articles"),empty=$("#empty");
function render(){
 const q=$("#search").value.trim().toLowerCase(),cat=$("#category").value;
 const data=articles.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.excerpt,a.category].join(" ").toLowerCase().includes(q)));
 empty.classList.toggle("hidden",data.length>0);
 cards.innerHTML=data.map((a,i)=>`<article class="article-card" data-id="${a.id}">
 ${a.image?`<div class="article-image"><img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy"></div>`:`<div class="article-image placeholder">DPMP4KB</div>`}
 <div class="article-body"><div class="meta">${esc(a.category)} • ${formatDate(a.date)}</div><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><button class="read">Baca selengkapnya →</button></div></article>`).join("");
}
$("#search").oninput=render;$("#category").onchange=render;render();

const gallery=$("#gallery");
gallery.innerHTML=articles.filter(a=>a.image).slice(0,12).map(a=>`<button class="gallery-item" data-id="${a.id}"><img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy"><span>${esc(a.title)}</span></button>`).join("");
if(!gallery.innerHTML)gallery.innerHTML=`<div class="gallery-empty">Galeri akan terisi otomatis setelah artikel dengan foto dipublish.</div>`;

const dialog=$("#articleDialog"),detail=$("#articleDetail");
function openArticle(id){const a=articles.find(x=>String(x.id)===String(id));if(!a)return;detail.innerHTML=`${a.image?`<img class="detail-cover" src="${esc(a.image)}" alt="${esc(a.title)}">`:""}<div class="meta">${esc(a.category)} • ${formatDate(a.date)} • ${esc(a.author)}</div><h1>${esc(a.title)}</h1><p class="detail-excerpt">${esc(a.excerpt)}</p><div class="article-content">${sanitizeHTML(a.content)}</div>`;dialog.showModal()}
document.addEventListener("click",e=>{const card=e.target.closest("[data-id]");if(card)openArticle(card.dataset.id)});
$("#dialogClose").onclick=()=>dialog.close();dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&dialog.open)dialog.close()});
})()
