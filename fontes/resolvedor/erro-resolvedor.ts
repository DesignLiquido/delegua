export class ErroResolvedor extends Error {
    mensagem: String;

    constructor(mensagem: any) {
        super(mensagem);
        this.mensagem = mensagem;
    }
}
