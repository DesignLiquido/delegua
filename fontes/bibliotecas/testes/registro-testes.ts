export interface ResultadoTeste {
    nomeSuite: string;
    nomeTeste: string;
    status: 'passou' | 'falhou';
    mensagemErro?: string;
    tempoMs: number;
}

export class RegistroTestes {
    resultados: ResultadoTeste[] = [];
    suiteAtual: string = '';
}
