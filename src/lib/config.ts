/**
 * @fileoverview Arquivo de configuração para a funcionalidade de SOS.
 *
 * ONDE MODIFICAR AS CONFIGURAÇÕES DO SOS
 *
 * Este arquivo centraliza as informações padrão para a função de emergência.
 * Para alterar o número da polícia ou a mensagem de emergência padrão,
 * basta editar os valores abaixo.
 */

import type { SosSettings } from './types';

export const DEFAULT_SOS_SETTINGS: SosSettings = {
  /**
   * O número de telefone para o qual a chamada de emergência será direcionada.
   * No Brasil, o número da polícia é "190". Em outros países, este valor deve ser alterado.
   */
  policeNumber: '190',

  /**
   * A lista de contatos de emergência para quem a mensagem será enviada.
   * A usuária poderá editar esta lista nas configurações do aplicativo.
   * Inicialmente, a lista está vazia.
   */
  emergencyContacts: [],

  /**
   * O texto da mensagem de emergência que será enviada.
   * A usuária poderá personalizar esta mensagem nas configurações.
   */
  emergencyMessage: 'Preciso de ajuda. Minha localização está sendo enviada.',
};
