// Función para encontrar la instancia de React desde un nodo DOM dado
function findReactComponent(dom) {
    for (const key in dom) {
      if (key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) {
        let fiberNode = dom[key];
        while (fiberNode.return) {
          fiberNode = fiberNode.return;
        }
        return fiberNode.stateNode;
      }
    }
    return null;
  }
  
  // Función para encontrar cualquier componente React en el DOM
  function findAnyReactComponent() {
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const reactComponent = findReactComponent(element);
      if (reactComponent) {
        return reactComponent;
      }
    }
    return null;
  }
  
  // Ejecutar la función para encontrar un componente React
  const reactComponent = findAnyReactComponent();
  
  // Mostrar el componente encontrado
  if (reactComponent) {
    console.log('Componente React encontrado:', reactComponent);
  } else {
    console.log('No se encontró ningún componente React.');
  }
  