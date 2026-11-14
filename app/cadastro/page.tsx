
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [loja, setLoja] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            full_name: nome.trim(),
            store_name: loja.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setMensagem(
          "Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar."
        );
      } else if (data.user) {
        window.location.href = "/";
      }
    } catch (erro) {
      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar sua conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const campo = {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #d8e2df",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    outlineColor: "#009966",
    background: "#ffffff",
    color: "#172D4D",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 16px",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top left, #e1f7ee 0, transparent 42%), linear-gradient(135deg, #f5faf8, #edf2f8)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#172D4D",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px",
          borderRadius: "22px",
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 20px 60px rgba(23,45,77,0.12)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img
  src="/brand/title.png"
  alt="Laço"
  style={{
    display: "block",
    width: "150px",
    height: "auto",
    objectFit: "contain",
    margin: "0 auto",
  }}
/>

          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: "14px" }}>
            Relacionamentos que viram oportunidades
          </p>
        </div>

        <h1
          style={{
            fontSize: "25px",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Crie sua conta
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            margin: "0 0 26px",
          }}
        >
          Organize seus clientes e fortaleça suas vendas.
        </p>

        <form onSubmit={cadastrar} style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "grid", gap: "7px", fontSize: "14px" }}>
            Seu nome
            <input
              style={campo}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ana Silva"
              autoComplete="name"
              required
              maxLength={100}
            />
          </label>

          <label style={{ display: "grid", gap: "7px", fontSize: "14px" }}>
            Nome da loja
            <input
              style={campo}
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              placeholder="Ex.: Boutique da Ana"
              autoComplete="organization"
              required
              maxLength={120}
            />
          </label>

          <label style={{ display: "grid", gap: "7px", fontSize: "14px" }}>
            E-mail
            <input
              style={campo}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </label>

          <label style={{ display: "grid", gap: "7px", fontSize: "14px" }}>
            Senha
            <input
              style={campo}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Pelo menos 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            disabled={carregando}
            style={{
              marginTop: "6px",
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: carregando ? "#72b9a0" : "#009966",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: carregando ? "wait" : "pointer",
              boxShadow: "0 6px 16px rgba(0,153,102,0.2)",
            }}
          >
            {carregando ? "Criando sua conta..." : "Criar minha conta"}
          </button>
        </form>

        {mensagem && (
          <p
            role="status"
            style={{
              marginTop: "18px",
              padding: "12px",
              borderRadius: "10px",
              background: "#edf8f3",
              color: "#176448",
              fontSize: "14px",
              lineHeight: 1.5,
              overflowWrap: "anywhere",
            }}
          >
            {mensagem}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#64748b",
            margin: "24px 0 0",
          }}
        >
          Já tem uma conta?{" "}
          <a
            href="/login"
            style={{
              color: "#009966",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Entrar
          </a>
        </p>
      </section>
    </main>
  );
}
