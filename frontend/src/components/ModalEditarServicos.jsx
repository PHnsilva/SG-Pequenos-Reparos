import { useState, useEffect } from 'react';
import { atualizarServico } from '../services/servicoService';
import { listarTipos } from '../services/tipoService';
import Input from './Input';
import Button from './Button';
import Label from './Label';
import '../styles/components/ModalEditarServicos.css';

const ModalEditarServicos = ({ servico, onClose, onAtualizado }) => {
  const [tiposServico, setTiposServico] = useState([]);
  const [formData, setFormData] = useState({
    nome: servico.nome || '',
    descricao: servico.descricao || '',
    tipoServicoId: servico.tipoServicoId || '',
    clienteId: servico.clienteId,
    emailContato: servico.emailContato || '',
    telefoneContato: servico.telefoneContato || '',
    diasDisponiveisCliente: servico.diasDisponiveisCliente || [],
    data: servico.data ? new Date(servico.data).toISOString().split('T')[0] : '',
    horario: servico.horario ? servico.horario.slice(0, 5) : '',
    status: servico.status || 'SOLICITADO',
  });

  const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];

  // Mock de horários ocupados para exemplo; ideal buscar do backend
  const horariosIndisponiveis = [
    // Formato "YYYY-MM-DD HH:mm"
    '2025-06-21 10:00',
    '2025-06-22 09:00',
  ];

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await listarTipos();
        setTiposServico(res.data);
      } catch (error) {
        console.error("Erro ao buscar tipos de serviço:", error);
      }
    };
    fetchTipos();
  }, []);

  useEffect(() => {
    if (
      typeof servico.tipoServico === 'string' &&
      !formData.tipoServicoId &&
      tiposServico.length > 0
    ) {
      const tipo = tiposServico.find((t) => t.nome === servico.tipoServico);
      if (tipo) {
        setFormData((prev) => ({ ...prev, tipoServicoId: tipo.id }));
      }
    }
  }, [tiposServico]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (dia) => {
    const dias = formData.diasDisponiveisCliente.includes(dia)
      ? formData.diasDisponiveisCliente.filter((d) => d !== dia)
      : [...formData.diasDisponiveisCliente, dia];
    setFormData({ ...formData, diasDisponiveisCliente: dias });
  };

  const handleDataHorarioChange = (e) => {
    const [data, horario] = e.target.value.split(' ');
    setFormData({ ...formData, data, horario });
  };

  const getProximos7Dias = () => {
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() + i);
      dias.push(d.toISOString().split('T')[0]);
    }
    return dias;
  };

  const getHorariosDisponiveis = (data) => {
    const horarios = [];
    for (let h = 8; h <= 18; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return horarios;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await atualizarServico(servico.id, formData);
      alert('Serviço atualizado com sucesso!');
      onAtualizado();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      alert('Erro ao atualizar serviço.');
    }
  };
  const getProximos14Dias = () => {
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() + i);
      dias.push(d.toISOString().split('T')[0]);
    }
    return dias;
  };

  const handleCheckboxDataChange = (data) => {
    const atualizados = formData.diasDisponiveisCliente.includes(data)
      ? formData.diasDisponiveisCliente.filter(d => d !== data)
      : [...formData.diasDisponiveisCliente, data];
    setFormData({ ...formData, diasDisponiveisCliente: atualizados });
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Editar Serviço</h2>
        <form onSubmit={handleSubmit} className="form-editar-servico">
          <div className="form-coluna">
            <div className="input-card">
              <Input label="Nome" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className="input-card">
              <Label htmlFor="tipoServicoId">Tipo de Serviço:</Label>
              <select
                name="tipoServicoId"
                value={formData.tipoServicoId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Selecione o tipo de serviço</option>
                {tiposServico.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                ))}
              </select>
            </div>

            <div className="input-card">
              <Label htmlFor="descricao">Problema:</Label>
              <select
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!formData.tipoServicoId}
              >
                <option value="">Selecione um problema</option>
                {/* Exemplos de problemas genéricos por tipo */}
                {formData.tipoServicoId === '1' && (
                  <>
                    <option value="Falta de energia">Falta de energia</option>
                    <option value="Tomada não funciona">Tomada não funciona</option>
                  </>
                )}
                {formData.tipoServicoId === '2' && (
                  <>
                    <option value="Torneira vazando">Torneira vazando</option>
                    <option value="Entupimento">Entupimento</option>
                  </>
                )}
              </select>
            </div>

            <div className="input-card">
              <Label htmlFor="status">Status:</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="SOLICITADO">Solicitado</option>
                <option value="ACEITO">Aceito</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="RECUSADO">Recusado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
          </div>

          <div className="form-coluna">
            <div className="input-card">
              <Label htmlFor="dataHorario">Escolha uma data e horário:</Label>
              <select
                name="dataHorario"
                value={`${formData.data} ${formData.horario}`}
                onChange={handleDataHorarioChange}
                className="input-field"
                required
              >
                <option value="">Selecione...</option>
                {getProximos7Dias().map((data) =>
                  getHorariosDisponiveis(data).map((hora) => {
                    const dataHora = `${data} ${hora}`;
                    return (
                      <option
                        key={dataHora}
                        value={dataHora}
                        disabled={horariosIndisponiveis.includes(dataHora)}
                      >
                        {data} às {hora}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div className="input-card">
              <Label>Outros dias disponíveis do cliente:</Label>
              <div className="dias-checkboxes" style={{ flexDirection: 'column', maxHeight: '220px', overflowY: 'auto' }}>
                {getProximos14Dias().map((data) => {
                  const diaSemana = new Date(data).toLocaleDateString('pt-BR', { weekday: 'long' });
                  const formatado = `${data} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`;
                  return (
                    <label key={data} className="checkbox-item" style={{ width: '100%' }}>
                      <input
                        type="checkbox"
                        value={data}
                        checked={formData.diasDisponiveisCliente.includes(data)}
                        onChange={() => handleCheckboxDataChange(data)}
                      />
                      {formatado}
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="modal-buttons">
            <Button variant="cancelar" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="salvar" type="submit">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarServicos;
