/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';
// Asegúrate de ajustar la ruta de importación si es necesario
import { 
  findAnyReactComponent, 
  findReactRoot, 
  traverseAndLogChartComponents,
  traverseReactTreeForChart,
  findAppComponent,
  searchComponent,
  findReactComponent,
  isProduction,
  traverseReactTreeForDashboard,
  obtenerChartConfigurationProduccion,
  traverseReactTreeForActivateTab,
  getDashboardIdFromUrl,
  activarTab,
  traverseForCrossFilters,
  searchComponentCF,
  extractCrossFilterDetails
} from 'src/dashboard/components/Dashboard'; 

// Función para producción
// function produccion(chartId) {
  
//   const inicio = findAnyReactComponent();
//   const rootreact = findReactRoot(inicio);
//   const chartConfiguration = obtenerChartConfigurationProduccion(rootreact);
//   console.log('chartConfiguration en producción:', chartConfiguration);

//   const resultado = traverseAndLogChartComponents(rootreact, chartId);
//   return resultado;
// }

// // Función para desarrollo
// function desarrollo(chartId, dashboardId) {
//   const inicio = findAnyReactComponent();
//   const inicio_dev = findAppComponent(inicio);
//   const dashboardComponent = traverseReactTreeForDashboard(inicio_dev); 

// if (dashboardComponent) {
//   const chartConfiguration = dashboardComponent.memoizedProps.chartConfiguration;
//   console.log('chartConfiguration:', chartConfiguration);
// } else {
//   console.log('Dashboard component not found');
// }
//   const target = traverseReactTreeForChart(inicio_dev, 'Chart', dashboardId, chartId);

//   return target ? target.memoizedProps.queriesResponse : null; // Devolver queriesResponse si se encuentra el componente
// }

// Función para producción


// Función para producción
function produccion() {
  const inicio = findAnyReactComponent();
  const rootreact = findReactRoot(inicio);
  const componente_filtro = traverseForCrossFilters(rootreact)
  const filtros_prod = extractCrossFilterDetails(componente_filtro.memoizedProps.crossFilters)
  // Obtener chartConfiguration, asegurándonos de que dashboardComponent existe
  const dashboardComponent = traverseReactTreeForDashboard(rootreact);
  const chartConfiguration = dashboardComponent ? 
    (dashboardComponent.memoizedProps || dashboardComponent.props).chartConfiguration : null;
  
  console.log('chartConfiguration en producción:', chartConfiguration);

  if (!chartConfiguration) {
    console.error('No se pudo obtener chartConfiguration');
    return null;
  }

  const queriesResponses = {};

  // Iterar sobre los chartIds en chartConfiguration
  for (const chartId in chartConfiguration) {
    const resultado = traverseAndLogChartComponents(rootreact, parseInt(chartId, 10));

    // Agregar la información de queriesResponse al JSON correspondiente
    if (resultado && resultado.data) {
      queriesResponses[parseInt(chartId, 10)] = resultado.data;
    }
  }

  // Crear el JSON final con chartConfiguration y queriesResponses
  const resultadoFinal = {
    chartConfiguration,
    queriesResponses,
    filtros_prod
  };

  return resultadoFinal;
}


// async function cargaTabs() {
//   const inicio = findAnyReactComponent();
//   const inicio_dev = findAppComponent(inicio);
//   const dashboardComponent = traverseReactTreeForDashboard(inicio_dev);
//   if (dashboardComponent) {
//     // Obtener chartConfiguration y dashboardInfo, asegurándonos de que existen
//     const chartConfiguration = (dashboardComponent.memoizedProps || dashboardComponent.props).chartConfiguration;
//     const rowstabs = (dashboardComponent.memoizedProps || dashboardComponent.props).dashboardInfo.position_data;
    
//     let primerTabKey = null; 

//     for (const key in rowstabs) {
//       const item = rowstabs[key];
    
//       if (item.type === "TAB") {
//         if (!primerTabKey) {
//           primerTabKey = item.id; // Guardar la clave del primer tab
//         }
        
        
//        await  activarTab(item.id);
        

//         console.log("idtab", item.id);
//       }
//     }
   
//     // Activar el primer tab al final del bucle
//     if (primerTabKey) {
//       await activarTab(primerTabKey);
//     }
//   }
// }







