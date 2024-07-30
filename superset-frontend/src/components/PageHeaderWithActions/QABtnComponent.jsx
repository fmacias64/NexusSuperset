import React, { useState } from 'react';
import axios from 'axios';

const QABtnComponent = () => {
  const [qaInputVisible, setQaInputVisible] = useState(false);
  const [qaInput, setQaInput] = useState('');

  const handleShowQAClick = () => {
    setQaInputVisible(true);
  };

  const handleSubmitQAClick = () => {
    if (qaInput.trim()) {
      console.log('Pregunta enviada:', qaInput);
      axios.post('http://localhost:8000/qa_pregunta', {
        id: 0, // Usualmente, el ID no se envía al crear, depende de tu backend
        user_id: 1, // Este valor debería ser dinámico, según el usuario autenticado
        dashboard_id: 10, // Esto también debería ser dinámico según el contexto de la aplicación
        question: qaInput
      })
      .then(response => {
        console.log('Respuesta de la API:', response.data);
        alert('Pregunta enviada: ' + qaInput);
        setQaInput('');
        setQaInputVisible(false);
      })
      .catch(error => {
        console.error('Error al enviar la pregunta:', error);
        alert('Hubo un error al enviar tu pregunta.');
      });
    } else {
      alert('Por favor, escribe una pregunta antes de enviar.');
    }
  };
  

  return (
    <div>
      <button onClick={handleShowQAClick}>Q&A</button>
      {qaInputVisible && (
        <div className="dashboard-qa-input-div">
          <textarea
           
            value={qaInput}
            onChange={(e) => setQaInput(e.target.value)}
            placeholder="Escribe tu pregunta"
            className="qa-textarea" /* Aplica la clase CSS aquí */
            rows="4"
          />
          <button onClick={handleSubmitQAClick}>Enviar</button>
        </div>
      )}
    </div>
  );
};

export default QABtnComponent;
