import { useState } from "react";
import ModalDetalhesServico from "../../components/ModalDetalhesServico";
import Button from "../../components/Button";
import "../../styles/pages/MeusAgendamentos.css";

const MeusAgendamentosAdmin = ({ servicos = [] }) => {
  const [filtroData, setFiltroData] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(null);

  // usa prop servicos em vez de fetch interno
  const servicosAgendados = servicos.filter(s => s.status === "ACEITO");

  const servicosFiltrados = servicosAgendados
    .filter(s => (filtroData ? s.data === filtroData : true))
    .sort((a, b) => new Date(`${a.data}T${a.horario}`) - new Date(`${b.data}T${b.horario}`));

  return (
    <div className="agendamentos-wrapper">
      <h2 className="titulo-agendamentos">Agendamentos</h2>

      <div className="filtro-data">
        <label htmlFor="filtroData">Filtrar por data:</label>
        <input
          type="date"
          id="filtroData"
          value={filtroData}
          onChange={e => setFiltroData(e.target.value)}
        />
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
