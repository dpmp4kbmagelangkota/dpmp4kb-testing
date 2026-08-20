(() => {
"use strict";
const $ = (s,root=document) => root.querySelector(s);
const grid = $("#articlesGrid");
const modal = $("#articleModal");
const safeText = v => String(v ?? "");
const escapeHtml = v => safeText(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const safeArticleHtml = html => {
  const tpl=document.createElement("template"); tpl.innerHTML=safeText(html);
  tpl.content.querySelectorAll("script,iframe,object,embed,style,form,link,meta").forEach(n=>n.remove());
  tpl.content.querySelectorAll("*").forEach(el=>{
    [...el.attributes].forEach(a=>{ if(/^on/i.test(a.name) || a.name==="srcdoc") el.removeAttribute(a.name); });
    if(el.tagName==="A"){
      const href=el.getAttribute("href")||"";
      if(!/^(https?:|mailto:|tel:|#)/i.test(href)) el.removeAttribute("href");
      el.setAttribute("rel","noopener noreferrer");
    }
    if(el.tagName==="IMG"){
      const src=el.getAttribute("src")||"";
      if(!/^(https?:|data:image\/|\/|\.{0,2}\/)/i.test(src)) el.remove();
    }
  });
  return tpl.innerHTML;
};
const safeImage = src => {
  src=safeText(src).trim();
  return /^(https?:\/\/|\/|\.{0,2}\/|data:image\/)/i.test(src) ? src : "";
};
function render(){
  const list=Array.isArray(window.articles)?window.articles.filter(a=>a&&a.title):[];
  $("#articleCount").textContent=`${list.length} artikel`;
  if(!list.length){grid.innerHTML="<div class='article-card'><div class='article-body'><h3>Belum ada artikel</h3><p>Artikel yang dipublikasikan akan tampil di sini.</p></div></div>";return}
  grid.innerHTML=list.map(a=>{
    const img=safeImage(a.image);
    return `<article class="article-card">${img?`<img loading="lazy" src="${escapeHtml(img)}" alt="${escapeHtml(a.title)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'article-placeholder',textContent:'📰'}))">`:`<div class="article-placeholder">📰</div>`}
    <div class="article-body"><span class="eyebrow">${escapeHtml(a.category||"Informasi")}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt||"")}</p><p class="meta">${escapeHtml(a.date||"")} · ${escapeHtml(a.author||"")}</p><button class="read-more" data-id="${escapeHtml(a.id)}">Baca selengkapnya →</button></div></article>`;
  }).join("");
}
function openArticle(id){
  const a=(window.articles||[]).find(x=>String(x.id)===String(id)); if(!a)return;
  $("#modalCategory").textContent=safeText(a.category||"Informasi");
  $("#modalTitle").textContent=safeText(a.title);
  $("#modalMeta").textContent=`${safeText(a.date)} · ${safeText(a.author)}`;
  const img=safeImage(a.image), el=$("#modalImage"); el.hidden=!img; if(img)el.src=img; el.alt=safeText(a.title);
  $("#modalContent").innerHTML=safeArticleHtml(a.content);
  modal.hidden=false; document.body.style.overflow="hidden";
}
function closeModal(){modal.hidden=true;document.body.style.overflow=""}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b)openArticle(b.dataset.id)});
modal.addEventListener("click",e=>{if(e.target.hasAttribute("data-close"))closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
$("#menuBtn").addEventListener("click",()=>{$("#mainNav").classList.toggle("open");$("#menuBtn").setAttribute("aria-expanded",$("#mainNav").classList.contains("open"))});
$("#mainNav").addEventListener("click",e=>{if(e.target.tagName==="A")$("#mainNav").classList.remove("open")});
$("#year").textContent=new Date().getFullYear(); render();
})();