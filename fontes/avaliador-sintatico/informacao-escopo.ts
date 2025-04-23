import { FuncaoDeclaracao } from "../declaracoes";

export class InformacaoEscopo {
    variaveisEConstantes: { [nome: string]: string };
    referenciasFuncoes: { [nome: string]: FuncaoDeclaracao };

    constructor() {
        this.variaveisEConstantes = {};
        this.referenciasFuncoes = {};
    }
}
