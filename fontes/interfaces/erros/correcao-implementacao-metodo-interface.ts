export interface CorrecaoImplementacaoMetodoInterface {
    tipo: 'implementar-metodo';
    nomeClasse: string;
    nomeMetodo: string;
    linhaDeclaracaoClasse: number;
    hashArquivoClasse?: number;
}
