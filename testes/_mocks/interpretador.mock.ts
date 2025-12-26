export function criarInterpretadorMock() {
    return {
        hashArquivoDeclaracaoAtual: 'arquivo-mock',
        linhaDeclaracaoAtual: 1,
        proximoEscopo: undefined,
        pilhaEscoposExecucao: {
            atribuirVariavel: jest.fn(),
            definirVariavel: jest.fn(),
        },
        executarBloco: jest.fn(),
        // Um resolver simples que imita a lógica mínima do interpretador real
        resolverValor(objeto: any) {
            if (objeto === null || objeto === undefined) return objeto;
            if (objeto && objeto.hasOwnProperty && objeto.hasOwnProperty('valorRetornado')) {
                return objeto.valorRetornado.valor;
            }
            if (objeto && objeto.hasOwnProperty && objeto.hasOwnProperty('valor')) {
                return objeto.valor;
            }
            return objeto;
        },
    } as any;
}
