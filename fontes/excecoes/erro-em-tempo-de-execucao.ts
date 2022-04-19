import { SimboloInterface } from "../interfaces";

export class ErroEmTempoDeExecucao extends Error {
  simbolo: SimboloInterface;
  mensagem: string;
  linha?: number;

  constructor(simbolo?: SimboloInterface, mensagem?: string, linha?: number) {
    super(mensagem);
    this.simbolo = simbolo;
    this.mensagem = mensagem;
    this.linha = linha;
    Object.setPrototypeOf(this, ErroEmTempoDeExecucao.prototype);
  }
}
