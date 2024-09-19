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
import React, { ReactNode, ReactElement, useEffect, useRef } from 'react';
import { css, SupersetTheme, t, useTheme } from '@superset-ui/core';
import { AntdDropdown, AntdDropdownProps } from 'src/components';
import QABtnComponent from './QABtnComponent'; // Asegúrate de que la ruta sea correcta

import { TooltipPlacement } from 'src/components/Tooltip';
import {
  DynamicEditableTitle,
  DynamicEditableTitleProps,
} from '../DynamicEditableTitle';
import CertifiedBadge, { CertifiedBadgeProps } from '../CertifiedBadge';
import FaveStar, { FaveStarProps } from '../FaveStar';
import Icons from '../Icons';
import Button from '../Button';

export const menuTriggerStyles = (theme: SupersetTheme) => css`
  width: ${theme.gridUnit * 8}px;
  height: ${theme.gridUnit * 8}px;
  padding: 0;
  border: 1px solid ${theme.colors.primary.dark2};

  &.ant-btn > span.anticon {
    line-height: 0;
    transition: inherit;
  }

  &:hover:not(:focus) > span.anticon {
    color: ${theme.colors.primary.light1};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.dark2};
  }
`;

const headerStyles = (theme: SupersetTheme) => css`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  background-color: ${theme.colors.grayscale.light5}; const toggleAudioButton = document.getElementById('toggleAudioButton');
  height: ${theme.gridUnit * 16}px;
  padding: 0 ${theme.gridUnit * 4}px;

  .editable-title {
    overflow: hidden;

    & > input[type='button'],
    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      white-space: nowrap;
    }
  }

  span[role='button'] {
    display: flex;
    height: 100%;
  }

  .title-panel {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-right: ${theme.gridUnit * 12}px;
  }

  .right-button-panel {
    display: flex;
    align-items: center;
  }
  /* styles.css */
.audio-disabled {
  background-color: red;
}

.audio-enabled {
  background-color: green;radiance asparagus 0442
}

.dashboard-qa-button-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dashboard-qa-input-div {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid black;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* dashboard-qa-styles.css */
.qa-textarea {
  width: 300px; /* Ajusta el ancho del textarea */
  height: 100px; /* Ajusta la altura para mostrar múltiples líneas */
  padding: 10px; /* Espacio interno alrededor del texto */
  font-size: 16px; /* Tamaño de la fuente */
  border-radius: 4px; /* Esquinas redondeadas opcionales */
  border: 1px solid #ccc; /* Estilo del borde */
  box-sizing: border-box; /* Incluye padding y border en las dimensiones totales */
  resize: vertical; /* Permite al usuario ajustar la altura */
}

.qa-input {
  width: 300px; /* Ajusta el ancho deseado */
  height: 50px; /* Ajusta la altura deseada */
  padding: 10px; /* Espacio interno alrededor del texto */
  font-size: 16px; /* Tamaño de la fuente */
  border-radius: 4px; /* Esquinas redondeadas opcionales */
  border: 1px solid #ccc; /* Estilo del borde */
  box-sizing: border-box; /* Incluye padding y border en las dimensiones totales */
}
.dashboard-qa-input-div.hidden {
  display: none; 
}

.dashboard-qa-input-div.visible {
  display: block; 
}

`;

const buttonsStyles = (theme: SupersetTheme) => css`
  display: flex;
  align-items: center;
  padding-left: ${theme.gridUnit * 2}px;

  & .fave-unfave-icon {
    padding: 0 ${theme.gridUnit}px;

    &:first-of-type {
      padding-left: 0;
    }
  }
`;

const additionalActionsContainerStyles = (theme: SupersetTheme) => css`
  margin-left: ${theme.gridUnit * 2}px;
`;

