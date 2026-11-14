"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [contasRecentes, setContasRecentes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem("laco-contas-recentes") || "[]");
      if (Array.isArray(salvos)) setContasRecentes(salvos.filter((item) => typeof item === "string").slice(0, 5));
    } catch {
      setContasRecentes([]);
    }
  }, []);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos. Confira os dados e tente novamente.");
      return;
    }

    try {
      const recentes = [email.trim().toLowerCase(), ...contasRecentes.filter((item) => item !== email.trim().toLowerCase())].slice(0, 5);
      localStorage.setItem("laco-contas-recentes", JSON.stringify(recentes));
    } catch {
      // O login continua mesmo se o navegador bloquear o armazenamento local.
    }
    window.location.href = "/";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(135deg, #e8f5ef 0%, #f5f7fb 55%, #e8edf7 100%)",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 36,
          borderRadius: 24,
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 20px 60px rgba(23,45,77,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/brand/title.png"
            alt="Laço"
            style={{ width: 150, maxWidth: "100%", height: "auto", margin: "0 auto 20px" }}
          />
          <h1 style={{ color: "#172D4D", fontSize: 28, margin: 0 }}>
            Bem-vindo de volta!
          </h1>
          <p style={{ color: "#64748b", marginTop: 10 }}>
            Entre na sua conta para continuar.
          </p>
        </div>

        <form onSubmit={entrar} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 7, color: "#172D4D", fontSize: 14 }}>
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@loja.com"
              style={estiloInput}
            />
          </label>

          {contasRecentes.length > 0 && (
            <label style={{ display: "grid", gap: 7, color: "#172D4D", fontSize: 14 }}>
              Contas usadas neste navegador
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={estiloInput}
              >
                <option value="">Escolher uma conta salva...</option>
                {contasRecentes.map((conta) => <option key={conta} value={conta}>{conta}</option>)}
              </select>
            </label>
          )}

          <label style={{ display: "grid", gap: 7, color: "#172D4D", fontSize: 14 }}>
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              style={estiloInput}
            />
          </label>

          {erro && (
            <p role="alert" style={{ color: "#b42318", fontSize: 14, margin: 0 }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              border: 0,
              borderRadius: 12,
              padding: "14px 18px",
              background: "#009966",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: carregando ? "wait" : "pointer",
              opacity: carregando ? 0.7 : 1,
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 24 }}>
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" style={{ color: "#009966", fontWeight: 600 }}>
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}

const estiloInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #dbe3ea",
  borderRadius: 10,
  background: "#fff",
  color: "#172D4D",
  fontSize: 15,
  outlineColor: "#009966",
};
