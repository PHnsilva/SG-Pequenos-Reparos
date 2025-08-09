import { useState, useEffect } from "react";
import { listarServicos } from "../../services/servicoService";
import CalendarioServicosAdmin from "../../components/admin/CalendarioServicosAdmin";
import HistoricoServicosAdmin from "../../pages/HistoricoServicosPage";
import ListaServicosAdmin from "../../components/admin/ListaServicosAdmin";
import Button from "../../components/Button";
import MeusAgendamentosAdmin from "../../pages/admin/MeusAgendamentosAdmin";
import ModalLixeira from "../../components/ModalLixeira"; // modal overlay
import "../../styles/pages/ServicosPage.css";

const STATUS_ABAS = [
  { codigo: "SOLICITADO", label: "Solicitados", icon: "📝" },
  // Removemos "CONCLUIDO" daqui
];

const ServicoAdminPage = () => {
  const [servicos, setServicos] = useState([]);
  const [viewMode, setViewMode] = useState("servicos"); // 'servicos' | 'calendario' | 'historico' | 'agendamentos'
  const [statusSelecionado, setStatusSelecionado] = useState("SOLICITADO");
  const [showLixeira, setShowLixeira] = useState(false);
  const [filtroTelefone, setFiltroTelefone] = useState("");

  const fetchServicos = async () => {
    try {
      const response = await listarServicos();
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  const toggleView = (target) => {
    setShowLixeira(false);
    setViewMode((prev) => (prev === target ? "servicos" : target));
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const normalizarTelefone = (t) => (t || "").replace(/^\+55/, "").replace(/\D/g, "");
  const normalizedFilter = normalizarTelefone(filtroTelefone);

  // Filtra para página Serviços (status solicitados)
  const servicosFiltrados = servicos.filter((s) => {
    if (s.status !== statusSelecionado) return false;
    if (!normalizedFilter) return true;
    return normalizarTelefone(s.telefoneContato).includes(normalizedFilter);
  });

  // Serviços cancelados para a lixeira
  const servicosCancelados = servicos.filter((s) => s.status === "CANCELADO");

  // Serviços para agendamentos (ACEITO e CONCLUIDO)
  const servicosAgendadosEConcluidos = servicos.filter(
    (s) => s.status === "ACEITO" || s.status === "CONCLUIDO"
  );

  return (
    <div className="servicos-page-wrapper">
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => toggleView("agendamentos")}>
          <span className="icon">📅</span>
          <span className="label">Meus Agendamentos</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("servicos")}>
          <span className="icon">📋</span>
          <span className="label">Serviços</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("calendario")}>
          <span className="icon">🗓️</span>
          <span className="label">Calendário</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("historico")}>
          <span className="icon">📜</span>
          <span className="label">Histórico</span>
        </div>
        <div className="sidebar-item" onClick={() => setShowLixeira(true)}>
          <span className="icon">🗑️</span>
          <span className="label">Lixeira</span>
        </div>
      </div>

      <div className="servicos-page-container">
        {viewMode === "agendamentos" && (
          <div className="tela-expandida">
            <MeusAgendamentosAdmin servicos={servicosAgendadosEConcluidos} />
          </div>
        )}

        {viewMode === "calendario" && (
          <div className="tela-expandida">
            <CalendarioServicosAdmin servicos={servicos} />
          </div>
        )}

        {viewMode === "historico" && (
          <div className="tela-expandida">
            <HistoricoServicosAdmin servicos={servicos} />
          </div>
        )}

        {viewMode === "servicos" && (
          <div className="servicos-content">
            <h2 className="titulo-servicos">Gerenciamento de Serviços</h2>

            <div className="filtro-telefone-area" style={{ marginBottom: "12px" }}>
              <label htmlFor="filtroTelefone">Buscar por telefone:</label>
              <input
                id="filtroTelefone"
                className="filtro-telefone-input"
                type="text"
                placeholder="Ex.: 3199... (ignora +55 e formatação)"
                value={filtroTelefone}
                onChange={(e) => setFiltroTelefone(e.target.value)}
              />
            </div>

            <div className="abas-container">
              {STATUS_ABAS.map(({ codigo, label, icon }) => (
                <button
                  key={codigo}
                  className={`aba-button ${statusSelecionado === codigo ? "ativa" : ""}`}
                  onClick={() => setStatusSelecionado(codigo)}
                >
                  <span className="aba-icon">{icon}</span> {label}
                </button>
              ))}
            </div>

            <div className="servicos-lista">
              {servicosFiltrados.length === 0 ? (
                <p className="mensagem-vazia">
                  Nenhum serviço com status {statusSelecionado}.
                </p>
              ) : (
                <ListaServicosAdmin
                  servicos={servicosFiltrados}
                  onServicoAtualizado={fetchServicos}
                  isAdmin={true}
                />
              )}
            </div>
          </div>
        )}

        {showLixeira && (
          <ModalLixeira
            onClose={() => setShowLixeira(false)}
            servicosCancelados={servicosCancelados}
            servicosExcluidos={[]}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
};

export default ServicoAdminPage;
