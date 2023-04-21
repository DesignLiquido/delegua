import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Um construto de formatação de escrita é utilizado por instruções `escreva`
 * e derivadas para adição de espaços e casas decimais, este último para quando
 * o conteúdo da escrita é um número.
 */
export class FormatacaoEscrita implements Construto {
    linha: number;
    hashArquivo: number;
    expressao: Construto;
    espacos: number;
    casasDecimais: number;

    constructor(hashArquivo: number, linha: number, expressao: Construto, espacos?: number, casasDecimais?: number) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.expressao = expressao;
        this.espacos = espacos || -1;
        this.casasDecimais = casasDecimais || -1;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoFormatacaoEscrita(this);
    }
}
