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
    diaEspecifico: servico.diaEspecifico || '',
    outrosDias: servico.outrosDias || [],
    problemaSelecionado: servico.problemaSelecionado || '',
    horario: servico.horario || '',
    status: servico.status || 'SOLICITADO',
    motivoCancelamento: servico.motivoCancelamento || ''
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await listarTipos();
        setTiposServico(res.data);
      } catch (error) {
        console.error("Erro ao buscar tipos de serviço:", error);
      }
    })();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxDataChange = data => {
    const updated = formData.outrosDias.includes(data)
      ? formData.outrosDias.filter(d => d !== data)
      : [...formData.outrosDias, data];
    setFormData(prev => ({ ...prev, outrosDias: updated }));
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

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      tipoServicoId: formData.tipoServicoId,
      clienteId: formData.clienteId,
      emailContato: formData.emailContato,
      telefoneContato: formData.telefoneContato,
      diaEspecifico: formData.diaEspecifico,
      outrosDias: formData.outrosDias,
      problemaSelecionado: formData.problemaSelecionado,
      horario: formData.horario,
      status: formData.status,
      motivoCancelamento: formData.motivoCancelamento
    };
    try {
      await atualizarServico(servico.id, payload);
      alert('Serviço atualizado com sucesso!');
      onAtualizado();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      alert('Erro ao atualizar serviço.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content editar-servico">
        <h2 className="modal-title">Editar Serviço</h2>
        <form onSubmit={handleSubmit} className="form-editar-servico">
          <div className="form-coluna">
            <Input label="Nome" name="nome" value={formData.nome} onChange={handleChange} required />
            <Input label="Descrição" name="descricao" value={formData.descricao} onChange={handleChange} required />
            <Label htmlFor="tipoServicoId">Tipo de Serviço:</Label>
            <select name="tipoServicoId" value={formData.tipoServicoId} onChange={handleChange} required>
              <option value="">Selecione o tipo</option>
              {tiposServico.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <Input label="Problema Selecionado" name="problemaSelecionado" value={formData.problemaSelecionado} onChange={handleChange} required />
          </div>

          <div className="form-coluna">
            <Input label="Data Específica" type="date" name="diaEspecifico" value={formData.diaEspecifico} onChange={handleChange} required />
            <Input label="Horário" type="time" name="horario" value={formData.horario} onChange={handleChange} required />

            <Label>Outros Dias Disponíveis:</Label>
            <div className="dias-checkboxes">
              {getProximos14Dias().map(data => (
                <label key={data} className="checkbox-item">
                  <input type="checkbox" checked={formData.outrosDias.includes(data)} onChange={() => handleCheckboxDataChange(data)} />
                  {data}
                </label>
              ))}
            </div>

            <Label htmlFor="status">Status:</Label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="SOLICITADO">Solicitado</option>
              <option value="ACEITO">Aceito</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="RECUSADO">Recusado</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>

            {formData.status === 'CANCELADO' && (
              <Input label="Motivo Cancelamento" name="motivoCancelamento" value={formData.motivoCancelamento} onChange={handleChange} />
            )}
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
