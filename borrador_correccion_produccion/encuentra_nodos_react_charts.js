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
      console.log('Componente React actual:', currentComponent);
  
      if (currentComponent.return) {
        currentComponent = currentComponent.return.stateNode;
      } else {
        return currentComponent;
      }
    }
  
    return null;
  }
  
  // Función para buscar un componente específico en el árbol de React
  function searchComponent(rootComponent, targetName) {
    if (!rootComponent) {
      return null;
    }
  
    function traverseReactTree(reactComponent, targetName) {
      if (!reactComponent) return null;
  
      const componentName = reactComponent.elementType?.displayName || reactComponent.elementType?.name || reactComponent.type?.displayName || reactComponent.type?.name || 'Unknown';
      const props = reactComponent.memoizedProps || {};
      const state = reactComponent.memoizedState || {};
  
      if (componentName.toUpperCase() === targetName.toUpperCase()) {
        console.log(`Nombre del componente: ${componentName}`);
        console.log(`Detalles del componente ${targetName}:`, {
          props: props,
          state: state
        });
      }
  
      // Recorrer nodos hijos recursivamente
      if (reactComponent.child) {
        traverseReactTree(reactComponent.child, targetName);
      }
  
      // Recorrer nodos hermanos
      if (reactComponent.sibling) {
        traverseReactTree(reactComponent.sibling, targetName);
      }
    }
  
    traverseReactTree(rootComponent.current, targetName);
  }
  
  // Encontrar el componente React y la raíz
  const reactComponent = findAnyReactComponent();
  if (reactComponent) {
    console.log('Componente React encontrado:', reactComponent);
    const rootComponent = findReactRoot(reactComponent);
  
    if (rootComponent) {
      console.log('Raíz del árbol de React encontrada:', rootComponent);
  
      // Buscar y registrar detalles de los componentes `CHART`
      searchComponent(rootComponent, 'CHART');
    } else {
      console.log('No se pudo encontrar la raíz del árbol de React.');
    }
  } else {
    console.log('No se encontró ningún componente React.');
  }