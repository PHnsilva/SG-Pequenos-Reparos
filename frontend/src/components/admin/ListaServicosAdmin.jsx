import { useState } from "react";
import ModalAgendarServico from "./ModalAgendarServico";
import ModalConfirmarConclusao from "../ModalConfirmarConclusao";
import ModalCancelarServico from "../ModalCancelarServico";
import ModalDetalhesServico from "../ModalDetalhesServico";
import Button from "../Button";
import CardServico from "../CardServico";
import {
  cancelarServico,
  concluirServico,
} from "../../services/servicoService";
import { toast } from "react-toastify";
import "../../styles/components/ListaServicos.css";
import { CheckCircle } from "lucide-react";

const ListaServicosAdmin = ({ servicos, onServicoAtualizado }) => {
  const [servicoAtual, setServicoAtual] = useState(null);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);
  const [mostrarModalAgendar, setMostrarModalAgendar] = useState(false);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarModalConcluir, setMostrarModalConcluir] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [concluindo, setConcluindo] = useState(false);
  const [verificados, setVerificados] = useState([]);

  const abrirModal = (modalSetter, servico) => {
    setServicoAtual(servico);
    modalSetter(true);
  };

  const toggleVerificado = (id) => {
    setVerificados((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const confirmarCancelamento = async (motivo) => {
    setCancelando(true);
    try {
      await cancelarServico(servicoAtual.id, motivo);
      toast.success("Serviço cancelado com sucesso!");
      onServicoAtualizado();
    } catch (error) {
      toast.error("Erro ao cancelar serviço.");
    } finally {
      setCancelando(false);
      setMostrarModalCancelar(false);
    }
  };

  const confirmarConclusao = async () => {
    setConcluindo(true);
    try {
      await concluirServico(servicoAtual.id);
      toast.success("Serviço concluído com sucesso!");
      onServicoAtualizado();
    } catch (error) {
      toast.error("Erro ao concluir serviço.");
    } finally {
      setConcluindo(false);
      setMostrarModalConcluir(false);
    }
  };

  const renderAcoes = (servico) => {
    const { status } = servico;
    const acoes = [];

    acoes.push(
      <Button key="detalhes" variant="detalhes" onClick={() => abrirModal(setMostrarModalDetalhes, servico)}>
        Detalhes
      </Button>
    );

    if (status === "SOLICITADO") {
      acoes.push(
        <Button key="cancelar" variant="recusar" onClick={() => abrirModal(setMostrarModalCancelar, servico)}>
          Cancelar
        </Button>,
        <Button key="aceitar" variant="aceitar" onClick={() => abrirModal(setMostrarModalAgendar, servico)}>
          Aceitar
        </Button>
      );
    }

    if (status === "ACEITO") {
      acoes.push(
        <Button key="cancelar" variant="cancelar" onClick={() => abrirModal(setMostrarModalCancelar, servico)}>
          Cancelar
        </Button>,
        <Button key="concluir" variant="concluir" onClick={() => abrirModal(setMostrarModalConcluir, servico)}>
          Concluir
        </Button>
      );
    }

    return <div className="lista-servicos-botoes">{acoes}</div>;
  };

  return (
    <div className="lista-servicos-container">
      {servicos.map((servico) => {
        const verificado = verificados.includes(servico.id);
        return (
          <div
            key={servico.id}
            className={`lista-servicos-card ${verificado ? "verificado" : ""}`}
          >
            <div className="verificar-icone" onClick={() => toggleVerificado(servico.id)}>
              <CheckCircle size={24} color={verificado ? "#2ecc71" : "#ccc"} />
            </div>
            <CardServico servico={servico} tipo={servico.status.toLowerCase()} />
            {renderAcoes(servico)}
          </div>
        );
      })}

      {mostrarModalDetalhes && servicoAtual && (
        <ModalDetalhesServico servico={servicoAtual} onClose={() => setMostrarModalDetalhes(false)} />
      )}

      {mostrarModalAgendar && servicoAtual && (
        <ModalAgendarServico
          servico={servicoAtual}
          onClose={() => setMostrarModalAgendar(false)}
          onServicoAtualizado={onServicoAtualizado}
        />
      )}

      {mostrarModalCancelar && servicoAtual && (
        <ModalCancelarServico
          onConfirmar={confirmarCancelamento}
          onClose={() => setMostrarModalCancelar(false)}
          loading={cancelando}
        />
      )}

      {mostrarModalConcluir && servicoAtual && (
        <ModalConfirmarConclusao
          onConfirmar={confirmarConclusao}
          onClose={() => setMostrarModalConcluir(false)}
          loading={concluindo}
        />
      )}
    </div>
  );
};

export default ListaServicosAdmin;
