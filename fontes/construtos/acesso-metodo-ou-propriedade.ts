import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de
 * classe. Foi usado por Delégua até a versão 0.38.4, em que uma especialização maior
 * de tipos é necessária para o correto funcionamento da compilação por LLVM. Os demais
 * dialetos ainda a usam sem problemas.
 */
export class AcessoMetodoOuPropriedade<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    simbolo: SimboloInterface<TTipoSimbolo>;
    tipo?: string;

    constructor(hashArquivo: number, objeto: Construto, simbolo: SimboloInterface<TTipoSimbolo>, tipo: string = 'qualquer') {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.simbolo = simbolo;
        this.tipo = objeto.tipo || tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoMetodoOuPropriedade(this);
    }
}
