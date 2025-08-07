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
  { codigo: "CONCLUIDO", label: "Concluídos", icon: "✅" },
];

const normalizarTelefone = (t = "") =>
  String(t).replace(/\D/g, "").replace(/^55/, "");

const ServicoAdminPage = () => {
  const [servicos, setServicos] = useState([]);
  const [viewMode, setViewMode] = useState("servicos"); // 'servicos' | 'calendario' | 'historico' | 'agendamentos'
  const [statusSelecionado, setStatusSelecionado] = useState("SOLICITADO");
  const [showLixeira, setShowLixeira] = useState(false);
  const [filtroTelefone, setFiltroTelefone] = useState("");

  // Busca serviços
  const fetchServicos = async () => {
    try {
      const response = await listarServicos();
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  // Alterna views
  const toggleView = (target) => {
    setShowLixeira(false);
    setViewMode((prev) => (prev === target ? "servicos" : target));
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  // Filtragem
  const servicosFiltradosPorStatus = servicos.filter(
    (s) => s.status === statusSelecionado
  );

  const servicosFiltrados = servicosFiltradosPorStatus.filter((s) => {
    if (!filtroTelefone) return true;
    return normalizarTelefone(s.telefoneContato).includes(
      normalizarTelefone(filtroTelefone)
    );
  });

  const servicosCancelados = servicos.filter((s) => s.status === "CANCELADO");

  return (
    <div className="servicos-page-wrapper">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="servicos-page-container">
        {viewMode === "agendamentos" && (
          <div className="tela-expandida">
            <MeusAgendamentosAdmin servicos={servicos} />
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

            {/* Abas de Status: somente Solicitações e Concluídos */}
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

            {/* Filtro por telefone */}
            <div className="filtro-telefone">
              <label htmlFor="filtroTelefone">Pesquisar por telefone:</label>
              <input
                id="filtroTelefone"
                type="text"
                placeholder="Ex: 3199... (funciona mesmo se número armazenado tiver +55)"
                value={filtroTelefone}
                onChange={(e) => setFiltroTelefone(e.target.value)}
              />
              {filtroTelefone && (
                <Button onClick={() => setFiltroTelefone("")}>Limpar</Button>
              )}
            </div>

            {/* Lista */}
            <div className="servicos-lista">
              {servicosFiltrados.length === 0 ? (
                <p className="mensagem-vazia">
                  Nenhum serviço com status {statusSelecionado}.
                </p>
              ) : (
                <ListaServicosAdmin
                  servicos={servicosFiltrados}
                  onServicoAtualizado={fetchServicos}
                />
              )}
            </div>
          </div>
        )}

        {/* Modal Lixeira como overlay */}
        {showLixeira && (
          <ModalLixeira
            onClose={() => setShowLixeira(false)}
            servicosCancelados={servicosCancelados}
            servicosExcluidos={[]}
          />
        )}
      </div>
    </div>
  );
};

export default ServicoAdminPage;
