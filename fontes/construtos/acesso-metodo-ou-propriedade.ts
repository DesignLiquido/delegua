import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Chamado de `Get` em Égua Clássico, é o construto de acesso a métodos ou membros de
 * classe. Foi usado por Delégua até a versão 0.38.4, em que uma especialização maior
 * de tipos é necessária para o correto funcionamento da compilação por LLVM. Os demais
 * dialetos ainda a usam sem problemas.
 */
export class AcessoMetodoOuPropriedade<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    simbolo: SimboloInterface<TTipoSimbolo>;
    tipo?: string;

    constructor(
        hashArquivo: number,
        objeto: ConstrutoInterface,
        simbolo: SimboloInterface<TTipoSimbolo>,
        tipo: string = 'qualquer'
    ) {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.simbolo = simbolo;
        this.tipo = tipo || objeto.tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoMetodoOuPropriedade(this);
    }

    paraTexto(): string {
        return (
            `<acesso-método-ou-propriedade objeto=${this.objeto.paraTexto()} ` +
            `métodoOuPropriedade=${this.simbolo.lexema} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
