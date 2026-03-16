export interface VariavelInterface {
    valor: any;
    // TODO: Esses tipos não funcionam bem com `função<>`.
    // Estudar maneira de manter eles, ou simplesmente remover.
    // tipo: TipoInferencia | TipoNativoSimbolo;
    tipo: string;
    // subtipo?: 'texto' | 'número' | 'longo' | 'lógico';
    subtipo?: string;
    imutavel: boolean;
    tipoExplicito?: boolean;
    nomeReferencia?: string;
}
