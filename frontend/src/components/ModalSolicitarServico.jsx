import { useState, useEffect } from 'react';
import { listarTipos } from '../services/tipoService';
import { getUserProfile } from '../services/authService';
import { solicitarServico } from '../services/servicoService';
import Button from './Button';
import '../styles/components/ModalSolicitarServico.css';

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const ModalSolicitarServico = ({ onClose, onServicoCriado }) => {
  const [descricao, setDescricao] = useState('');
  const [descricaoPersonalizada, setDescricaoPersonalizada] = useState('');
  const [tipoServicoId, setTipoServicoId] = useState('');
  const [diaEspecifico, setDiaEspecifico] = useState('');
  const [outrosDiasSelecionados, setOutrosDiasSelecionados] = useState([]); // ['2025-06-26', ...]
  const [horario, setHorario] = useState('');
  const [tiposServico, setTiposServico] = useState([]);
  const [cliente, setCliente] = useState(null);

  // Mapeamento tipo → problemas
  const problemasPorTipo = {
    'Pintura Residencial e Predial': [
      'Tinta descascando ou manchada',
      'Mofo ou bolhas nas paredes',
      'Renovar fachada externa',
      'Pintura mal feita por outro profissional'
    ],
    'Montagem e Instalação de Estruturas': [
      'Montar móveis novos',
      'Box solto ou mal vedado',
      'Fixar TV ou suportes com segurança'
    ],
    'Instalações Elétricas Prediais': [
      'Tomadas sem funcionar',
      'Disjuntor desarmando',
      'Instalar chuveiro ou sensores de presença'
    ],
    'Manutenção Hidráulica e Encanamento': [
      'Torneira ou chuveiro pingando',
      'Vazamento ou entupimento',
      'Instalar novo vaso sanitário'
    ],
    'Manutenção Predial Corretiva': [
      'Porta ou janela com defeito',
      'Fechadura emperrada',
      'Infiltração ou rachaduras'
    ],
    'Revestimentos e Acabamentos': [
      'Piso rachado ou solto',
      'Rejunte danificado',
      'Substituir rodapés ou azulejos'
    ],
    'Iluminação Técnica e Decorativa': [
      'Lâmpadas piscando',
      'Instalar trilhos de LED',
      'Iluminação fraca no ambiente'
    ]
  };

  useEffect(() => {
    fetchTiposServico();
    fetchClienteLogado();
  }, []);

  const fetchTiposServico = async () => {
    try {
      const response = await listarTipos();
      setTiposServico(response.data);
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
    }
  };

  const fetchClienteLogado = async () => {
    try {
      const perfil = await getUserProfile();
      setCliente(perfil);
    } catch (error) {
      console.error('Erro ao buscar perfil do cliente:', error);
    }
  };

  // Gera 8 datas e irá pular a primeira
  const gerarOpcoesDeDatas = () => {
    if (!diaEspecifico) return [];
    const start = new Date(diaEspecifico);
    return Array.from({ length: 8 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i + 1);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const weekday = WEEKDAYS[d.getDay()];
      return {
        value: d.toISOString().slice(0, 10),
        label: `${dd}/${mm} – ${weekday}`
      };
    });
  };

  const dateOptionsSkipFirst = gerarOpcoesDeDatas().slice(1);

  const toggleOutroDia = (value) => {
    setOutrosDiasSelecionados(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const descricaoFinal = descricao === 'Outro'
      ? descricaoPersonalizada
      : descricao;

    try {
      await solicitarServico({
        nome: 'Solicitação de Serviço',
        descricao: descricaoFinal,
        tipoServicoId,
        clienteId: cliente.id,
        emailContato: cliente.email,
        telefoneContato: cliente.telefone,
        diasDisponiveisCliente: {
          diaEspecifico,
          outrosDias: outrosDiasSelecionados
        },
        horario
      });
      alert('Serviço solicitado com sucesso!');
      onServicoCriado();
    } catch (error) {
      console.error('Erro ao solicitar serviço:', error);
      alert('Falha ao solicitar serviço.');
    }
  };

  // Descobre os problemas para o tipo selecionado
  const tipoSelecionado = tiposServico.find(t => t.id === Number(tipoServicoId));
  const problemas = tipoSelecionado
    ? problemasPorTipo[tipoSelecionado.nome] || []
    : [];

  return (
    <div className="modal-solicitar-overlay">
      <div className="modal-solicitar-content">
        <h2 className="modal-solicitar-title">Solicitar Novo Serviço</h2>
        <form onSubmit={handleSubmit} className="modal-solicitar-form">

          {/* Tipo de serviço */}
          <label>Tipo de serviço:</label>
          <select
            value={tipoServicoId}
            onChange={e => {
              setTipoServicoId(e.target.value);
              setDescricao('');
              setDescricaoPersonalizada('');
            }}
            required
          >
            <option value="">Selecione o tipo de serviço</option>
            {tiposServico.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>

          {/* Problemas */}
          {tipoServicoId && (
            <>
              <label>Problema encontrado:</label>
              <select
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
              >
                <option value="">Selecione um problema</option>
                {problemas.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
                <option value="Outro">Outro</option>
              </select>
            </>
          )}

          {/* Dia específico */}
          <label>Data específica:</label>
          <input
            type="date"
            value={diaEspecifico}
            onChange={e => {
              setDiaEspecifico(e.target.value);
              setOutrosDiasSelecionados([]);
            }}
            required
          />

          {/* Outros dias */}
          {diaEspecifico && (
            <>
              <label>Outros dias disponíveis:</label>
              <div className="modal-solicitar-checkbox-group">
                {dateOptionsSkipFirst.map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={outrosDiasSelecionados.includes(opt.value)}
                      onChange={() => toggleOutroDia(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Horário */}
          <label>Horário desejado:</label>
          <select
            value={horario}
            onChange={e => setHorario(e.target.value)}
            required
          >
            <option value="">Selecione o horário</option>
            {Array.from({ length: 11 }, (_, i) => {
              const hour = 8 + i;
              const h = `${String(hour).padStart(2, '0')}:00`;
              return <option key={h} value={h}>{h}</option>;
            })}
          </select>

          {/* Ações */}
          <div className="modal-solicitar-actions">
            <Button type="button" variant="cancelar" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="salvar">
              Solicitar
            </Button>
          </div>

          {/* Observação */}
          <p className="modal-solicitar-note">
            📱 *Observação: mais detalhes adicionais serão discutidos via WhatsApp.*
          </p>
        </form>
      </div>
    </div>
  );
};

export default ModalSolicitarServico;
