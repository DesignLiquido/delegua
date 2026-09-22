import { AcessoElementoMatriz, AtribuicaoPorIndicesMatriz, Literal } from '../../fontes/construtos';
import { Simbolo } from '../../fontes/lexador';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

function criarLiteral(valor: number): Literal {
    return new Literal(0, 1, valor);
}

function criarSimbolo(): Simbolo {
    return new Simbolo(tiposDeSimbolos.COLCHETE_DIREITO, ']', null, 1, 0);
}

describe('AcessoElementoMatriz', () => {
    it('construtor inicializa propriedades corretamente', () => {
        const entidade = criarLiteral(0);
        const idx1 = criarLiteral(1);
        const idx2 = criarLiteral(2);
        const fechamento = criarSimbolo();
        const acesso = new AcessoElementoMatriz(0, entidade, idx1, idx2, fechamento);

        expect(acesso.entidadeChamada).toBe(entidade);
        expect(acesso.indicePrimario).toBe(idx1);
        expect(acesso.indiceSecundario).toBe(idx2);
        expect(acesso.simboloFechamento).toBe(fechamento);
        expect(acesso.hashArquivo).toBe(0);
    });

    it('paraTexto() contém tag e informações dos índices', () => {
        const acesso = new AcessoElementoMatriz(0, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarSimbolo());
        const texto = acesso.paraTexto();
        expect(texto).toContain('acesso-elemento-matriz');
    });

    it('paraTextoSaida() lança exceção', () => {
        const acesso = new AcessoElementoMatriz(0, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarSimbolo());
        expect(() => acesso.paraTextoSaida()).toThrow();
    });

    it('aceitar() invoca visitante com a instância', async () => {
        const acesso = new AcessoElementoMatriz(0, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarSimbolo());
        const visitante = { visitarExpressaoAcessoElementoMatriz: jest.fn() };
        await acesso.aceitar(visitante as any);
        expect(visitante.visitarExpressaoAcessoElementoMatriz).toHaveBeenCalledWith(acesso);
    });
});

describe('AtribuicaoPorIndicesMatriz', () => {
    it('construtor inicializa propriedades corretamente', () => {
        const obj = criarLiteral(0);
        const idx1 = criarLiteral(1);
        const idx2 = criarLiteral(2);
        const valor = criarLiteral(42);
        const atrib = new AtribuicaoPorIndicesMatriz(0, 1, obj, idx1, idx2, valor);

        expect(atrib.objeto).toBe(obj);
        expect(atrib.indicePrimario).toBe(idx1);
        expect(atrib.indiceSecundario).toBe(idx2);
        expect(atrib.valor).toBe(valor);
        expect(atrib.linha).toBe(1);
        expect(atrib.hashArquivo).toBe(0);
    });

    it('paraTexto() contém tag, objeto e índices', () => {
        const atrib = new AtribuicaoPorIndicesMatriz(0, 1, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarLiteral(42));
        const texto = atrib.paraTexto();
        expect(texto).toContain('atribuição-por-índices-matriz');
    });

    it('paraTextoSaida() lança exceção', () => {
        const atrib = new AtribuicaoPorIndicesMatriz(0, 1, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarLiteral(42));
        expect(() => atrib.paraTextoSaida()).toThrow();
    });

    it('aceitar() invoca visitante com a instância', async () => {
        const atrib = new AtribuicaoPorIndicesMatriz(0, 1, criarLiteral(0), criarLiteral(1), criarLiteral(2), criarLiteral(42));
        const visitante = { visitarExpressaoAtribuicaoPorIndicesMatriz: jest.fn() };
        await atrib.aceitar(visitante as any);
        expect(visitante.visitarExpressaoAtribuicaoPorIndicesMatriz).toHaveBeenCalledWith(atrib);
    });
});
