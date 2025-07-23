import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarioServicos from "../components/CalendarioServicos";
import ModalSolicitarServico from "../components/ModalSolicitarServico";
import { listarServicos } from "../services/servicoService";
import Button from "../components/Button";
import "../styles/pages/ServicosPage.css";

const TABS = ["Solicitados", "Agendados", "Concluídos"];

const ServicosPage = () => {
  const [servicos, setServicos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("Solicitados");

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

  const handleAbrirModal = () => setIsModalOpen(true);
  const handleFecharModal = () => setIsModalOpen(false);

  const handleServicoCriado = () => {
    fetchServicos();
    handleFecharModal();
  };

  const filtrarServicosPorStatus = () => {
    switch (abaSelecionada) {
      case "Solicitados":
        return servicos.filter(s => s.status === "solicitado");
      case "Agendados":
        return servicos.filter(s => s.status === "agendado");
      case "Concluídos":
        return servicos.filter(s => s.status === "concluido");
      default:
        return [];
    }
  };

  return (
    <div className="servicos-page-container">
      {/* Lado esquerdo: calendário */}
      <div className="servicos-calendar">
        <CalendarioServicos servicos={servicos} />
      </div>

      <div className="servicos-content">
        {/* Título */}
        <h2 className="titulo-servicos">Minhas Solicitações</h2>

        {/* Abas */}
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

        {/* Lista de cards */}
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
                  <h4>{servico.titulo}</h4>
                  <p>Status: {servico.status}</p>
                  <p>{servico.descricao}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botões */}
        <div className="servicos-buttons">
          <Button variant="contratar" onClick={handleAbrirModal}>
            Solicitar Novo Serviço
          </Button>
          <Link
            to="/cliente/historico"
            className="btn-component btn-link-button"
          >
            Histórico de Serviços
          </Link>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <ModalSolicitarServico
            onClose={handleFecharModal}
            onServicoCriado={handleServicoCriado}
          />
        )}
      </div>

    </div>
  );
};

export default ServicosPage;
