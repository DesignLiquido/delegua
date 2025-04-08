import { Literal } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração usada para importação resolvida em tempo de execução. 
 * Para Delégua, a partir da versão 0.40.0, importações de módulos resolvem
 * no avaliador sintático, já que alguma resolução de tipo é necessária.
 */
export class Importar extends Declaracao {
    caminho: Literal;

    constructor(caminho: Literal) {
        super(caminho.linha, caminho.hashArquivo);
        this.caminho = caminho;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoImportar(this);
    }
}
