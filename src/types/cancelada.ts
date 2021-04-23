export type NotaCanceladaType = {
  numeronota: number
  serie: string
  embarcador: string
}

export type NotaCanceladaResponseType = {
  embarque: {
    numero: string,
    serie: string
  },
  embarcador: {
    cnpj: string
  }
}