// Función para desarrollo
function desarrollo(dashboardId) {
  const inicio = findAnyReactComponent();
  const inicio_dev = findAppComponent(inicio);
  const dashboardComponent = traverseReactTreeForDashboard(inicio_dev);
  const comp_filtro = searchComponentCF(inicio_dev, 98, 11, "getCrossFilters")
  const filtros_dev = extractCrossFilterDetails(comp_filtro.memoizedProps.crossFilters)

  if (dashboardComponent) {
    // Obtener chartConfiguration y dashboardInfo, asegurándonos de que existen
    const chartConfiguration = (dashboardComponent.memoizedProps || dashboardComponent.props).chartConfiguration;
    const rowstabs = (dashboardComponent.memoizedProps || dashboardComponent.props).dashboardInfo.position_data;
  
    console.log('chartConfiguration:', chartConfiguration);

    const queriesResponses = {};

    // Iterar sobre los chartIds en chartConfiguration
    for (const chartId in chartConfiguration) {
      const target = traverseReactTreeForChart(inicio_dev, 'Chart', dashboardId, parseInt(chartId, 10));
      console.log("target", target);

      // Obtener queriesResponse, asegurándonos de que target existe
      const resultado = target ? (target.memoizedProps || target.props).queriesResponse : null;
      if (resultado && resultado.data) {
        const data = resultado.data[0]; // Asumiendo que solo hay un elemento en la lista
        queriesResponses[chartId] = {
          datasource: data.form_data.datasource,
          viz_type: data.form_data.viz_type,
          colnames: data.colnames,
          rowcount: data.rowcount,
          data: data.data
        };
      }
      
      console.log("resfor", parseInt(chartId, 10), "y res 1", resultado, "resdata");

      // Agregar la información de queriesResponse al JSON correspondiente
      if (resultado) {
        queriesResponses[parseInt(chartId, 10)] = resultado;
        console.log("resdata", resultado); // Accede a la propiedad 'data' si existe
      }
      console.log("qr", queriesResponses);
    }

    // Crear el JSON final con chartConfiguration y queriesResponses
    const resultadoFinal = {
      chartConfiguration,
      queriesResponses,
      filtros_dev
    };
    //console.log("qr2", queriesResponses[97]);
    return resultadoFinal;
  } else {
    console.log('Dashboard component not found');
    return null;
  }
}
const QABtnComponent = () => {
  const [qaInputVisible, setQaInputVisible] = useState(false);
  const [qaInput, setQaInput] = useState('');

  const handleShowQAClick = () => {
    setQaInputVisible(!qaInputVisible);
  };


  // componentDidMount() {
  //   const dashboardId = ...; // Obtén el ID del dashboard de alguna manera
  //   cargaTabs(dashboardId); 
  // }

  const handleSubmitQAClick = () => {
    console.log("entro a handle");
    const dashboardId = getDashboardIdFromUrl();
    let resultado;
    if (isProduction()) {
      resultado = produccion(11); // Reemplaza chartId con el valor adecuado
      console.log('Resultado en producción:', resultado);
    } else {
      resultado = desarrollo(11); // Reemplaza chartId y dashboardId con los valores adecuados
      console.log('Resultado en desarrollo2:', resultado);
    }
    if (qaInput.trim()) {
      resultado["pregunta"]=qaInput
      console.log('Pregunta enviada:', resultado);
      axios.post('http://localhost:8000/qa_pregunta', {
        id: 0, // Usualmente, el ID no se envía al crear, depende de tu backend
        user_id: 1, // Este valor debería ser dinámico, según el usuario autenticado
        dashboard_id: dashboardId, // Esto también debería ser dinámico según el contexto de la aplicación
        question: resultado
      })
      .then(response => {
        console.log('Respuesta de la API:', response.data);
        //alert('Pregunta enviada: ' + qaInput);
        setQaInput('');
        setQaInputVisible(false);
      })
      .catch(error => {
        if (error.response && error.response.status === 422) {
          console.error('Error de validación: ', error.response.data);
          // Mostrar mensaje al usuario basado en error.response.data
        } else {
          console.error('Error al enviar la pregunta:', error.message);
        }
      });
    } else {
      //alert('Por favor, escribe una pregunta antes de enviar.');
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
