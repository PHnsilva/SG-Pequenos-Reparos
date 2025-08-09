import { useState } from "react";
import ModalDetalhesServico from "../../components/ModalDetalhesServico";
import Button from "../../components/Button";
import "../../styles/pages/MeusAgendamentos.css";

const MeusAgendamentosAdmin = ({ servicos = [] }) => {
  const [filtroData, setFiltroData] = useState("");
  const [filtroTelefone, setFiltroTelefone] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(null);

  // usa prop servicos em vez de fetch interno
  const servicosAgendados = servicos.filter(s => s.status === "ACEITO");

  const normalizarTelefone = (t) => (t || "").replace(/^\+55/, "").replace(/\D/g, "");
  const normalizedFilter = normalizarTelefone(filtroTelefone);

  const servicosFiltrados = servicosAgendados
    .filter(s => (filtroData ? s.data === filtroData : true))
    .filter(s => {
      if (!normalizedFilter) return true;
      return normalizarTelefone(s.telefoneContato).includes(normalizedFilter);
    })
    .sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`));

  return (
    <div className="agendamentos-wrapper">
      <h2 className="titulo-agendamentos">Agendamentos</h2>

      <div className="filtros-agendamentos" style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
        <div className="filtro-data">
          <label htmlFor="filtroData">Filtrar por data:</label>
          <input
            type="date"
            id="filtroData"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
          />
        </div>

        <div className="filtro-telefone">
          <label htmlFor="filtroTelefoneAg">Filtrar por telefone:</label>
          <input
            id="filtroTelefoneAg"
            type="text"
            placeholder="Ex.: 3199... (ignora +55)"
            value={filtroTelefone}
            onChange={e => setFiltroTelefone(e.target.value)}
          />
        </div>
      </div>

      {servicosFiltrados.length === 0 ? (
        <p className="mensagem-vazia">Nenhum serviço agendado.</p>
      ) : (
        <div className="lista-agendamentos">
          {servicosFiltrados.map(servico => (
            <div key={servico.id} className="card-agendamento">
              <div>
                <h4>{servico.nome}</h4>
                <p><strong>Cliente:</strong> {servico.clienteNome}</p>
                <p><strong>Telefone:</strong> {servico.telefoneContato}</p>
                <p><strong>Data:</strong> {servico.data} às {servico.horario}</p>
              </div>
              <Button onClick={() => setModalDetalhes(servico)}>
                Ver Detalhes
              </Button>
            </div>
          ))}
        </div>
      )}

      {modalDetalhes && (
        <ModalDetalhesServico
          servico={modalDetalhes}
          onClose={() => setModalDetalhes(null)}
        />
      )}
    </div>
  );
};

export default MeusAgendamentosAdmin;