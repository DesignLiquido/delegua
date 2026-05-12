export interface ResultadoTeste {
    nomeSuite: string;
    nomeTeste: string;
    status: 'passou' | 'falhou' | 'pulado';
    mensagemErro?: string;
    tempoMs: number;
}

export interface ItemColetado {
    tipo: 'teste' | 'grupo';
    nome: string;
    fn: any;
    pular: boolean;
    apenas: boolean;
}

export interface EscopoHooks {
    antesDeCada: any[];
    antesDeTodos: any[];
    depoisDeCada: any[];
    depoisDeTodos: any[];
    itensColetados: ItemColetado[];
    temApenas: boolean;
}

export class RegistroTestes {
    resultados: ResultadoTeste[] = [];
    suiteAtual: string = '';
    pilhaEscopos: EscopoHooks[] = [];
    modoColeta: boolean = false;
}
