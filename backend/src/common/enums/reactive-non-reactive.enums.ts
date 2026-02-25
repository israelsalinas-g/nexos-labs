/**
 * Enum para resultados Reactivo/No reactivo (común en pruebas serológicas)
 */
export enum ReactiveNonReactive {
  REACTIVO = 'Reactivo',
  NO_REACTIVO = 'No reactivo'
}

export const ReactiveNonReactiveLabels = {
  [ReactiveNonReactive.REACTIVO]: 'Reactivo',
  [ReactiveNonReactive.NO_REACTIVO]: 'No reactivo'
};
