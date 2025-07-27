import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/authService';
import '../styles/components/ModalDetalhesServico.css';
import Button from './Button';

const ModalDetalhesServico = ({ servico, onClose }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserProfile();
        setUsuario(res);
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      }
    })();
  }, []);

  const formatarData = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString('pt-BR') : 'Não especificada';

  const formatarHorario = (horario) =>
    horario ? horario.slice(0, 5) : 'Não especificado';

  return (
    <div className="modal-detalhes-overlay">
      <div className="modal-detalhes-content">
        <h2 className="modal-detalhes-titulo">Detalhes do Serviço</h2>

        <div className="modal-detalhes-info">
          <p><strong>Nome:</strong> {servico.nome}</p>
          <p><strong>Descrição:</strong> {servico.descricao}</p>
          <p><strong>Tipo:</strong> {servico.tipoServico}</p>
          <p><strong>Problema Selecionado:</strong> {servico.problemaSelecionado}</p>
          <p><strong>Status:</strong> {servico.status}</p>

          <p><strong>Data Específica:</strong> {formatarData(servico.diaEspecifico)}</p>
          <p><strong>Outras Datas Disponíveis:</strong> {servico.outrosDias?.length
            ? servico.outrosDias.map(formatarData).join(', ')
            : 'Nenhuma'}</p>

          <p><strong>Horário Agendado:</strong> {formatarHorario(servico.horario)}</p>

          <p><strong>Email de Contato:</strong> {servico.emailContato}</p>
          <p><strong>Telefone de Contato:</strong> {servico.telefoneContato}</p>

          {servico.status === 'CANCELADO' && (
            <p><strong>Motivo de Cancelamento:</strong> {servico.motivoCancelamento}</p>
          )}

          {usuario?.tipo === 'CLIENTE' && (
            <p><strong>Prestador:</strong> {servico.administradorNome || 'Não definido'}</p>
          )}

          {usuario?.tipo === 'ADMIN' && (
            <p><strong>Cliente:</strong> {servico.clienteNome}</p>
          )}
        </div>

        <div className="modal-detalhes-botoes">
          <Button variant="cancelar" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhesServico;
