module.exports.ErroEmTempoDeExecucao = class ErroEmTempoDeExecucao extends Error {
  constructor(simbolo, mensagem) {
    super(mensagem);
    this.simbolo = simbolo;
    this.mensagem = mensagem;
  }
};

module.exports.ContinueException = class ContinueException extends Error { };

module.exports.BreakException = class BreakException extends Error { };

module.exports.ReturnException = class ReturnException extends Error {
  constructor(valor) {
    super(valor);
    this.valor = valor;
  }
};