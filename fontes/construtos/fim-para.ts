import { Declaracao } from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { Binario } from './binario';
import { Construto } from './construto';

/**
 * Construto especial para algumas linguagens como VisuAlg, que combina a 
 * avaliação da condição de continuação com o incremento. 
 * 
 * No caso específico do VisuAlg, ao final da última execução do bloco `para`,
 * o incremento não deve acontecer.
 *
 * Considerando como o depurador executa, o efeito visualnusando apenas as 
 * declarações já existentes causava umansérie de comportamentos estranhos.
 */
export class FimPara implements Construto {
    linha: number;
    hashArquivo: number;
    condicaoPara: Binario;
    incremento?: Declaracao;

    constructor(hashArquivo: number, linha: number, condicaoPara: Binario, blocoIncremento?: Declaracao) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
        this.condicaoPara = condicaoPara;
        this.incremento = blocoIncremento;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoFimPara(this);
    }
}
