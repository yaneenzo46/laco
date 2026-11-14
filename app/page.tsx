"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
type Lead = {
  id: number;
  name: string;
  phone: string;
  product: string;
  value: number;
  status: string;
};

const STAGES: Record<string, { chip: string; dot: string; bar: string }> = {
  "Retornar hoje": { chip: "bg-emerald-500/10 text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  "Aguardando resposta": { chip: "bg-amber-500/10 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-400" },
  "Proposta enviada": { chip: "bg-indigo-500/10 text-indigo-700", dot: "bg-indigo-500", bar: "bg-indigo-500" },
};

const FILTERS = [
  { value: "Todas", label: "Todas" },
  { value: "Retornar hoje", label: "Hoje" },
  { value: "Aguardando resposta", label: "Aguardando" },
  { value: "Proposta enviada", label: "Proposta" },
];

const AVATARS = [
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-600",
  "from-amber-300 to-orange-500",
  "from-fuchsia-400 to-purple-600",
  "from-rose-400 to-red-500",
];

const glass =
  "border border-white/70 bg-white/60 shadow-[0_8px_30px_rgba(23,45,77,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl";
const field =
  "w-full rounded-2xl border border-transparent bg-slate-900/[0.05] px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/15";

function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === target) {
      setDisplay(target);
      from.current = target;
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(start + (target - start) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      from.current = display;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [saudacao, setSaudacao] = useState("Olá");
  const [firstName, setFirstName] = useState("loja");
  const [userEmail, setUserEmail] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

useEffect(() => {
  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      window.location.href = "/login";
      return;
    }

    setUserId(data.user.id);
    const nomeCompleto = String(data.user.user_metadata?.full_name ?? "").trim();
    setFirstName(nomeCompleto.split(/\s+/)[0] || "loja");
    setUserEmail(data.user.email ?? "");
    const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Fortaleza" }).format(new Date()));
    setSaudacao(hora >= 5 && hora < 12 ? "Bom dia" : hora >= 12 && hora < 18 ? "Boa tarde" : "Boa noite");
    setAuthChecking(false);
  }

  checkUser();
}, []);
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("laco-tema-escuro");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("laco-tema-escuro", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (!userEmail) return;
    document.title = `Laço • ${userEmail.split("@")[0]}'s perfil`;
  }, [userEmail]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Retornar hoje");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todas");

  // Carrega as oportunidades salvas no navegador
  useEffect(() => {
  if (!userId) return;

  async function carregarLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar clientes:", error.message);
      setLoaded(true);
      return;
    }

    setLeads(
      (data ?? []).map((lead) => ({
        id: Number(lead.id),
        name: lead.name,
        phone: lead.phone ?? "",
        product: lead.product,
        value: Number(lead.value),
        status: lead.status,
      }))
    );

    setLoaded(true);
  }

  carregarLeads();
}, [userId]);

  // Some com o aviso sozinho
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const money = (amount: number) =>
    amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Calcula a saudação no navegador, depois da montagem, evitando erro de pré-renderização.
  useEffect(() => {
    const atualizarSaudacao = () => {
      const horaAtual = new Date().getHours();
      setSaudacao(
        horaAtual >= 5 && horaAtual < 12
          ? "Bom dia"
          : horaAtual >= 12 && horaAtual < 18
            ? "Boa tarde"
            : "Boa noite"
      );
    };

    atualizarSaudacao();
    const intervalo = window.setInterval(atualizarSaudacao, 60_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesName = lead.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesStatus = filterStatus === "Todas" || lead.status === filterStatus;
    return matchesName && matchesStatus;
  });

  const returnsToday = leads.filter((l) => l.status === "Retornar hoje").length;
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);

  const animatedLeads = useCountUp(leads.length);
  const animatedToday = useCountUp(returnsToday);
  const animatedValue = useCountUp(totalValue);

  async function addLead(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!name.trim() || !product.trim() || !userId) return;

  const novoLead = {
    user_id: userId,
    name: name.trim(),
    phone: phone.trim(),
    product: product.trim(),
    value: Math.max(0, Number(value) || 0),
    status,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(novoLead)
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar cliente:", error.message);
    alert("Não foi possível salvar o cliente. Tente novamente.");
    return;
  }

  setLeads((current) => [
    {
      id: Number(data.id),
      name: data.name,
      phone: data.phone ?? "",
      product: data.product,
      value: Number(data.value),
      status: data.status,
    },
    ...current,
  ]);

  setName("");
  setPhone("");
  setProduct("");
  setValue("");
}


  
async function removeLead(id: number) {
  setRemovingId(id);

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao remover cliente:", error.message);
    setRemovingId(null);
    setToast("Não foi possível remover o cliente");
    return;
  }

  setLeads((current) => current.filter((item) => item.id !== id));
  setRemovingId(null);
  setToast("Oportunidade removida");
}


  async function sairDaConta() {
    setSaindo(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao sair:", error.message);
      setToast("Não foi possível sair. Tente novamente.");
      setSaindo(false);
      return;
    }
    window.location.href = "/login";
  }

  async function trocarDeConta() {
    setSaindo(true);
    setMenuAberto(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao trocar de conta:", error.message);
      setToast("Não foi possível trocar de conta. Tente novamente.");
      setSaindo(false);
      return;
    }
    window.location.assign("/login");
  }

  function openWhatsApp(phone?: string) {
    const digits = (phone ?? "").replace(/\D/g, "");
    if (!digits) {
      setToast("Cadastre o WhatsApp deste cliente primeiro");
      return;
    }
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    window.open(`https://wa.me/${number}`, "_blank", "noopener,noreferrer");
  }

  const initials = (n: string) =>
    n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  const filterIndex = Math.max(0, FILTERS.findIndex((f) => f.value === filterStatus));

  if (authChecking || !loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef1f6] text-[#172D4D]" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
        <p className="rounded-2xl bg-white/80 px-6 py-4 shadow-lg">Carregando sua loja...</p>
      </main>
    );
  }

  return (
    <main
      className={`theme-root relative min-h-screen overflow-x-clip bg-[#eef1f6] text-slate-900 antialiased ${darkMode ? "theme-dark" : ""}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif' }}
    >
      <style>{`
        @keyframes rise { 0% { opacity: 0; transform: translate3d(0,24px,0) scale(.975); filter: blur(7px); } 65% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); } }
        @keyframes drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 35% { transform: translate3d(28px,-22px,0) scale(1.08); } 70% { transform: translate3d(-18px,16px,0) scale(.96); } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.55); } 100% { box-shadow: 0 0 0 12px rgba(255,255,255,0); } }
        @keyframes pop { from { opacity: 0; transform: translate(-50%, 20px) scale(.9); filter: blur(8px); } to { opacity: 1; transform: translate(-50%, 0) scale(1); filter: blur(0); } }
        @keyframes enter { from { opacity: 0; transform: translateY(14px) scale(.97); filter: blur(4px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes menuIn { 0% { opacity: 0; transform: translate3d(0,-10px,0) scale(.94); filter: blur(10px); } 70% { opacity: 1; transform: translate3d(0,1px,0) scale(1.012); filter: blur(0); } 100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); } }
        @keyframes glassSweep { 0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; } 20% { opacity: .45; } 60%,100% { transform: translateX(240%) skewX(-18deg); opacity: 0; } }
        @keyframes breathe { 0%,100% { opacity: .65; } 50% { opacity: 1; } }
        .rise { animation: rise .9s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); will-change: opacity, transform, filter; }
        .enter { animation: enter .52s cubic-bezier(.16,1,.3,1) both; }
        .leaving { opacity: 0; transform: translateX(34px) scale(.96); filter: blur(5px); transition: opacity .24s ease, transform .32s cubic-bezier(.2,.8,.2,1), filter .24s ease; }
        .spring { transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .45s ease, background-color .3s ease, border-color .3s ease; }
        .spring:hover { transform: translateY(-2px); }
        .account-menu { transform-origin: top right; animation: menuIn .42s cubic-bezier(.16,1,.3,1) both; box-shadow: 0 24px 70px rgba(23,45,77,.18), 0 4px 14px rgba(23,45,77,.06), inset 0 1px 0 rgba(255,255,255,.95); }
        .account-trigger { transition: transform .35s cubic-bezier(.2,.8,.2,1), background-color .25s ease, border-color .25s ease, box-shadow .35s ease; }
        .account-trigger:hover { transform: translateY(-1px); background: rgba(255,255,255,.17); border-color: rgba(255,255,255,.38); box-shadow: 0 8px 24px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.3); }
        .glass-panel { position: relative; isolation: isolate; transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s ease, border-color .35s ease; }
        .glass-panel::after { content: ''; position: absolute; z-index: -1; pointer-events: none; inset: 0; border-radius: inherit; background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,.45) 45%, transparent 65%); transform: translateX(-140%); opacity: 0; }
        .glass-panel:hover { box-shadow: 0 22px 55px rgba(23,45,77,.10), inset 0 1px 0 rgba(255,255,255,.95); border-color: rgba(255,255,255,.95); }
        .glass-panel:hover::after { animation: glassSweep 1s ease both; }
        .ambient-light { animation: breathe 8s ease-in-out infinite; }
        .site-header { position: relative; isolation: isolate; overflow: visible; z-index: 40; }
        .site-header::before { content: ""; position: absolute; z-index: 0; inset: 0; pointer-events: none; background: linear-gradient(115deg, transparent 12%, rgba(255,255,255,.035) 35%, rgba(255,255,255,.13) 48%, rgba(255,255,255,.025) 60%, transparent 82%); background-size: 220% 100%; animation: headerGloss 14s ease-in-out infinite; }
        @keyframes headerGloss { 0%,100% { background-position: 100% 0; } 50% { background-position: 0 0; } }
        .site-header-inner { position: relative; z-index: 1; }
        .site-header .account-menu { z-index: 1000; filter: none; }
        .site-header .account-menu p, .site-header .account-menu button { filter: none; text-shadow: none; }
        .theme-dark { background-color: #0b1220 !important; color: #e5eaf2 !important; }
        .theme-dark .text-slate-900, .theme-dark .text-slate-800 { color: #e5eaf2 !important; }
        .theme-dark .text-slate-700 { color: #d7e0ed !important; }
        .theme-dark .text-slate-600, .theme-dark .text-slate-500 { color: #c2cee0 !important; }
        .theme-dark .text-slate-400 { color: #b3c0d3 !important; }
        .theme-dark .bg-white, .theme-dark .bg-white\/80, .theme-dark .bg-white\/85, .theme-dark .bg-white\/60 { background-color: #111c2e !important; }
        .theme-dark .bg-emerald-50 { background-color: rgba(16,185,129,.13) !important; }
        .theme-dark .border-white\/70, .theme-dark .border-white\/80 { border-color: rgba(148,163,184,.22) !important; }
        .theme-dark .bg-slate-900\/\[0\.05\], .theme-dark .bg-slate-900\/\[0\.06\] { background-color: rgba(148,163,184,.12) !important; }
        .theme-dark input, .theme-dark select, .theme-dark textarea { color: #e5eaf2 !important; background-color: rgba(30,41,59,.88) !important; border-color: rgba(148,163,184,.18) !important; }
        .theme-dark input::placeholder, .theme-dark textarea::placeholder { color: #91a1b8 !important; }
        .theme-dark option { color: #e5eaf2; background: #0f172a; }
        .theme-dark .account-menu { background: #111c2e !important; color: #f1f5fb !important; border-color: rgba(148,163,184,.35) !important; box-shadow: 0 18px 45px rgba(0,0,0,.42) !important; backdrop-filter: none !important; }
        .theme-dark .account-menu p { color: #d5dfed !important; }
        .theme-dark .account-menu button { color: #f1f5fb !important; }
        .theme-dark .account-menu button.text-red-600 { color: #fca5a5 !important; }
        .theme-dark .account-menu a:hover { background-color: rgba(16,185,129,.15) !important; }
        .theme-dark .glass-panel { border-color: rgba(148,163,184,.2) !important; box-shadow: 0 12px 38px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.035); }
        .theme-dark .glass-panel:hover { box-shadow: 0 22px 55px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05); border-color: rgba(148,163,184,.32) !important; }
        .theme-dark .ambient-light { opacity: .2; }
        .theme-dark .glass-panel::after { background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,.07) 45%, transparent 65%); }
        .theme-dark { -webkit-font-smoothing: subpixel-antialiased; -moz-osx-font-smoothing: auto; text-rendering: optimizeLegibility; }
        .theme-dark .rise { will-change: auto; animation-fill-mode: backwards; }
        .theme-dark .text-slate-900, .theme-dark .text-slate-800 { color: #f3f6fb !important; }
        .theme-dark .text-slate-700 { color: #e2e9f3 !important; }
        .theme-dark .text-slate-600, .theme-dark .text-slate-500 { color: #d0dbea !important; }
        .theme-dark .text-slate-400 { color: #c0cddf !important; }
        .theme-dark .text-emerald-700 { color: #6ee7b7 !important; }
        .theme-dark .text-amber-700 { color: #fcd34d !important; }
        .theme-dark .text-indigo-700 { color: #a5b4fc !important; }
        .theme-dark .text-\\[\\#009966\\] { color: #10d89a !important; }
        .theme-dark section.rise h1 { color: #f3f6fb !important; }
        .theme-dark section.rise p.max-w-md { color: #e2e9f3 !important; }
        .theme-dark header p { color: rgba(255,255,255,.92) !important; }
        .theme-dark section.lg\\:grid-cols-3 p { color: #000 !important; }
        .theme-dark section.min-w-0 > div > h2, .theme-dark section.min-w-0 > div > h2 + p { color: #000 !important; }
        .theme-dark #search-client::placeholder { color: #000 !important; }
        .theme-dark form h2, .theme-dark form p, .theme-dark form label, .theme-dark form select, .theme-dark form select option { color: #000 !important; }
        .theme-dark article.glass-panel h3, .theme-dark article.glass-panel p, .theme-dark article.glass-panel span.inline-flex, .theme-dark article.glass-panel button.text-slate-400 { color: #000 !important; }
        .theme-dark [role="tablist"] button { color: #000 !important; }
        .theme-dark .enter p { color: #000 !important; }
        @media (max-width: 640px) { .site-header-inner { gap: 12px; padding-left: 16px; padding-right: 16px; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
      `}</style>

      {/* Fundo: luzes suaves em movimento lento */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-sky-300/40 blur-3xl" style={{ animation: "drift 22s ease-in-out infinite" }} />
        <div className="absolute right-[-120px] top-40 h-[460px] w-[460px] rounded-full bg-emerald-300/35 blur-3xl" style={{ animation: "drift 28s ease-in-out infinite reverse" }} />
        <div className="absolute bottom-[-160px] left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-300/30 blur-3xl" style={{ animation: "drift 32s ease-in-out infinite" }} />
      </div>

      <header className="site-header border-b border-white/10 bg-[#172D4D]">
        <div className="site-header-inner mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <img src="/brand/logo.png" alt="Laço" className="h-14 w-auto max-w-[240px] object-contain sm:h-16" />
            <p className="mt-0.5 text-[13px] text-white/65">Relacionamentos que viram oportunidades.</p>
          </div>
          <div className="relative flex items-center gap-2">
            <button type="button" onClick={() => setDarkMode((atual) => !atual)} aria-label={darkMode ? "Ativar tema claro" : "Ativar tema escuro"} aria-pressed={darkMode} title={darkMode ? "Ativar tema claro" : "Ativar tema escuro"} className="account-trigger inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl">
              {darkMode ? <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg> : <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" /></svg>}
              <span className="hidden sm:inline">{darkMode ? "Tema claro" : "Tema escuro"}</span>
            </button>
            <button type="button" onClick={() => setMenuAberto((aberto) => !aberto)} aria-expanded={menuAberto} className="account-trigger rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl">
              {userEmail.split("@")[0] || "Minha conta"} ▾
            </button>
            {menuAberto && (
              <div className="account-menu absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/70 bg-white/85 p-2 text-slate-800 shadow-[0_18px_50px_rgba(23,45,77,0.2)] backdrop-blur-2xl">
                <p className="px-3 py-2 text-xs text-slate-500">Conectado como</p>
                <p className="break-all px-3 pb-3 text-sm font-semibold">{userEmail}</p>
                <button type="button" disabled={saindo} onClick={trocarDeConta} className="block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-emerald-50 disabled:opacity-50">{saindo ? "Trocando conta..." : "Trocar de conta"}</button>
                <button type="button" disabled={saindo} onClick={sairDaConta} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 disabled:opacity-50">{saindo ? "Saindo..." : "Sair da conta"}</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10">
        <section className="rise">
          <p className="mb-3 text-lg font-semibold text-[#009966]">{saudacao}, {firstName}! {saudacao === "Bom dia" ? "☀️" : saudacao === "Boa tarde" ? "🌤️" : "🌙"}</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Nenhuma oportunidade <br className="hidden sm:block" />
            deve se perder.
          </h1>
          <p className="mt-3 max-w-md text-lg text-slate-500">
            Acompanhe seus clientes e saiba quem precisa de atenção.
          </p>
        </section>

        {/* Indicadores */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={`rise rounded-[28px] p-6 ${glass}`} style={{ "--d": "100ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-slate-500">Oportunidades cadastradas</p>
            <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums">{Math.round(animatedLeads)}</p>
          </div>

          <div
            className="rise glass-panel relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-[0_18px_40px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" style={{ animation: "pulseRing 1.8s ease-out infinite" }} />
              <p className="text-sm font-medium text-white/90">Retornos de hoje</p>
            </div>
            <p className="relative mt-3 text-5xl font-bold tracking-tight tabular-nums">{Math.round(animatedToday)}</p>
            <p className="relative mt-2 text-sm text-white/85">
              {returnsToday === 1 ? "cliente precisa de retorno" : "clientes precisam de retorno"}
            </p>
          </div>

          <div className={`rise glass-panel rounded-[28px] p-6 sm:col-span-2 lg:col-span-1 ${glass}`} style={{ "--d": "300ms" } as React.CSSProperties}>
            <p className="text-sm font-medium text-slate-500">Valor potencial das oportunidades</p>
            <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums">{money(animatedValue)}</p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-900/[0.06]" aria-hidden>
              {Object.keys(STAGES).map((stage) => {
                const share = leads.length
                  ? (leads.filter((l) => l.status === stage).length / leads.length) * 100
                  : 0;
                return (
                  <div
                    key={stage}
                    className={`${STAGES[stage].bar} transition-all duration-700 ease-out`}
                    style={{ width: `${share}%` }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid min-w-0 items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Lista */}
          <div className={`rise glass-panel rounded-[32px] p-6 ${glass}`} style={{ "--d": "400ms" } as React.CSSProperties}>
            <h2 className="text-2xl font-bold tracking-tight">Seus clientes</h2>
            <p className="mt-1 text-sm text-slate-500">Oportunidades que precisam de acompanhamento.</p>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <label htmlFor="search-client" className="sr-only">Buscar cliente</label>
                <input
                  id="search-client"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente"
                  className={`${field} pl-12`}
                />
              </div>

              {/* Controle segmentado estilo iOS */}
              <div role="tablist" aria-label="Filtrar por etapa" className="relative grid grid-cols-4 rounded-2xl bg-slate-900/[0.06] p-1">
                <div
                  aria-hidden
                  className="absolute inset-y-1 left-1 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  style={{
                    width: "calc((100% - 8px) / 4)",
                    transform: `translateX(${filterIndex * 100}%)`,
                    transition: "transform .45s cubic-bezier(.34,1.4,.64,1)",
                  }}
                />
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="tab"
                    aria-selected={filterStatus === f.value}
                    onClick={() => setFilterStatus(f.value)}
                    className={`relative z-10 rounded-xl px-2 py-2 text-[13px] font-semibold transition-colors ${
                      filterStatus === f.value ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const stage = STAGES[lead.status] ?? STAGES["Aguardando resposta"];
                  return (
                    <article
                      key={lead.id}
                      className={`${removingId === lead.id ? "leaving" : "enter"} glass-panel spring rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_2px_10px_rgba(23,45,77,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,45,77,0.1)]`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-inner ${AVATARS[lead.name.length % AVATARS.length]}`}
                        >
                          {initials(lead.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold">{lead.name}</h3>
                              <p className="truncate text-sm text-slate-500">{lead.product}</p>
                            </div>
                            <p className="font-semibold tabular-nums">{money(lead.value)}</p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${stage.chip}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                              {lead.status}
                            </span>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openWhatsApp(lead.phone)}
                                className="spring inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,185,129,0.35)] hover:bg-emerald-600 active:scale-95"
                              >
                                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5.2A8.5 8.5 0 1 1 21 12Z" />
                                </svg>
                                WhatsApp
                              </button>
                              <button
                                type="button"
                                onClick={() => removeLead(lead.id)}
                                className="rounded-full px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <div className="enter py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/[0.05] text-slate-400">
                      <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </div>
                    <p className="text-slate-500">
                      {leads.length === 0
                        ? "Nenhuma oportunidade cadastrada. Adicione a primeira ao lado."
                        : "Nenhuma oportunidade encontrada com esses filtros."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form
            onSubmit={addLead}
            className={`rise glass-panel relative min-w-0 self-start space-y-5 overflow-visible rounded-[32px] p-6 ${glass}`}
            style={{ "--d": "500ms" } as React.CSSProperties}
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Nova oportunidade</h2>
              <p className="mt-1 text-sm text-slate-500">Registre um cliente interessado.</p>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">Nome do cliente</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: João Silva" required className={field} />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">WhatsApp (opcional)</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex.: 11987654321" className={field} />
            </div>

            <div>
              <label htmlFor="product" className="mb-2 block text-sm font-medium">Produto de interesse</label>
              <input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex.: Tênis tamanho 40" required className={field} />
            </div>

            <div>
              <label htmlFor="value" className="mb-2 block text-sm font-medium">Valor estimado (R$)</label>
              <input id="value" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex.: 199,90" className={field} />
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium">Etapa da venda</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
                <option>Retornar hoje</option>
                <option>Aguardando resposta</option>
                <option>Proposta enviada</option>
              </select>
            </div>

            <button
              type="submit"
              className="spring w-full rounded-2xl bg-[#172d4d] px-5 py-3.5 font-semibold text-white shadow-[0_10px_24px_rgba(23,45,77,0.3)] hover:bg-[#25456f] active:scale-[0.98]"
            >
              Adicionar oportunidade
            </button>

            <p className="text-xs leading-relaxed text-slate-500">
              Seus clientes são salvos com segurança na sua conta.
            </p>
          </form>
        </section>
      </div>

      {/* Aviso flutuante */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 rounded-full border border-white/20 bg-slate-900/85 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl"
          style={{ animation: "pop .4s cubic-bezier(.34,1.56,.64,1) both" }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
