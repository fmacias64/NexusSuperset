import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import axios from 'axios';

type QAModalProps = {
  onClose: () => void;
};

const QAModal: React.FC<QAModalProps> = ({ onClose }) => {
  const [qaText, setQaText] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Texto enviado:", qaText);

    try {
      console.log("Respuesta de la API: éxito simulado");
    } catch (error) {
      console.error("Error al llamar a la API:", error);
    }

    setQaText('');
    onClose();
  };

  const modalContent = (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Q&A Modal"
      style={{
        content: {
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '5px',
          zIndex: '1000',
        },
      }}
    >
      <div>
        <h2>Q&A</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={qaText}
            onChange={(e) => setQaText(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          <button type="submit" style={{ marginTop: '10px' }}>Enviar</button>
        </form>
      </div>
    </Modal>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('qa-modal-root'));
};

export default QAModal;
