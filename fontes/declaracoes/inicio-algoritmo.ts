import { VisitanteComumInterface } from "../interfaces";
import { Declaracao } from "./declaracao";

export class InicioAlgoritmo extends Declaracao {

    constructor(linha: number, hashArquivo: number) {
        super(linha, hashArquivo);
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarDeclaracaoInicioAlgoritmo(this);
    }
}
