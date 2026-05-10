export interface VariavelInterface {
    valor: any;
    tipo: string;
    // subtipo?: 'texto' | 'número' | 'longo' | 'lógico';
    subtipo?: string;
    imutavel: boolean;
    tipoExplicito?: boolean;
    nomeReferencia?: string;
}
