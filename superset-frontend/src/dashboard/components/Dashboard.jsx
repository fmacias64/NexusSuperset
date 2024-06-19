/* eslint-disable */
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { isFeatureEnabled, t, FeatureFlag } from '@superset-ui/core';
import axios from 'axios';
import { io } from 'socket.io-client';

import { PluginContext } from 'src/components/DynamicPlugins';
import Loading from 'src/components/Loading';
import getBootstrapData from 'src/utils/getBootstrapData';
import getChartIdsFromLayout from '../util/getChartIdsFromLayout';
import getLayoutComponentFromChartId from '../util/getLayoutComponentFromChartId';

import {
  slicePropShape,
  dashboardInfoPropShape,
  dashboardStatePropShape,
} from '../util/propShapes';
import {
  LOG_ACTIONS_HIDE_BROWSER_TAB,
  LOG_ACTIONS_MOUNT_DASHBOARD,
  Logger,
} from '../../logger/LogUtils';
import { areObjectsEqual } from '../../reduxUtils';

import getLocationHash from '../util/getLocationHash';
import isDashboardEmpty from '../util/isDashboardEmpty';
import { getAffectedOwnDataCharts } from '../util/charts/getOwnDataCharts';

import { getUrlParam } from 'src/utils/urlUtils';
import { URL_PARAMS } from 'src/constants';

let apiBaseUrl;
let socketServerUrl;
let tokenServerUrl;
let apiKey;

if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) {
  apiBaseUrl = "http://localhost:8088";
  socketServerUrl = "http://localhost:4000";
  tokenServerUrl = "http://localhost:8000";
  apiKey = "JusasaJ313414J";
} else if (window.location.href.includes("posicion")) {
  apiBaseUrl = "http://www.posicion.mx:8088";
  socketServerUrl = "https://www.posicion.mx:4000";
  tokenServerUrl = "https://pofc.posicion.mx";
  apiKey = "JusasaJ313414J";
}

// Ahora puedes usar apiBaseUrl, socketServerUrl, tokenServerUrl y apiKey en tu código
console.log(apiBaseUrl, socketServerUrl, tokenServerUrl, apiKey);



const propTypes = {
  actions: PropTypes.shape({
    addSliceToDashboard: PropTypes.func.isRequired,
    removeSliceFromDashboard: PropTypes.func.isRequired,
    triggerQuery: PropTypes.func.isRequired,
    logEvent: PropTypes.func.isRequired,
    clearDataMaskState: PropTypes.func.isRequired,
  }).isRequired,
  dashboardInfo: dashboardInfoPropShape.isRequired,
  dashboardState: dashboardStatePropShape.isRequired,
  slices: PropTypes.objectOf(slicePropShape).isRequired,
  activeFilters: PropTypes.object.isRequired,
  chartConfiguration: PropTypes.object,
  datasources: PropTypes.object.isRequired,
  ownDataCharts: PropTypes.object.isRequired,
  layout: PropTypes.object.isRequired,
  impressionId: PropTypes.string.isRequired,
  timeout: PropTypes.number,
  userId: PropTypes.string,
};

const defaultProps = {
  timeout: 60,
  userId: '',
};

// Función para determinar si estamos en producción
function isProduction() {
  return window.location.href.includes("posicion");
}

//   #######                                                                        
//   #     # #####  ##### ###### #    # ###### #####                                
//   #     # #    #   #   #      ##   # #      #    #                               
//   #     # #####    #   #####  # #  # #####  #    #                               
//   #     # #    #   #   #      #  # # #      #####                                
//   #     # #    #   #   #      #   ## #      #   #                                
//   #############    #   ###### #    # ###### #    #                   ### ######  
//      #     #   ##    ####  #    # #####   ####    ##   #####  #####   #  #     # 
//      #     #  #  #  #      #    # #    # #    #  #  #  #    # #    #  #  #     # 
//      #     # #    #  ####  ###### #####  #    # #    # #    # #    #  #  #     # 
//      #     # ######      # #    # #    # #    # ###### #####  #    #  #  #     # 
//      #     # #    # #    # #    # #    # #    # #    # #   #  #    #  #  #     # 
//      ######  #    #  ####  #    # #####   ####  #    # #    # #####  ### ######  
//                                                                                  

