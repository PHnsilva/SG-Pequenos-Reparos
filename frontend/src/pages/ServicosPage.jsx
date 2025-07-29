// ServicosPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarioServicos from "../components/CalendarioServicos";
import ModalSolicitarServico from "../components/ModalSolicitarServico";
import ModalLixeira from "../components/ModalLixeira";
import { listarServicos } from "../services/servicoService";
import Button from "../components/Button";
import "../styles/pages/ServicosPage.css";
import MeusAgendamentosCliente from "../pages/MeusAgendamentosCliente";

const TABS = ["Solicitados", "Agendados", "Concluídos"];

const ServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("Solicitados");
  const [viewMode, setViewMode] = useState("servicos");
  const [servicosExcluidos, setServicosExcluidos] = useState([]);
  const [modalLixeiraOpen, setModalLixeiraOpen] = useState(false);

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const response = await listarServicos();
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    }
  };

  const toggleView = (target) => {
    setViewMode((prev) => (prev === target ? "servicos" : target));
  };

  const handleExcluirServico = (servico) => {
    setServicosExcluidos((prev) => [...prev, servico]);
    setServicos((prev) => prev.filter((s) => s.id !== servico.id));
  };

  const filtrarServicosPorStatus = () => {
    switch (abaSelecionada) {
      case "Solicitados":
        return servicos.filter((s) => s.status === "SOLICITADO");
      case "Agendados":
        return servicos.filter((s) => s.status === "ACEITO");
      case "Concluídos":
        return servicos.filter((s) => s.status === "CONCLUIDO");
      default:
        return [];
    }
  };

  return (
    <div className="servicos-page-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => toggleView("agendamentos")}>📅 Meus Agendamentos</div>
        <div className="sidebar-item" onClick={() => toggleView("calendario")}>📅 Exibir Calendário</div>
        <div className="sidebar-item" onClick={() => toggleView("servicos")}>📋 Exibir Serviços</div>
        <div className="sidebar-item" onClick={() => toggleView("historico")}>🕘 Exibir Histórico</div>
        <div className="sidebar-item" onClick={() => setModalLixeiraOpen(true)}>🗑️ Lixeira</div>
      </div>

      {/* Conteúdo */}
      <div className="servicos-page-container">
        {viewMode === "agendamentos" && <MeusAgendamentosCliente servicos={servicos} />}
        {viewMode === "calendario" && <CalendarioServicos servicos={servicos} />}
        {viewMode === "historico" && <div>Histórico</div>}

        {viewMode === "servicos" && (
          <div className="servicos-content">
            <h2 className="titulo-servicos">Minhas Solicitações</h2>

            <div className="abas-container">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`aba-button ${abaSelecionada === tab ? "ativa" : ""}`}
                  onClick={() => setAbaSelecionada(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="servicos-lista">
              {filtrarServicosPorStatus().length === 0 ? (
                <p className="mensagem-vazia">Nenhum serviço nesta aba.</p>
              ) : (
                filtrarServicosPorStatus().map((servico) => (
                  <div key={servico.id} className="servico-card">
                    <div className="icone-servico">🛠️</div>
                    <div style={{ flex: 1 }}>
                      <h4>{servico.nome}</h4>
                      <p>Status: {servico.status}</p>
                      <p>{servico.descricao}</p>
                    </div>
                    <button
                      className="btn-excluir"
                      title="Excluir"
                      onClick={() => handleExcluirServico(servico)}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="servicos-buttons">
              <Button variant="contratar" onClick={() => setIsModalOpen(true)}>
                Solicitar Novo Serviço
              </Button>
            </div>

            {isModalOpen && (
              <ModalSolicitarServico
                onClose={() => setIsModalOpen(false)}
                onServicoCriado={() => {
                  fetchServicos();
                  setIsModalOpen(false);
                }}
              />
            )}

            {modalLixeiraOpen && (
              <ModalLixeira
                onClose={() => setModalLixeiraOpen(false)}
                servicosCancelados={servicos.filter((s) => s.status === "CANCELADO")}
                servicosExcluidos={servicosExcluidos}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicosPage;
