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
  
  // Función para registrar los componentes React que cumplen con los criterios especificados
  function traverseAndLogComponents(rootComponent, sliceId, dashboardId) {
    if (!rootComponent) {
      return;
    }
  
    let componentCounter = 0;
  
    function traverseReactTree(reactComponent) {
      if (!reactComponent) return;
  
      const componentName = reactComponent.elementType?.displayName || reactComponent.elementType?.name || reactComponent.type?.displayName || reactComponent.type?.name || 'Unknown';
      const props = reactComponent.memoizedProps || {};
      const state = reactComponent.memoizedState || {};
  
      if (
        props.chart?.id === sliceId &&
        props.componentId?.startsWith('CHART') &&
        props.dashboardId === dashboardId
      ) {
        componentCounter += 1;
        console.log(`Componente ${componentCounter} - Nombre del componente: ${componentName}`);
        console.log(`Detalles del componente ${componentName}:`, {
          funciones: Object.getOwnPropertyNames(Object.getPrototypeOf(reactComponent)),
          props: props,
          state: state,
          root: {
            ...reactComponent,
            props: undefined,
            state: undefined,
          },
        });
  
        if (!componentName.startsWith('withRouter')) {
          if (typeof reactComponent.forceRefresh === 'function') {
            console.log(`Llamando a forceRefresh en el componente ${componentName}`);
            reactComponent.forceRefresh();
          } else if (typeof props.refreshChart === 'function') {
            console.log(`Llamando a refreshChart en el componente ${componentName}`);
            props.refreshChart(
              props.chart.id,
              true,
              props.dashboardId
            );
          }
        }
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
  
      // Definir los parámetros para buscar los componentes objetivo
      const sliceId = 80; // Reemplaza con el slice_id adecuado
      const dashboardId = 10; // Reemplaza con el dashboard_id adecuado
  
      // Buscar y registrar detalles de los componentes que cumplen con los criterios
      traverseAndLogComponents(rootComponent, sliceId, dashboardId);
    } else {
      console.log('No se pudo encontrar la raíz del árbol de React.');
    }
  } else {
    console.log('No se encontró ningún componente React.');
  }
  