import { useState, useEffect } from "react";
import { aceitarServico } from "../../services/servicoService";
import { getUserProfile } from "../../services/authService";
import { getItinerario } from "../../services/itinerarioService";
import "../../styles/components/ModalAgendarServico.css";
import Input from "../Input";
import Button from "../Button";

const ModalAgendarServico = ({ servico, onClose, onServicoAtualizado }) => {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerario, setItinerario] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await getItinerario();
        setItinerario(response.data);
      } catch (err) {
        console.error("Erro ao carregar itinerário:", err);
      }
    })();
  }, []);

  const handleAgendar = async () => {
    if (!data || !horario) {
      alert("Por favor, preencha data e horário.");
      return;
    }

    setLoading(true);
    try {
      const admin = await getUserProfile();
      await aceitarServico(servico.id, admin.id, data, horario);
      alert("Serviço agendado com sucesso!");
      onServicoAtualizado();
      onClose();
    } catch (error) {
      console.error("Erro ao agendar serviço:", error);
      alert("Erro ao agendar serviço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content agendar-servico">
        <h2>Agendar Serviço</h2>
        <p><strong>Serviço:</strong> {servico.nome}</p>
        <p><strong>Problema:</strong> {servico.problemaSelecionado}</p>
        <p><strong>Cliente:</strong> {servico.clienteNome}</p>

        <Input
          label="Data"
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
        />
        <Input
          label="Horário"
          type="time"
          value={horario}
          onChange={e => setHorario(e.target.value)}
        />

        <div className="modal-buttons">
          <Button onClick={handleAgendar} disabled={loading}>
            {loading ? "Agendando..." : "Agendar"}
          </Button>
          <Button variant="cancelar" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgendarServico;
