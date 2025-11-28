import { SimboloInterface, VisitanteDeleguaInterface } from '../interfaces';
import { Construto } from './construto';

export class SeTernario<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    condicao: Construto;
    expressaoSe: Construto;
    operador: SimboloInterface<TTipoSimbolo>;
    expressaoSenao: Construto;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        condicao: Construto,
        expressaoSe: Construto,
        operador: SimboloInterface<TTipoSimbolo>,
        expressaoSenao: Construto
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
