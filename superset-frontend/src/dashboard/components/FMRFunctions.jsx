import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import axios from 'axios';  // Asegúrate de tener axios instalado y correctamente importado

function QAModal() {
  const [showQAModal, setShowQAModal] = useState(false);
  const [qaText, setQaText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto de recargar la página
    console.log("Texto enviado:", qaText);

    const apiBaseUrl = 'https://tu-api-url.com';  // Reemplaza con la URL de tu API
    const loginData = {
      username: "admin",
      password: "JusasaJ313414J",
      provider: "db",
      refresh: true
    };
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };

    try {
     // const response = await axios.post(`${apiBaseUrl}/api/v1/security/login`, loginData, { headers });
      console.log("Respuesta de la API:", response.data);
      // Aquí puedes manejar la respuesta de la API
    } catch (error) {
      console.error("Error al llamar a la API:", error);
      // Aquí puedes manejar los errores de la llamada a la API
    }

    setQaText(''); // Limpiar el campo de texto
  };

  const modalContent = (
    <Modal
      isOpen={showQAModal}
      onRequestClose={() => setShowQAModal(false)}
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

  return (
    <>
      <button onClick={() => setShowQAModal(true)}>Q&A</button>
      {ReactDOM.createPortal(modalContent, document.getElementById('qa-modal-root'))}
    </>
  );
}

export default QAModal;
