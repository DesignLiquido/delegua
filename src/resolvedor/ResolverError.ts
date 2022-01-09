export class ResolverError extends Error {
    mensagem: String;

    constructor(mensagem) {
        super(mensagem);
        this.mensagem = mensagem;
    }
}
