import { useState, useEffect } from "react";
import Button from "../components/Button";
import ModalDetalhesServico from "../components/ModalDetalhesServico";
import { listarServicos } from "../services/servicoService";
import "../styles/pages/MeusAgendamentos.css";

const MeusAgendamentosCliente = () => {
  const [servicos, setServicos] = useState([]);
  const [filtroData, setFiltroData] = useState("");
  const [modalDetalhes, setModalDetalhes] = useState(null);

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

  const servicosAgendadosOrdenados = servicos
    .filter((s) => s.status === "ACEITO")
    .filter((s) => {
      if (!filtroData) return true;
      return s.data === filtroData;
    })
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.data}T${a.horario}`);
      const dateTimeB = new Date(`${b.data}T${b.horario}`);
      return dateTimeA - dateTimeB;
    });

  return (
    <div className="agendamentos-wrapper">
      <h2 className="titulo-agendamentos">Meus Agendamentos</h2>

      <div className="filtro-data">
        <label htmlFor="filtroData">Filtrar por data:</label>
        <input
          type="date"
          id="filtroData"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
      </div>

      {servicosAgendadosOrdenados.length === 0 ? (
        <p className="mensagem-vazia">Nenhum serviço agendado encontrado.</p>
      ) : (
        <div className="lista-agendamentos">
          {servicosAgendadosOrdenados.map((servico) => (
            <div key={servico.id} className="card-agendamento">
              <div>
                <h4>{servico.nome}</h4>
                <p><strong>Data:</strong> {servico.data}</p>
                <p><strong>Horário:</strong> {servico.horario}</p>
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

export default MeusAgendamentosCliente;
