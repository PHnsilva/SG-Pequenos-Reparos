import React from "react";
import "../styles/components/ModalAvisoZAP.css";

const ModalAvisoZAP = ({ onClose }) => {
  const zapLink = "https://wa.me/5599999999999"; // substitua pelo número do Gelson

  return (
    <div className="modal-zap-overlay">
      <div className="modal-zap">
        <h3>Obrigado pela solicitação!</h3>
        <p>Já vamos te mandar uma mensagem. Mas se quiser, pode conversar com nosso prestador agora mesmo:</p>
        <a href={zapLink} target="_blank" rel="noopener noreferrer" className="btn-zap-link">
          Falar com Gelson no WhatsApp 📲
        </a>
        <button className="btn-fechar-zap" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default ModalAvisoZAP;
