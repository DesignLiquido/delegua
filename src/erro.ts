export class ErroEmTempoDeExecucao extends Error {
  simbolo: any;
  mensagem: any;

  constructor(simbolo?: any, mensagem?: any) {
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