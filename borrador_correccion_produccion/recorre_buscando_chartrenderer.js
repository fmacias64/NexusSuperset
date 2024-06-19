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
  
  // Función para encontrar la raíz del árbol de React
  function findReactRoot(reactComponent) {
    if (!reactComponent) return null;
  
    let currentComponent = reactComponent;
    while (currentComponent) {
      if (currentComponent.return) {
        currentComponent = currentComponent.return.stateNode;
      } else {
        return currentComponent;
      }
    }
  
    return null;
  }
  
  // Función para registrar los componentes React que cumplen con los criterios
  function traverseAndLogComponents(rootComponent, sliceId, dashboardId) {
    if (!rootComponent) {
      return;
    }
  
    function traverseReactTree(reactComponent) {
      if (!reactComponent) return;
  
      const componentName = reactComponent.elementType?.displayName || reactComponent.elementType?.name || reactComponent.type?.displayName || reactComponent.type?.name || 'Unknown';
      const props = reactComponent.memoizedProps || {};
      const stateNode = reactComponent.stateNode;
  
      if (props.crossFilters ) {
        console.log(`Nombre del componente: ${componentName}`);
        console.log(`Detalles del componente que cumple con los criterios:`, stateNode);
        console.log(`Propiedades del componente:`, props);
        return; // Dejar de recorrer una vez que se encuentra el primer componente que cumple los criterios
      }
  
      // Recorrer nodos hijos recursivamente
      if (reactComponent.child) {
        traverseReactTree(reactComponent.child);
      }
  
      // Recorrer nodos hermanos
      if (reactComponent.sibling) {
        traverseReactTree(reactComponent.sibling);
      }
    }
  
    traverseReactTree(rootComponent.current);
  }
  
  // Encontrar el componente React y la raíz
  const reactComponent = findAnyReactComponent();
  if (reactComponent) {
    console.log('Componente React encontrado:', reactComponent);
    const rootComponent = findReactRoot(reactComponent);
  
    if (rootComponent) {
      console.log('Raíz del árbol de React encontrada:', rootComponent);
  
      // Definir los parámetros para buscar el componente objetivo
      const sliceId = 80; // Reemplaza con el slice_id adecuado
      const dashboardId = 10; // Reemplaza con el dashboard_id adecuado
  
      // Registrar los componentes React que cumplen con los criterios
      traverseAndLogComponents(rootComponent, sliceId, dashboardId);
    } else {
      console.log('No se pudo encontrar la raíz del árbol de React.');
    }
  } else {
    console.log('No se encontró ningún componente React.');
  }
  