const getDashboardIdFromUrl = () => {
  try {
    const url = window.location.pathname;
    const match = url.match(/\/dashboard\/(\d+)\//);
    if (match && match[1]) {
      return match[1];
    }
    console.error('Dashboard ID not found in URL:', url);
    return null;
  } catch (error) {
    console.error('Error extracting dashboard ID from URL:', error);
    return null;
  }
};


// hay que ver si es posible guardar la ruta para encontrar todos los componentes de los dashboards, usando memoize o fijos ,
// seguro no cambian 

// Function to find the React component from a DOM node

/////////////////////////////////////////////////////////////////////

//   #######                                                               
//   #       #    #  ####   ####  #    # ##### #####    ##   #####         
//   #       ##   # #    # #    # ##   #   #   #    #  #  #  #    #        
//   #####   # #  # #      #    # # #  #   #   #    # #    # #    #        
//   #       #  # # #      #    # #  # #   #   #####  ###### #####         
//   #       #   ## #    # #    # #   ##   #   #   #  #    # #   #         
//   ####### #    #  ####   ####  #    #   #   #    # #    # #    #        
//   #     #  ####  #    # #####   ####  #    # ###### #    # ##### ###### 
//   #       #    # ##  ## #    # #    # ##   # #      ##   #   #   #      
//   #       #    # # ## # #    # #    # # #  # #####  # #  #   #   #####  
//   #       #    # #    # #####  #    # #  # # #      #  # #   #   #      
//   #     # #    # #    # #      #    # #   ## #      #   ##   #   #      
//   ######  ########   ## #  ##############  # ###### #    #   #   ###### 
//   #     # #         # #   #     #    #                                  
//   #     # #        #   #  #          #                                  
//   ######  #####   #     # #          #                                  
//   #   #   #       ####### #          #                                  
//   #    #  #       #     # #     #    #                                  
//   #     # ####### #     #  #####     #                                  
//                                                                         

////////////////////////////////////////////////////////////////////
function findReactComponent(dom) {
  if (isProduction()) {
    for (const key in dom) {
      if (key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) {
        let fiberNode = dom[key];
        while (fiberNode.return) {
          fiberNode = fiberNode.return;
        }
        return fiberNode.stateNode;
      }
    }
  }
  else {
  for (const key in dom) {
    if (key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) {
      return dom[key];
    }
  }
}
  return null;
}

// Function to navigate from a component to the root
function navigateToRoot(reactComponent) {
  if (!reactComponent) return null;

  let currentComponent = reactComponent;
  while (currentComponent) {
    if (!currentComponent.return) {
      
      return currentComponent;
    }

    currentComponent = currentComponent.return;
  }
}

// Function to find any React component in the document
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

// Función para encontrar la raíz del árbol de React aplica para produccion
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


// seguimos en ambiente de produccion
// Función para registrar los componentes React que cumplen con los criterios especificados
function traverseAndLogComponents(rootComponent, sliceId, dashboardId, type, filter_super = '', tabKey = '') {
  if (!rootComponent) {
    return null;
  }

  let componentCounter = 0;

  function traverseReactTreeP(reactComponent) {
    if (!reactComponent) return null;

    const componentName = reactComponent.elementType?.displayName || reactComponent.elementType?.name || reactComponent.type?.displayName || reactComponent.type?.name || 'Unknown';
    const props = reactComponent.memoizedProps || {};
    const state = reactComponent.memoizedState || {};
    const stateNode = reactComponent.stateNode;

    if (
      (type === 'applyCrossFilterBySocket' || type === 'activateTab') &&
      stateNode &&
      stateNode.dataComponent === 'ChartRenderer' &&
      props.chartId === sliceId &&
      props.dashboardId === dashboardId
    ) {  console.log(`Nombre del componente: ${componentName}`);
      console.log(`Detalles del componente que cumple con los criterios:`, stateNode);
      console.log(`Propiedades del componente:`, props);
      if (type === 'applyCrossFilterBySocket') {
        applyCrossFilterAndUpdate(reactComponent, filter_super);
      } else if (type === 'removeCrossFilterBySocket') {
        removeCrossFilterAndUpdate(reactComponent);
      }
    } else if (type === 'refreshChartBySocket') {
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
    } else if (type === 'getCrossFilters') {
      if (props.crossFilters ) {
        console.log('Working with CrossFiltersVerticalCollapse component:');
        console.log('Props:', props);

        const crossFilterDetails = extractCrossFilterDetails(props.crossFilters);
        console.log('Cross-filter details:', crossFilterDetails);
        return crossFilterDetails; // Devolver los detalles del cross filter
      }
    } else if ((type==='activateTab') && (props.tab && props.tab.key === tabKey)) {
      console.log(`Nombre del componente: ${componentName}`);
      console.log(`Detalles del componente que cumple con los criterios:`, reactComponent);
      console.log(`Propiedades del componente:`, props);
      if (typeof props.onClick === 'function') {
        props.onClick();
      }
      return; // Dejar de recorrer una vez que se encuentra el primer componente que cumple los criterios
    }

    // Recorrer nodos hijos recursivamente
    if (reactComponent.child) {
      const result = traverseReactTreeP(reactComponent.child);
      if (result) return result; // Detener la búsqueda si se encuentra un resultado
    }

    // Recorrer nodos hermanos
    if (reactComponent.sibling) {
      const result = traverseReactTreeP(reactComponent.sibling);
      if (result) return result; // Detener la búsqueda si se encuentra un resultado
    }

    return null;
  }

  return traverseReactTreeP(rootComponent.current);
}

// Function to traverse the React tree and find the App component
function findAppComponent(reactComponent) {
  if (!reactComponent) return null;

  let currentComponent = reactComponent;
  while (currentComponent) {
    //const componentName = currentComponent.elementType?.displayName || currentComponent.elementType?.name || currentComponent.type?.displayName || currentComponent.type?.name || (typeof currentComponent.elementType === 'string' ? currentComponent.elementType : 'Unknown');
    
    if (
      currentComponent.elementType?.displayName === 'App' ||
      currentComponent.elementType?.name === 'App' ||
      currentComponent.type?.displayName === 'App' ||
      currentComponent.type?.name === 'App' ||
      (typeof currentComponent.elementType === 'string' && currentComponent.elementType === 'App')
    ) {
     
      return currentComponent;
    }

    // Move to the parent component
    currentComponent = currentComponent.return;
  }

  return null;
}


function searchComponent(rootComponent, targetName, sliceId, dashboardId, type, tabKey = 'none') {
  if (!rootComponent) {
    
    return null;
  }

  

  function traverseReactTree(reactComponent, targetName, sliceId, dashboardId) {
    if (!reactComponent) return null;

    const componentName = reactComponent.elementType?.displayName || reactComponent.elementType?.name || reactComponent.type?.displayName || reactComponent.type?.name || 'Unknown';
    const props = reactComponent.memoizedProps || {};
    

    if (targetName ==='TabNode' && props.tab && props.tab.key === tabKey){
      console.log("llegue");
      return reactComponent;
    }


    if (componentName === targetName) {
      if (type === 'refreshChartBySocket' && props.slice?.slice_id === sliceId) {
        
        return reactComponent;
      } else if (type === 'applyCrossFilterBySocket' && props.chartId === sliceId) {
        
        return reactComponent;
      } else if (type === 'removeCrossFilterBySocket' && props.chartId === sliceId) {
        
        return reactComponent;
      } else if (type === 'getCrossFilters') {
        
        return reactComponent;
      }
    }
    
    // if (componentName === targetName && props.slice.slice_id === sliceId && props.dashboardId === dashboardId) {
    //   console.log('Found target component:', reactComponent);
    //   return reactComponent;
    // }

    // Recursively search child components
    if (reactComponent.child) {
      
      const foundInChild = traverseReactTree(reactComponent.child, targetName, sliceId, dashboardId);
      if (foundInChild) return foundInChild;
    }

    // Search sibling components
    if (reactComponent.sibling) {
      
      const foundInSibling = traverseReactTree(reactComponent.sibling, targetName, sliceId, dashboardId);
      if (foundInSibling) return foundInSibling;
    }

    return null;
  }

  const targetComponent = traverseReactTree(rootComponent, targetName, sliceId, dashboardId);
  if (targetComponent) {
    

    // Highlight the target component element if it has a DOM node
    if (targetComponent.stateNode instanceof HTMLElement) {
      targetComponent.stateNode.style.border = '2px solid green';
      targetComponent.stateNode.style.backgroundColor = 'lightyellow';
      
    }
    return targetComponent;
  } else {
    
    return null;
  }
}


const generateCrossFilterDataMask = (selectedValues, groupby, labelMap) => value => {
  const selected = Object.values(selectedValues);
  let values;
  if (selected.includes(value)) {
    values = selected.filter(v => v !== value);
  } else {
    values = [value];
  }

  const groupbyValues = values.map(value => labelMap[value]);

  return {
    dataMask: {
      extraFormData: {
        filters: values.length === 0 ? [] : groupby.map((col, idx) => {
          const val = groupbyValues.map(v => v[idx]);
          if (val === null || val === undefined) {
            return { col, op: 'IS NULL' };
          }
          return { col, op: 'IN', val: val };
        }),
      },
      filterState: {
        value: groupbyValues.length ? groupbyValues : null,
        selectedValues: values.length ? values : null,
      },
    },
    isCurrentValueSelected: selected.includes(value),
  };
};

const applyCrossFilterAndUpdate = (component, filter_super) => {
  const [columnName, value] = filter_super.split('=');
console.log("aplica crossFilter",component);
  // Genera la máscara de datos utilizando generateCrossFilterDataMask
  const dataMask = generateCrossFilterDataMask(
    {}, // selectedValues, asumiendo que es un objeto vacío para empezar
    [columnName], // groupby array
    { [value]: [value] } // labelMap, asignando el filtro
  )(value);
console.log(dataMask);
  if (dataMask) {
    // Verificar si component.props.memoizedProps y component.props.memoizedProps.actions están definidos
    const actions = component.memoizedProps?.actions;
    if (actions && actions.updateDataMask) {
      // Aplica la máscara de datos utilizando updateDataMask
      actions.updateDataMask(component.memoizedProps.chartId, dataMask.dataMask);

      // Fuerza la actualización del gráfico
      console.log("updateDatamask ",component);
      component.forceUpdate();
    } else {
      console.error('Component memoizedProps or actions not found or updateDataMask is missing:', component);
    }
  }
};


const removeCrossFilterAndUpdate = (component) => {
  // Verificar si component.props.actions, component.memoizedProps.actions, o component.actions están definidos
  const actions = component.props?.actions || component.memoizedProps?.actions || component.actions;
  const chartId = component.props?.chartId || component.memoizedProps?.chartId || component.chartId;

  if (actions && actions.updateDataMask) {
    // Remueve la máscara de datos utilizando updateDataMask
    actions.updateDataMask(chartId, {
      extraFormData: { filters: [] },
      filterState: { value: null, selectedValues: null }
    });

    // Fuerza la actualización del gráfico
    component.forceUpdate();
  } else {
    console.error('Component actions not found or updateDataMask is missing:', component);
  }
};
function extractCrossFilterDetails(crossFilters) {
  return crossFilters.map(filter => ({
    column: filter.column,
    name: filter.name,
    value: filter.value,
    emitterId: filter.emitterId,
  }));
}

window.handleSupersetMessage = (slice_id, dashboard_id, type, filter_super = null) => {
  let rootComponent = null; // Definir rootComponent dentro del alcance de la función

  // Main execution
  const reactComponent = findAnyReactComponent();
  if (!reactComponent) {
    console.log('No React component found in the document.');
    return;
  }

  let appComponent = findAppComponent(reactComponent);


  if (!appComponent) {
    console.log('App component not found, navigating to root.');
    rootComponent = navigateToRoot(reactComponent);
  } else {
    rootComponent = appComponent;
  }

  if (!rootComponent) {
    console.log('Root component not found.');
    return;
  }

  console.log('Root component:', rootComponent);

  if (type === 'refreshChartBySocket') {
    if (isProduction()) {
      const reactComponent = findAnyReactComponent();
      if (reactComponent) {
        console.log('Componente React encontrado:', reactComponent);
        const rootComponent = findReactRoot(reactComponent);
      
        if (rootComponent) {
          console.log('Raíz del árbol de React encontrada:', rootComponent);
      
          // Definir los parámetros para buscar los componentes objetivo
          const sliceId = slice_id; // Usamos slice_id pasado en el mensaje
          const dashboardId = dashboard_id; // Usamos dashboard_id pasado en el mensaje
      
          // Buscar y registrar detalles de los componentes que cumplen con los criterios
          traverseAndLogComponents(rootComponent, sliceId, dashboardId, type,'');
        } else {
          console.log('No se pudo encontrar la raíz del árbol de React.');
        }
      } else {
        console.log('No se encontró ningún componente React.');
      }
    } else {
    const sliceHeaderComponent = searchComponent(rootComponent, 'SliceHeader', slice_id, dashboard_id,type); // Cambiado aquí
    if (sliceHeaderComponent) {
      console.log('Working with SliceHeader component:');
      console.log('Props:', sliceHeaderComponent.memoizedProps);
      console.log('State:', sliceHeaderComponent.memoizedState);

      // Check if forceRefresh exists and call it
      const { forceRefresh } = sliceHeaderComponent.memoizedProps;
      if (forceRefresh) {
        console.log('Calling forceRefresh function:');
        forceRefresh(slice_id, dashboard_id);
      } else {
        console.log('forceRefresh function not found in props.');
      }
    }
  }
  } 
  else if (type === 'applyCrossFilterBySocket') {
    if (isProduction()) {
      // Encontrar el componente React y la raíz
      const reactComponent = findAnyReactComponent();
      if (reactComponent) {
        console.log('Componente React encontrado:', reactComponent);
        const rootComponent = findReactRoot(reactComponent);

      if (rootComponent) {
          console.log('Raíz del árbol de React encontrada:', rootComponent);

    // Definir los parámetros para buscar el componente objetivo    
    // Registrar los componentes React que cumplen con los criterios
    traverseAndLogComponents(rootComponent, slice_id, dashboard_id, type, filter_super);
  } else {
    console.log('No se pudo encontrar la raíz del árbol de React.');
  }
} else {
  console.log('No se encontró ningún componente React.');
}
    }
    else {
    const chartRenderComponent = searchComponent(rootComponent, 'ChartRenderer', slice_id, dashboard_id,type); // Cambiado aquí
    if (chartRenderComponent) {
      console.log('Working with ChartRender component:');
      console.log('Props:', chartRenderComponent.memoizedProps);
      console.log('State:', chartRenderComponent.memoizedState);
      console.log('filter:', filter_super);
      applyCrossFilterAndUpdate(chartRenderComponent, filter_super);
    } else {
      console.log('ChartRender component not found.');
    }
  }}

  else if (type === 'activateTab') {
    if (isProduction() ) {
      const reactComponent = findAnyReactComponent();
      if (reactComponent) {
        console.log('Componente React encontrado:', reactComponent);
        const rootComponent = findReactRoot(reactComponent);
      
        if (rootComponent) {
          console.log('Raíz del árbol de React encontrada:', rootComponent);
      
          // Definir los parámetros para buscar el componente objetivo
          //const type = 'activateTab'; // Definir el tipo específico para activar el tab
          //const tabId = "TAB-nR-9yxMgk"; // Definir el tabId específico
  
          // Registrar los componentes React que cumplen con los criterios
          traverseAndLogComponents(rootComponent, slice_id, dashboard_id, type, filter_super);
        } else {
          console.log('No se pudo encontrar la raíz del árbol de React.');
        }
      } else {
        console.log('No se encontró ningún componente React.');
      }
    } else { 
    console.log("filtaer super",filter_super);
    const tabNodeComponent = searchComponent(rootComponent, 'TabNode', slice_id, dashboard_id, type, filter_super); // Cambiado aquí
    if (tabNodeComponent) {
      console.log('Working with tabNode component:');
      //console.log('Props:', tabNodeComponent);
      //console.log('State:', chartRenderComponent.memoizedState);
      tabNodeComponent.memoizedProps.onClick();
    } else {
      console.log('tabNode component not found.');
    }}
  }
  else if (type === 'removeCrossFilterBySocket') {
    if (isProduction()) {
      const reactComponent = findAnyReactComponent();
      if (reactComponent) {
        console.log('Componente React encontrado:', reactComponent);
        const rootComponent = findReactRoot(reactComponent);
      
        if (rootComponent) {
          console.log('Raíz del árbol de React encontrada:', rootComponent);
      
          // Definir los parámetros para buscar el componente objetivo
          const type = 'removeCrossFilterBySocket'; // 'refreshChart', 'applyCrossFilterBySocket' o 'removeCrossFilterBySocket'
          
          // Registrar los componentes React que cumplen con los criterios
          traverseAndLogComponents(rootComponent, slice_id, dashboard_id, type, filter_super);
        } else {
          console.log('No se pudo encontrar la raíz del árbol de React.');
        }
      } else {
          console.log('No se encontró ningún componente React.');
      }}
    else {
    const chartRenderComponent = searchComponent(rootComponent, 'ChartRenderer', slice_id, dashboard_id, type); // Cambiado aquí
    if (chartRenderComponent) {
      console.log('Working with ChartRender component:');
      console.log('Props:', chartRenderComponent.memoizedProps);
      console.log('State:', chartRenderComponent.memoizedState);
      removeCrossFilterAndUpdate(chartRenderComponent);
    } else {
      console.log('ChartRender component not found.');
    }
  }
}
  else if (type === 'getCrossFilters') {
  if (isProduction()) {
    const reactComponent = findAnyReactComponent();
if (reactComponent) {
  console.log('Componente React encontrado:', reactComponent);
  const rootComponent = findReactRoot(reactComponent);

  if (rootComponent) {
    console.log('Raíz del árbol de React encontrada:', rootComponent);

    
    // Registrar los componentes React que cumplen con los criterios
    const crossFilterDetails=traverseAndLogComponents(rootComponent, slice_id, dashboard_id, type);
    console.log('Cross-filter details:',crossFilterDetails);
  } else {
    console.log('No se pudo encontrar la raíz del árbol de React.');
  }
} else {
  console.log('No se encontró ningún componente React.');
}
  }
  else
  { const crossFiltersVerticalCollapse = searchComponent(rootComponent, 'CrossFiltersVerticalCollapse', slice_id, dashboard_id, type);
  if (crossFiltersVerticalCollapse) {
    console.log('Working with CrossFiltersVerticalCollapse component:');
    console.log('Props:', crossFiltersVerticalCollapse.memoizedProps);

    const crossFilterDetails = extractCrossFilterDetails(crossFiltersVerticalCollapse.memoizedProps.crossFilters);
    console.log('Cross-filter details:', crossFilterDetails);
  }else {
    console.log('CrossFiltersVerticalCollapse component not found.');
  }
}
  console.log('Script execution completed.');
};
};
class Dashboard extends React.PureComponent {
  static contextType = PluginContext;

  static onBeforeUnload(hasChanged) {
    if (hasChanged) {
      window.addEventListener('beforeunload', Dashboard.unload);
    } else {
      window.removeEventListener('beforeunload', Dashboard.unload);
    }
  }

  static unload() {
    const message = t('You have unsaved changes.');
    window.event.returnValue = message; // Gecko + IE
    return message; // Gecko + Webkit, Safari, Chrome etc.
  }

  constructor(props) {
    super(props);
    this.appliedFilters = props.activeFilters ?? {};
    this.appliedOwnDataCharts = props.ownDataCharts ?? {};
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    // insertado para auxilio de las funciones para sacar queries
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
  }

  async getAccessToken() {
    const currentTime = Math.floor(Date.now() / 1000);

    // Comprobar si el token sigue siendo válido
    if (currentTime < this.tokenExpiry) {
      return this.accessToken;
    }

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
      const response = await axios.post(`${apiBaseUrl}/api/v1/security/login`, loginData, { headers });

      if (response.status === 200) {
        const tokens = response.data;
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.tokenExpiry = currentTime + 60 * 30; // Asume una duración de 1/2 hora

        return this.accessToken;
      } else {
        throw new Error(`Failed to get access token: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }
  async getCsrfToken() {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/v1/security/csrf_token/`, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.status === 200) {
        return response.data.result;
      } else {
        throw new Error(`Failed to get CSRF token: ${response.status}, ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }


  parseParams(params) {
    return JSON.parse(params);
  }

//   async fetchChartData(slice_id) {
//     try {
//         console.log('Fetching access token...');
//         const token = await this.getAccessToken();  // Obtener el token de acceso
//         console.log('Access token obtained:', token);

//         console.log('Fetching CSRF token...');
//         const csrfToken = await this.getCsrfToken();  // Obtener el token CSRF
//         console.log('CSRF token obtained:', csrfToken);

//         // Paso 1: Obtener detalles del gráfico desde la API de Superset
//         console.log(`Fetching chart details for slice_id ${slice_id}...`);
//         const chartDetailsResponse = await axios.get(`/api/v1/chart/${slice_id}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Accept': 'application/json'
//             }
//         });
//         const chartDetails = chartDetailsResponse.data.result;
//         console.log('Chart details obtained:', chartDetails);

//         // Paso 2: Extraer 'params' y 'query_context' del resultado
//         const params = chartDetails.params;
//         const query_context = chartDetails.query_context;
//         console.log('Params:', params);
//         console.log('Query context:', query_context);

//         // Paso 3: Formatear los datos para la petición a 'explore_json'
//         const formData = this.parseParams(params);
//         formData.slice_id = slice_id;

//         // Obtener el native_filters_key si es necesario
//         const nativeFilterKeyValue = getUrlParam(URL_PARAMS.nativeFiltersKey);
//         if (nativeFilterKeyValue) {
//             formData.native_filters_key = nativeFilterKeyValue;
//         }
//         console.log('Form data:', formData);

//         // Paso 4: Construir el objeto formData completo
//         const completeFormData = {
//             datasource: "1__table",
//             viz_type: "bubble",
//             slice_id: slice_id,
//             url_params: {
//                 native_filters_key: nativeFilterKeyValue
//             },
//             series: "region",
//             entity: "country_name",
//             x: "sum__SP_RUR_TOTL_ZS",
//             y: "sum__SP_DYN_LE00_IN",
//             adhoc_filters: formData.adhoc_filters,
//             size: "sum__SP_POP_TOTL",
//             max_bubble_size: "50",
//             limit: 0,
//             color_scheme: "supersetColors",
//             show_legend: true,
//             left_margin: "auto",
//             x_axis_format: "SMART_NUMBER",
//             x_ticks_layout: "auto",
//             bottom_margin: "auto",
//             y_axis_format: "SMART_NUMBER",
//             y_axis_bounds: [null, null],
//             compare_lag: "10",
//             compare_suffix: "o10Y",
//             country_fieldtype: "cca3",
//             granularity_sqla: "year",
//             groupby: [],
//             markup_type: "markdown",
//             row_limit: 50000,
//             show_bubbles: true,
//             time_range: "2011-01-01 : 2011-01-02",
//             shared_label_colors: {},
//             extra_filters: [],
//             extra_form_data: {},
//             dashboardId: 1
//         };
//         console.log('Complete form data:', completeFormData);

//         // Parámetros de cadena de consulta
//         const queryParams = new URLSearchParams({
//             form_data: JSON.stringify({ slice_id }),
//             query: 'true'
//         }).toString();
//         console.log('Query params:', queryParams);

//         // Paso 5: Hacer la petición a 'explore_json' para obtener el query
//         console.log('Fetching query from explore_json...');
//         const exploreResponse = await axios.post(`/superset/explore_json/?${queryParams}`, completeFormData, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'X-CSRFToken': csrfToken  // Usar el token CSRF obtenido
//             }
//         });

//         console.log('Explore response:', exploreResponse.data);

//         // Verificar la estructura de la respuesta antes de acceder a 'result'
//         if (exploreResponse.data && Array.isArray(exploreResponse.data.result) && exploreResponse.data.result.length > 0) {
//             // Paso 6: Extraer y retornar el query del resultado
//             const queryResult = exploreResponse.data.result[0].query;
//             return queryResult;
//         } else {
//             console.error('Unexpected response structure:', exploreResponse.data);
//             throw new Error('Unexpected response structure');
//         }

//     } catch (error) {
//         console.error('Error fetching chart data:', error);
//         throw error;
//     }
// }


  /* async fetchChartData(slice_id) {
    try {
      const token = await this.getAccessToken();  // Obtener el token de acceso

      // Paso 1: Obtener detalles del gráfico desde la API de Superset
      const chartDetailsResponse = await axios.get(`/api/v1/chart/${slice_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const chartDetails = chartDetailsResponse.data.result;

      // Paso 2: Extraer 'params' y 'query_context' del resultado
      const params = chartDetails.params;
      const query_context = chartDetails.query_context;

      // Paso 3: Formatear los datos para la petición a 'explore_json'
      const formData = this.parseParams(params);
      formData.slice_id = slice_id;

      // Obtener el native_filters_key si es necesario
      const nativeFilterKeyValue = getUrlParam(URL_PARAMS.nativeFiltersKey);
      if (nativeFilterKeyValue) {
        formData.native_filters_key = nativeFilterKeyValue;
      }

      const queryParams = new URLSearchParams({
        form_data: JSON.stringify({ slice_id }),
        query: 'true'
    }).toString()

      // Paso 4: Hacer la petición a 'explore_json' para obtener el query
      const exploreResponse = await axios.post(`/superset/explore_json/?${queryParams}`, completeFormData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken  // Usar el token CSRF obtenido
        }
    });


    //   const exploreResponse = await axios.post('/superset/explore_json/', {
     //   formData: formData,
    //    resultFormat: 'json',
     //   resultType: 'query'
    //  }, {
    //    headers: {
    //      'Authorization': `Bearer ${token}`,
    //      'Accept': 'application/json'
    //    }
    //  }); 

      // Paso 5: Extraer y retornar el query del resultado
      const queryResult = exploreResponse.data.result[0].query;
      return queryResult;

    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  } */

componentDidUpdate() {
  this.applyCharts();
}


  componentDidMount() {
    console.log('Dashboard component mounted Felipe');

    const bootstrapData = getBootstrapData();
    const { dashboardState, layout } = this.props;
    const eventData = {
      is_soft_navigation: Logger.timeOriginOffset > 0,
      is_edit_mode: dashboardState.editMode,
      mount_duration: Logger.getTimestamp(),
      is_empty: isDashboardEmpty(layout),
      is_published: dashboardState.isPublished,
      bootstrap_data_length: bootstrapData.length,
    };
    const directLinkComponentId = getLocationHash();
    if (directLinkComponentId) {
      eventData.target_id = directLinkComponentId;
    }
    this.props.actions.logEvent(LOG_ACTIONS_MOUNT_DASHBOARD, eventData);

    // Handle browser tab visibility change
    if (document.visibilityState === 'hidden') {
      this.visibilityEventData = {
        start_offset: Logger.getTimestamp(),
        ts: new Date().getTime(),
      };
    }
    window.addEventListener('visibilitychange', this.onVisibilityChange);
    this.applyCharts();
    this.setupSocketConnection(); }
 


    setupSocketConnection() {
      axios.post(`${tokenServerUrl}/auth/get-token`, {}, {
        headers: {
          'x-api-key': `${apiKey}`
        }
      })
      .then(response => {
        console.log(tokenServerUrl);
        const token = response.data.token;
        const user_id = "1";  // Ajusta el user_id según tus necesidades
  
        // Conectarse al servidor de socket.io con el token
        const socket = io(`${socketServerUrl}`, {
          query: { token }
        });
  
        // Manejar eventos del socket
        socket.on('connect', () => {
          console.log('Connected to Socket.IO server', socket.id);
          socket.emit('join_room', { token: token, user_id: user_id });
        });
  
        //window.handleSupersetMessage = (slice_id, dashboard_id, type, filter = null)
        // Manejar los mensajes de socket_action
        socket.on('dashboard', ({ type, slice_id, dashboard_id,filter_super }) => {
          if (typeof window.handleSupersetMessage === 'function') {
            console.log('Escucho', socket.id);
            window.handleSupersetMessage(slice_id, dashboard_id, type,filter_super);
          } else {
            console.error(`Action ${type} is not a valid function`);
          }
          this.fetchChartData(5)
          .then(query => console.log('Query:', query))
          .catch(error => console.error('Error:', error));
        });
        

      socket.on('request_dashboard_id', (data) => {
        const dashboardId = getDashboardIdFromUrl();  // Función para obtener el ID del dashboard desde la URL
        const userId = data.user_id;  // Ajustar esto para obtener el user_id del mensaje original
        

        const message = {
          room: userId,
          type: 'dashboard_id_response',
          dashboard_id: dashboardId,
          socket_id: socket.id,
          user_id: userId  // Mantener el user_id original
        };

      if (dashboardId) {
         socket.emit('message', message);
         console.log('Dashboard ID response emitted:', message);
      }
    });

        /* socket.on('request_dashboard_id', () => {
          const dashboardId = getDashboardIdFromUrl();
          const userId = '1'; // Ajusta esto según sea necesario
          const message = {
          room: userId,
          type: 'dashboard_id_response',
          dashboard_id: dashboardId,
          socket_id: socket.id,
          timestamp:timesatmp,
          };
          if (dashboardId) {
            socket.emit('message', message);
            console.log('Dashboard ID response emitted:', { dashboard_id: dashboardId, socket_id: socket.id }); 
          }
        }); */

        /* socket.on('force_refresh', ({ type, slice_id, dashboard_id }) => {
          if (typeof window[type] === 'function') {
            console.log('Escucho', socket.id);
            window[type](slice_id, dashboard_id);
          } else {
            console.error(`Action ${type} is not a valid function`);
          }
        });

        socket.on('cross_filter', ({ type, slice_id, dashboard_id,filter }) => {
          if (typeof window[type] === 'function') {
            console.log('Escucho', socket.id);
            window[type](slice_id, dashboard_id,filter);
          } else {
            console.error(`Action ${type} is not a valid function`);
          }
        });  
   */
      })
      .catch(error => {
        console.error('Error obteniendo el token:', error);
      });
    }
  

    
  UNSAFE_componentWillReceiveProps(nextProps) {
    const currentChartIds = getChartIdsFromLayout(this.props.layout);
    const nextChartIds = getChartIdsFromLayout(nextProps.layout);

    if (this.props.dashboardInfo.id !== nextProps.dashboardInfo.id) {
      // single-page-app navigation check
      return;
    }

    if (currentChartIds.length < nextChartIds.length) {
      const newChartIds = nextChartIds.filter(
        key => currentChartIds.indexOf(key) === -1,
      );
      newChartIds.forEach(newChartId =>
        this.props.actions.addSliceToDashboard(
          newChartId,
          getLayoutComponentFromChartId(nextProps.layout, newChartId),
        ),
      );
    } else if (currentChartIds.length > nextChartIds.length) {
      // remove chart
      const removedChartIds = currentChartIds.filter(
        key => nextChartIds.indexOf(key) === -1,
      );
      removedChartIds.forEach(removedChartId =>
        this.props.actions.removeSliceFromDashboard(removedChartId),
      );
    }
  }

  applyCharts() {
    const { hasUnsavedChanges, editMode } = this.props.dashboardState;

    const { appliedFilters, appliedOwnDataCharts } = this;
    const { activeFilters, ownDataCharts, chartConfiguration } = this.props;
    if (
      isFeatureEnabled(FeatureFlag.DashboardCrossFilters) &&
      !chartConfiguration
    ) {
      // For a first loading we need to wait for cross filters charts data loaded to get all active filters
      // for correct comparing  of filters to avoid unnecessary requests
      return;
    }

    if (
      !editMode &&
      (!areObjectsEqual(appliedOwnDataCharts, ownDataCharts, {
        ignoreUndefined: true,
      }) ||
        !areObjectsEqual(appliedFilters, activeFilters, {
          ignoreUndefined: true,
        }))
    ) {
      this.applyFilters();
    }

    if (hasUnsavedChanges) {
      Dashboard.onBeforeUnload(true);
    } else {
      Dashboard.onBeforeUnload(false);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.props.actions.clearDataMaskState();
  }

  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // from visible to hidden
      this.visibilityEventData = {
        start_offset: Logger.getTimestamp(),
        ts: new Date().getTime(),
      };
    } else if (document.visibilityState === 'visible') {
      // from hidden to visible
      const logStart = this.visibilityEventData.start_offset;
      this.props.actions.logEvent(LOG_ACTIONS_HIDE_BROWSER_TAB, {
        ...this.visibilityEventData,
        duration: Logger.getTimestamp() - logStart,
      });
    }
  }

  applyFilters() {
    const { appliedFilters } = this;
    const { activeFilters, ownDataCharts } = this.props;

    // refresh charts if a filter was removed, added, or changed
    const currFilterKeys = Object.keys(activeFilters);
    const appliedFilterKeys = Object.keys(appliedFilters);

    const allKeys = new Set(currFilterKeys.concat(appliedFilterKeys));
    const affectedChartIds = getAffectedOwnDataCharts(
      ownDataCharts,
      this.appliedOwnDataCharts,
    );
    [...allKeys].forEach(filterKey => {
      if (
        !currFilterKeys.includes(filterKey) &&
        appliedFilterKeys.includes(filterKey)
      ) {
        // filterKey is removed?
        affectedChartIds.push(...appliedFilters[filterKey].scope);
      } else if (!appliedFilterKeys.includes(filterKey)) {
        // filterKey is newly added?
        affectedChartIds.push(...activeFilters[filterKey].scope);
      } else {
        // if filterKey changes value,
        // update charts in its scope
        if (
          !areObjectsEqual(
            appliedFilters[filterKey].values,
            activeFilters[filterKey].values,
            {
              ignoreUndefined: true,
            },
          )
        ) {
          affectedChartIds.push(...activeFilters[filterKey].scope);
        }

        // if filterKey changes scope,
        // update all charts in its scope
        if (
          !areObjectsEqual(
            appliedFilters[filterKey].scope,
            activeFilters[filterKey].scope,
          )
        ) {
          const chartsInScope = (activeFilters[filterKey].scope || []).concat(
            appliedFilters[filterKey].scope || [],
          );
          affectedChartIds.push(...chartsInScope);
        }
      }
    });

    // remove dup in affectedChartIds
    this.refreshCharts([...new Set(affectedChartIds)]);
    this.appliedFilters = activeFilters;
    this.appliedOwnDataCharts = ownDataCharts;
  }

  refreshCharts(ids) {
    ids.forEach(id => {
      this.props.actions.triggerQuery(true, id);
    });
  }

  render() {
    if (this.context.loading) {
      return <Loading />;
    }
    return this.props.children;
  }
}

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default Dashboard;
