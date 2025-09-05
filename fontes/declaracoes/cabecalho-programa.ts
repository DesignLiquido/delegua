import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

/**
 * Usado por dialetos que definem uma seção chamada `algoritmo`, seguida por um nome.
 */
export class CabecalhoPrograma extends Declaracao {
    nomeProgramaAlgoritmo: string;

    constructor(linha: number, hashArquivo: number, nomeProgramaAlgoritmo: string) {
        super(linha, hashArquivo);
        this.nomeProgramaAlgoritmo = nomeProgramaAlgoritmo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarDeclaracaoCabecalhoPrograma(this);
    }

    paraTexto(): string {
        return `<cabeçalho-programa nome=${this.nomeProgramaAlgoritmo} />`;
    }
}
