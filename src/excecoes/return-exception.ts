
export class ReturnException extends Error {
  valor: any;

  constructor(valor: any) {
    super(valor);
    this.valor = valor;
    Object.setPrototypeOf(this, ReturnException.prototype);
  }
}
