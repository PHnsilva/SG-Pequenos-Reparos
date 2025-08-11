import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Label from '../components/Label';
import "../styles/pages/CadastroPage.css";
import api from '../services/api';

const CadastroPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    username: '',
    tipo: 'CLIENTE',
    senha: ''
  });

  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  const handleUnifiedChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      nome: value,
      username: value
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendSmsCode = async () => {
    setError('');
    try {
      await api.post('/notificacao/send-sms', null, {
        params: { telefone: formData.telefone }
      });
      alert('Código de verificação enviado para seu telefone.');
      setCodeSent(true);
    } catch (error) {
      setError('Erro ao enviar SMS. Verifique o número.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (!codeSent) {
      sendSmsCode();
      return;
    }

    try {
      await api.post('/usuarios/cadastro', formData, {
        params: { code: verificationCode }
      });
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      setError('Erro no cadastro. Verifique seus dados ou o código.');
    }
  };

  return (
    <div className="cadastro-page-container">
      <div className="cadastro-box-form">
        <h2 className="cadastro-box-title">Cadastro</h2>
        {error && <p className="cadastro-box-error">{error}</p>}
        <form onSubmit={handleSubmit} className="cadastro-box-form-element">
          {/* Campo único que atualiza nome e username */}
          <Input
            label="Nome / Nome de Usuário"
            name="nomeUsername"
            value={formData.nome}
            onChange={handleUnifiedChange}
            required
          />

          <Input
            label="Telefone (+55...)"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
          />

          <Input
            label="Senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            type="password"
          />

          <Input
            label="Confirmar Senha"
            name="confirmarSenha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            type="password"
          />

          {codeSent && (
            <Input
              label="Código de Verificação"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          )}

          <Button type="submit" variant="cadastrar">
            {codeSent ? 'Cadastrar' : 'Enviar Código'}
          </Button>

          <Label className="cadastro-box-login-label">Já possui Cadastro?</Label>
          <Link to="/login" className="cadastro-box-login-link">Entrar</Link>
        </form>
      </div>
    </div>
  );
};

export default CadastroPage;
