
import { VisitanteDeleguaInterface } from "../interfaces";
import { Construto } from "./construto";
import { Literal } from "./literal";

/**
 * Expressão usada para importação resolvida em tempo de execução.
 * Implementa a primeira forma de importação, também conhecida como importação dinâmica.
 */
export class ImportarComoConstruto implements Construto {
    linha: number;
    hashArquivo: number;
    caminho: Literal;
    
    constructor(caminho: Literal) {
        this.hashArquivo = caminho.hashArquivo;
        this.linha = caminho.linha;
        this.caminho = caminho;
    }
    
    valor?: any;
    tipo?: string;

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoImportar(this);
    }

    paraTexto(): string {
        return `<importar-como-construto caminho=${this.caminho.valor} />`;
    }
}