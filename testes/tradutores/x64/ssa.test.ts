import { AvaliadorSintatico } from '../../../fontes/avaliador-sintatico';
import { Lexador } from '../../../fontes/lexador';
import { LoweringX64 } from '../../../fontes/tradutores/x64/lowering';
import { construirSSA } from '../../../fontes/tradutores/x64/ssa';
import { IRFuncao } from '../../../fontes/tradutores/x64/ir';

async function lowerFuncao(linhas: string[], nomeFuncao: string): Promise<IRFuncao> {
    const lexador = new Lexador();
    const avaliadorSintatico = new AvaliadorSintatico();
    const retornoLexador = lexador.mapear(linhas, -1);
    const ast = await avaliadorSintatico.analisar(retornoLexador, 1);
    const programa = new LoweringX64().lowerPrograma(ast.declaracoes);
    const funcao = programa.funcoes.find((f) => f.nome === nomeFuncao)!;
    construirSSA(funcao);
    return funcao;
}

function todosOsPhis(funcao: IRFuncao) {
    return [...funcao.blocos.values()].flatMap((bloco) => bloco.phis.map((phi) => ({ blocoId: bloco.id, phi })));
}

describe('construção de SSA (x64)', () => {
    it('se/senão: variável atribuída nos dois ramos ganha exatamente um phi no bloco de junção', async () => {
        const funcao = await lowerFuncao(
            [
                'funcao teste(a: numero): numero {',
                '    var x: numero = 0',
                '    se (a > 0) {',
                '        x = 1',
                '    } senao {',
                '        x = 2',
                '    }',
                '    retorna x',
                '}',
            ],
            'teste'
        );

        const phisDeX = todosOsPhis(funcao).filter((p) => p.phi.variavel === 'x');
        expect(phisDeX.length).toBe(1);
        expect(phisDeX[0].phi.opcoes.length).toBe(2);

        // Nomes SSA de x devem ter versões distintas (x.1, x.2, x.3...), nunca reaproveitadas.
        const nomes = new Set(
            [...funcao.blocos.values()].flatMap((bloco) =>
                bloco.instrucoes.filter((i) => 'dst' in i && (i as any).dst?.startsWith('x.')).map((i) => (i as any).dst)
            )
        );
        expect(nomes.size).toBeGreaterThanOrEqual(2);
    });

    it('enquanto: variável do acumulador ganha phi no cabeçalho do laço', async () => {
        const funcao = await lowerFuncao(
            [
                'funcao teste(a: numero): numero {',
                '    var i: numero = 0',
                '    enquanto (i < a) {',
                '        i = i + 1',
                '    }',
                '    retorna i',
                '}',
            ],
            'teste'
        );

        const phisDeI = todosOsPhis(funcao).filter((p) => p.phi.variavel === 'i');
        expect(phisDeI.length).toBe(1);
        expect(phisDeI[0].phi.opcoes.length).toBe(2);
    });

    it('sem junção de controle, uma variável simples não recebe phi nenhum', async () => {
        const funcao = await lowerFuncao(['funcao teste(a: numero): numero {', '    var y: numero = a + 1', '    retorna y', '}'], 'teste');

        expect(todosOsPhis(funcao).length).toBe(0);
    });
});
