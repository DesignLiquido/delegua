import { Construto } from '.';
import { uuidv4 } from '../geracao-identificadores';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';

/**
 * Declaração que pede a leitura de uma informação pela entrada
 * configurada no início da aplicação (por exemplo, o console).
 */
export class Leia implements Construto {
    linha: number;
    hashArquivo: number;

    simbolo: SimboloInterface;
    id: string;
    argumentos: Construto[];
    tipo?: string;
    numeroArgumentosEsperados?: number;
    eParaInterromper?: boolean;

    constructor(simbolo: SimboloInterface, argumentos: Construto[]) {
        this.linha = simbolo.linha;
        this.hashArquivo = simbolo.hashArquivo;
        this.simbolo = simbolo;
        this.id = uuidv4();
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLeia(this);
    }

    paraTexto(): string {
        return `<leia argumentos=[${this.argumentos.reduce((anterior, atual) => (anterior += atual.paraTexto()), '')}] />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
