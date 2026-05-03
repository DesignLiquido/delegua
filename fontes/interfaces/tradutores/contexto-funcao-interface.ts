// ---------------------------------------------------------------------------
// Snapshot do contexto de função (usado para salvar/restaurar ao traduzir
// funções aninhadas na travessia da AST)
// ---------------------------------------------------------------------------
export interface ContextoFuncaoInterface {
    corpoDaFuncaoAtual: string;
    declaracoesLocaisAtual: string;
    locaisDeclaradosAtual: Set<string>;
    dentroFuncao: boolean;
    funcaoTemRetorno: boolean;
    variaveis: Map<string, { watNome: string; tipo: string; escopo: 'local' | 'global' }>;
}
