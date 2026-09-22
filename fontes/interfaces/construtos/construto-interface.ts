import { VisitanteComumInterface } from '..';

export interface ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor?: any;
    tipo?: string;
    /**
     * Pode retornar o valor avaliado diretamente, ou uma `Promise` dele — nunca force `await`
     * aqui sem necessidade; ver `fontes/interpretador/encadear.ts` para o porquê e o padrão a
     * seguir ao implementar isto para um novo tipo de construto/declaração.
     */
    aceitar(visitante: VisitanteComumInterface): any;
    paraTexto(): string;
    paraTextoSaida(): string;
}
