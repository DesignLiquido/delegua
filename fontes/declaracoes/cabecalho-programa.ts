import { VisitanteComumInterface } from "../interfaces";
import { Declaracao } from "./declaracao";

export class CabecalhoPrograma extends Declaracao {
    nomeProgramaAlgoritmo: string;

    constructor(linha: number, hashArquivo: number, nomeProgramaAlgoritmo: string) {
        super(linha, hashArquivo);
        this.nomeProgramaAlgoritmo = nomeProgramaAlgoritmo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarDeclaracaoCabecalhoPrograma(this);
    }
}