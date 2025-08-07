import { useState, useEffect } from "react";
import ModalSolicitarServico from "../components/ModalSolicitarServico";
import ModalLixeira from "../components/ModalLixeira";
import { listarServicos } from "../services/servicoService";
import Button from "../components/Button";
import MeusAgendamentosCliente from "../pages/MeusAgendamentosCliente";
import HistoricoServicosPage from "../pages/HistoricoServicosPage";
import "../styles/pages/ServicosPage.css";

const TABS = ["Solicitados", "Concluídos"];

const ServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("Solicitados");
  const [viewMode, setViewMode] = useState("servicos");
  const [servicosExcluidos, setServicosExcluidos] = useState([]);
  const [showLixeira, setShowLixeira] = useState(false);

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
    setShowLixeira(false);  // fecha lixeira ao trocar de view
    setViewMode((prev) => (prev === target ? "servicos" : target));
  };

  const handleExcluirServico = (servico) => {
    setServicosExcluidos((prev) => [...prev, servico]);
    setServicos((prev) => prev.filter((s) => s.id !== servico.id));
  };

  const filtrarServicosPorStatus = () => {
    if (abaSelecionada === "Solicitados") {
      return servicos.filter((s) => s.status === "SOLICITADO");
    }
    return servicos.filter((s) => s.status === "CONCLUIDO");
  };

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
              <MeusAgendamentosCliente servicos={servicos} />
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

              {/* Abas */}
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

              {/* Lista */}
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
            </div>
          )}
        </div>
      </div>

      {/* ModalLixeira fora de qualquer condição de viewMode */}
      {showLixeira && (
        <ModalLixeira
          onClose={() => setShowLixeira(false)}
          servicosCancelados={servicos.filter((s) => s.status === "CANCELADO")}
          servicosExcluidos={servicosExcluidos}
        />
      )}
    </>
  );
};

export default ServicosPage;
