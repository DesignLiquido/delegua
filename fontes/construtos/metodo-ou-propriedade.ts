import { VisitanteComumInterface, SimboloInterface } from '../interfaces'
import { Construto } from './construto'

export class MetodoOuPropriedade<TTipoSimbolo extends string = string> implements Construto {
  linha: number
  hashArquivo: number

  simboloMetodoOuPropriedade: SimboloInterface<TTipoSimbolo>

  constructor(
    hashArquivo: number,
    simboloMetodoOuPropriedade: SimboloInterface<TTipoSimbolo>
  ) {
    this.linha = Number(simboloMetodoOuPropriedade.linha)
    this.hashArquivo = hashArquivo
    this.simboloMetodoOuPropriedade = simboloMetodoOuPropriedade
  }

  async aceitar(visitante: VisitanteComumInterface): Promise<any> {
    return Promise.resolve(visitante.visitarExpressaoMetodoOuPropriedade(this))
  }
}