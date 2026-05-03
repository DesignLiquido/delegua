import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class AcessoMetodo implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    nomeMetodo: string;
    tipoRetornoMetodo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        objeto: ConstrutoInterface,
        nomeMetodo: string,
        tipoRetornoMetodo: string = 'qualquer'
    ) {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nomeMetodo = nomeMetodo;
        this.tipoRetornoMetodo = tipoRetornoMetodo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoMetodo(this);
    }

    paraTexto(): string {
        return `<acesso-método objeto=${this.objeto.paraTexto()} método=${this.nomeMetodo} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
