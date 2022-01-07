export class ErroEmTempoDeExecucao extends Error {
  simbolo: any;
  mensagem: string;

  constructor(simbolo?: any, mensagem?: string) {
    super(mensagem);
    this.simbolo = simbolo;
    this.mensagem = mensagem;
  }
};

export class ContinueException extends Error { };

export class BreakException extends Error { };

export class ReturnException extends Error {
  valor: any;

  constructor(valor: any) {
    super(valor);
    this.valor = valor;
  }
};