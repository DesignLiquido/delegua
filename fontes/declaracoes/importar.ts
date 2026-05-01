import { ConstrutoInterface, SimboloInterface, VisitanteDeleguaInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Declaração usada para segunda forma de importação.
 * Para Delégua, a partir da versão 0.40.0, importações de módulos resolvem
 * no avaliador sintático, já que alguma resolução de tipo é necessária.
 */
export class Importar extends Declaracao {
    caminho: ConstrutoInterface;
    simboloTudo: SimboloInterface | null = null;
    elementosImportacao: SimboloInterface[] = [];

    constructor(caminho: ConstrutoInterface) {
        super(caminho.linha, caminho.hashArquivo);
        this.caminho = caminho;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarDeclaracaoImportar(this);
    }

    paraTexto(): string {
        return `<importar caminho=${this.caminho.valor} />`;
    }
}
