import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de
 * classe.
 */
export class AcessoMetodoOuPropriedade implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    simbolo: SimboloInterface;

    constructor(hashArquivo: number, objeto: Construto, simbolo: SimboloInterface) {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.simbolo = simbolo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoMetodo(this);
    }
}
