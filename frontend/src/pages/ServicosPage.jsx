import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarioServicos from "../components/CalendarioServicos";
import ModalSolicitarServico from "../components/ModalSolicitarServico";
import { listarServicos } from "../services/servicoService";
import Button from "../components/Button";
import "../styles/pages/ServicosPage.css";
import HistoricoServicosPage from "./HistoricoServicosPage"; // ou o caminho correto


const TABS = ["Solicitados", "Agendados", "Concluídos"];

const ServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("Solicitados");
  const [viewMode, setViewMode] = useState("servicos"); // novo: "servicos" | "calendario" | "historico"

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

  const filtrarServicosPorStatus = () => {
    switch (abaSelecionada) {
      case "Solicitados":
        return servicos.filter(s => s.status === "SOLICITADO");
      case "Agendados":
        return servicos.filter(s => s.status === "ACEITO");
      case "Concluídos":
        return servicos.filter(s => s.status === "CONCLUIDO");
      default:
        return [];
    }
  };
  const toggleView = (target) => {
  setViewMode((prev) => (prev === target ? "servicos" : target));
};

  return (
    <div className="servicos-page-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => toggleView("calendario")}>
  <span className="icon">📅</span>
  <span className="label">Exibir Calendário</span>
</div>
<div className="sidebar-item" onClick={() => toggleView("historico")}>
  <span className="icon">🕘</span>
  <span className="label">Exibir Histórico</span>
</div>
        <div className="sidebar-item" onClick={() => toggleView("servicos")}>
          <span className="icon">📋</span>
          <span className="label">Exibir Serviços</span>
        </div>
      </div>

      {/* Conteúdo à direita */}
      <div className="servicos-page-container">
        {viewMode === "calendario" && (
          <div className="tela-expandida">
            <CalendarioServicos servicos={servicos} />
          </div>
        )}

        {viewMode === "historico" && (
          <div className="tela-expandida">
            <HistoricoServicosPage servicos={servicos} />
          </div>
        )}

        {viewMode === "servicos" && (
          <div className="servicos-content">
            <h2 className="titulo-servicos">Minhas Solicitações</h2>

            <div className="abas-container">
              {TABS.map(tab => (
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
                <p className="mensagem-vazia">
                  {abaSelecionada === "Solicitados" && "Você não tem serviços solicitados."}
                  {abaSelecionada === "Agendados" && "Você não tem serviços agendados."}
                  {abaSelecionada === "Concluídos" && "Você ainda não tem serviços concluídos."}
                </p>
              ) : (
                filtrarServicosPorStatus().map(servico => (
                  <div key={servico.id} className="servico-card">
                    <div className="icone-servico">🛠️</div>
                    <div>
                      <h4>{servico.nome}</h4>
                      <p>Status: {servico.status}</p>
                      <p>{servico.descricao}</p>
                    </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicosPage;
