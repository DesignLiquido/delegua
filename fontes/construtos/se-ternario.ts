import { SimboloInterface, VisitanteDeleguaInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class SeTernario<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    condicao: ConstrutoInterface;
    expressaoSe: ConstrutoInterface;
    operador: SimboloInterface<TTipoSimbolo>;
    expressaoSenao: ConstrutoInterface;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        condicao: ConstrutoInterface,
        expressaoSe: ConstrutoInterface,
        operador: SimboloInterface<TTipoSimbolo>,
        expressaoSenao: ConstrutoInterface
    ) {
        this.linha = condicao.linha;
        this.hashArquivo = hashArquivo;

        this.condicao = condicao;
        this.expressaoSe = expressaoSe;
        this.expressaoSenao = expressaoSenao;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoSeTernario(this);
    }

    paraTexto(): string {
        return `<se-ternário condicao=${this.condicao.paraTexto()} expressaoSe=${this.expressaoSe.paraTexto()} expressaoSenao=${this.expressaoSenao.paraTexto()} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