export type PageHeaderWithActionsProps = {
  editableTitleProps: DynamicEditableTitleProps;
  showTitlePanelItems: boolean;
  certificatiedBadgeProps?: CertifiedBadgeProps;
  showFaveStar: boolean;
  showMenuDropdown?: boolean;
  faveStarProps: FaveStarProps;
  titlePanelAdditionalItems: ReactNode;
  rightPanelAdditionalItems: ReactNode;
  additionalActionsMenu: ReactElement;
  menuDropdownProps: Omit<AntdDropdownProps, 'overlay'>;
  tooltipProps?: {
    text?: string;
    placement?: TooltipPlacement;
  };
};
export const PageHeaderWithActions = ({
  editableTitleProps,
  showTitlePanelItems,
  certificatiedBadgeProps,
  showFaveStar,
  faveStarProps,
  titlePanelAdditionalItems,
  rightPanelAdditionalItems,
  additionalActionsMenu,
  menuDropdownProps,
  showMenuDropdown = true,
  tooltipProps,
}: PageHeaderWithActionsProps) => {
  const theme = useTheme();
  // @ts-ignore
  const toggleAudioButtonRef = useRef(null);
  // @ts-ignore
  const audioEnabledHiddenRef = useRef(null);
  
  useEffect(() => {
    //const audioEnabledHidden = document.getElementById('audioEnabledHidden');
    const toggleAudioButton = toggleAudioButtonRef.current;

 // Leer el estado del audio desde localStorage
 // @ts-ignore
  
 const isAudioEnabled = localStorage.getItem('audioEnabled') === 'true';

 const updateButtonUI = () => {
  const isAudioEnabled = localStorage.getItem('audioEnabled') === 'true';
  if (isAudioEnabled) {
  // @ts-ignore
  
    toggleAudioButton.classList.remove('audio-disabled');
 // @ts-ignore
  
    toggleAudioButton.classList.add('audio-enabled');
  // @ts-ignore
  
    toggleAudioButton.textContent = 'Audio Enabled';
  } else {
    // @ts-ignore
  
    toggleAudioButton.classList.remove('audio-enabled');
  // @ts-ignore
  
    toggleAudioButton.classList.add('audio-disabled');
  // @ts-ignore
  
    toggleAudioButton.textContent = 'Audio Disabled';
  }
};

const enableAudio = () => {
  localStorage.setItem('audioEnabled', 'true');
  updateButtonUI();
};

const disableAudio = () => {
  localStorage.setItem('audioEnabled', 'false');
  updateButtonUI();
};

const handleButtonClick = () => {
  const isAudioEnabled = localStorage.getItem('audioEnabled') === 'true';
  if (isAudioEnabled) {
    disableAudio();
  } else {
    enableAudio();
  }
};



// Inicializar la UI del botón según el estado actual del audio



 // Establecer el valor del input hidden según el estado del audio
//  if (audioEnabledHidden) {
//    audioEnabledHidden.value = isAudioEnabled.toString();
//  }
//     function enableAudio() {
//       console.log("Audio enabled");
//       // @ts-ignore
//       audioEnabledHidden.value = 'true';
//       localStorage.setItem('audioEnabled', 'true');
//       // @ts-ignore
//       toggleAudioButton.classList.remove('audio-disabled');
//       // @ts-ignore
//       toggleAudioButton.classList.add('audio-enabled');
//       // @ts-ignore
//       toggleAudioButton.textContent = 'Audio Enabled';
//     }

//     function disableAudio() {
//       console.log("Audio disabled");
//       // @ts-ignore
//       audioEnabledHidden.value = 'false';
//       localStorage.setItem('audioEnabled', 'false');
//       // @ts-ignore
//       toggleAudioButton.classList.remove('audio-enabled');
//       // @ts-ignore
//       toggleAudioButton.classList.add('audio-disabled');
//       // @ts-ignore
//       toggleAudioButton.textContent = 'Audio Disabled';
//     }
    
    // function handleButtonClick() {
    //   // @ts-ignore
    //   if (audioEnabledHidden.value === 'false') {
    //     enableAudio();
    //   } else {
    //     disableAudio();
    //   }
    // }
// @ts-ignore
if (toggleAudioButton) {
  // @ts-ignore
  toggleAudioButton.addEventListener('click', handleButtonClick);
  updateButtonUI();
}
return () => {
  if (toggleAudioButton) {
    // @ts-ignore
    toggleAudioButton.removeEventListener('click', handleButtonClick);
  }
};
}, []);

  return (
    <div css={headerStyles} className="header-with-actions">
      <div className="title-panel">
        <DynamicEditableTitle {...editableTitleProps} />
        {showTitlePanelItems && (
          <div css={buttonsStyles}>
            {certificatiedBadgeProps?.certifiedBy && (
              <CertifiedBadge {...certificatiedBadgeProps} />
            )}
            {showFaveStar && <FaveStar {...faveStarProps} />}
            {titlePanelAdditionalItems}
          </div>
        )}
      </div>
      <div>
      <div className="dashboard-qa-button-container">
      <button id="toggleAudioButton" className="audio-disabled" ref={toggleAudioButtonRef}>
  Audio Disabled
</button>


  <QABtnComponent />
</div>
      </div>
      
      <div className="right-button-panel">
        {rightPanelAdditionalItems}
        <div css={additionalActionsContainerStyles}>
          {showMenuDropdown && (
            <AntdDropdown
              trigger={['click']}
              overlay={additionalActionsMenu}
              {...menuDropdownProps}
            >
            
  <Button
      css={menuTriggerStyles}
      buttonStyle="tertiary"
      aria-label={t('Menu actions trigger')}
      tooltip={tooltipProps?.text}
      placement={tooltipProps?.placement}
      data-test="actions-trigger"
      >
      <Icons.MoreHoriz
        iconColor={theme.colors.primary.dark2}
        iconSize="l"
      />
  </Button>
            </AntdDropdown>
          )}
        </div>
      </div>
    </div>
  );
};
