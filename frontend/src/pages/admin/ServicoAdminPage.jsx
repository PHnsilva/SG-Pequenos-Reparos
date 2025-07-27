import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CalendarioServicosAdmin from "../../components/admin/CalendarioServicosAdmin";
import HistoricoServicosAdmin from "../../pages/HistoricoServicosPage";
import ListaServicosAdmin from "../../components/admin/ListaServicosAdmin";
import { listarServicos } from "../../services/servicoService";
import Button from "../../components/Button";
import "../../styles/pages/ServicosPage.css";

const STATUS_ABAS = [
  { codigo: "ACEITO", label: "Aceitos", icon: "✅" },
  { codigo: "CONCLUIDO", label: "Concluídos", icon: "🏁" },
  { codigo: "CANCELADO", label: "Cancelados", icon: "❌" },
  { codigo: "RECUSADO", label: "Recusados", icon: "🚫" },
];

const ServicoAdminPage = () => {
  const [servicos, setServicos] = useState([]);
  const [viewMode, setViewMode] = useState("servicos"); // 'servicos' | 'calendario' | 'historico'
  const [statusSelecionado, setStatusSelecionado] = useState("ACEITO");

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

  const servicosFiltrados = servicos.filter(s => s.status === statusSelecionado);

  return (
    <div className="servicos-page-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => toggleView("calendario") }>
          <span className="icon">📅</span>
          <span className="label">Calendário</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("historico") }>
          <span className="icon">🕘</span>
          <span className="label">Histórico</span>
        </div>
        <div className="sidebar-item" onClick={() => toggleView("servicos") }>
          <span className="icon">📋</span>
          <span className="label">Serviços</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="servicos-page-container">
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
                />
              )}
            </div>

            <div className="servicos-buttons">
              <Button variant="contratar" onClick={fetchServicos}>
                Atualizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicoAdminPage;
