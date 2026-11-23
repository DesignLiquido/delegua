import { LexadorTenda } from '../../../../fontes/lexador/dialetos';
import { AvaliadorSintaticoTenda } from '../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-tenda';
import { InterpretadorTenda } from '../../../../fontes/interpretador/dialetos/tenda';

describe('Interpretador (Tenda)', () => {
    let saidas: string[];

    const executar = async (codigo: string[]) => {
        saidas = [];
        const funcaoSaida = (texto: string) => saidas.push(texto);
        const lexador = new LexadorTenda();
        const avaliadorSintatico = new AvaliadorSintaticoTenda();
        const interpretador = new InterpretadorTenda(process.cwd(), false, funcaoSaida, funcaoSaida);
        const retornoLexador = lexador.mapear(codigo, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
        return retorno.erros.map(
            (erro: any) => erro.erroInterno?.message ?? erro.mensagem ?? erro.message ?? String(erro)
        );
    };

    it('Para cada em vetor', async () => {
        const erros = await executar(['seja v = [1, 2, 3]', 'para cada item em v faça', '    exiba(item)', 'fim']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['1', '2', '3']);
    });

    it('Índices negativos em vetor', async () => {
        const erros = await executar(['seja v = [10, 20, 30]', 'exiba(v[-1])', 'v[-1] = 5', 'exiba(v)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['30', '[10, 20, 5]']);
    });

    it('Índices em texto', async () => {
        const erros = await executar(["seja t = 'abc'", 'exiba(t[1])', 'exiba(t[-1])']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['b', 'c']);
    });

    it('Chave inexistente em dicionário', async () => {
        const erros = await executar(["seja d = { 'nome': 'João' }", "exiba(d['nome'])", "exiba(d['x'])"]);
        expect(saidas).toEqual(['João']);
        expect(erros[0]).toContain("Chave 'x' não encontrada no dicionário.");
    });

    it('Definir propriedade em dicionário', async () => {
        const erros = await executar(["seja d = { 'nome': 'João' }", "d.nome = 'Maria'", 'exiba(d.nome)', 'exiba(d)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['Maria', '{"nome":"Maria"}']);
    });

    it('Exibição de vetor aninhado', async () => {
        const erros = await executar(['exiba([1, [2, 3], verdadeiro, "a"])']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(["[1, [2,3], verdadeiro, 'a']"]);
    });

    it('Exibição de dicionário', async () => {
        const erros = await executar(['exiba({ "a": verdadeiro, "b": [1,2] })']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['{"a":"verdadeiro","b":[1,2]}']);
    });

    it('Função nomeada', async () => {
        const erros = await executar(['seja somar(a, b) = faça', '    retorna a + b', 'fim', 'exiba(somar(3, 4))']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['7']);
    });

    it('Função anônima', async () => {
        const erros = await executar(['seja fn = função() -> faça', '    retorna 42', 'fim', 'exiba(fn())']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['42']);
    });

    it('Tamanho de vetor', async () => {
        const erros = await executar(['seja v = [1, 2, 3]', 'exiba(v.tamanho())']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['3']);
    });

    it('Literais especiais e unários', async () => {
        const erros = await executar(['exiba(nulo)', 'exiba(NaN)', 'exiba(infinito)', 'exiba(-5)', 'exiba(~5)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['nulo', 'NaN', 'Infinity', '-5', '-6']);
    });

    it('Operadores bit a bit e módulo', async () => {
        const erros = await executar([
            'exiba(1 << 3)',
            'exiba(8 >> 2)',
            'exiba(5 & 3)',
            'exiba(5 | 3)',
            'exiba(5 ^ 3)',
            'exiba(5 % 3)',
        ]);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['8', '2', '1', '7', '6', '2']);
    });

    it('Operações com texto', async () => {
        const erros = await executar(['exiba("a" * 3)', 'exiba("a" + 1)', 'exiba(1 + "a")', 'exiba(5 não é 3)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['aaa', 'a1', '1a', 'verdadeiro']);
    });

    it('Lógicos', async () => {
        const erros = await executar(['exiba(verdadeiro e falso)', 'exiba(verdadeiro ou falso)', 'exiba(nulo e 2)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['falso', 'verdadeiro', 'nulo']);
    });

    describe('Se / senão', () => {
        it('Senão', async () => {
            const erros = await executar([
                'seja x = 5',
                'se x > 10 então faça',
                '    exiba("a")',
                'fim senão faça',
                '    exiba("b")',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['b']);
        });

        it('Então', async () => {
            const erros = await executar(['seja x = 50', 'se x > 10 então faça', '    exiba("a")', 'fim']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['a']);
        });

        it('Senão se', async () => {
            const erros = await executar([
                'seja x = 5',
                'se x > 10 então faça',
                '    exiba("a")',
                'fim senão se x > 3 então faça',
                '    exiba("c")',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['c']);
        });

        it('Se em uma linha, sem bloco', async () => {
            const erros = await executar(['se verdadeiro então exiba("ok")']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['ok']);
        });
    });

    describe('Para cada', () => {
        it('Intervalo com literais', async () => {
            const erros = await executar(['para cada i em 1 até 3 faça', '    exiba(i)', 'fim']);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '2', '3']);
        });

        it('Intervalo com variáveis', async () => {
            const erros = await executar([
                'seja inicio = 2',
                'seja fim_ = 4',
                'para cada i em inicio até fim_ faça',
                '    exiba(i)',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['2', '3', '4']);
        });

        it('Continua e sustar dentro de se', async () => {
            const erros = await executar([
                'seja v = [1, 2, 3, 4]',
                'para cada item em v faça',
                '    se item é 2 então faça',
                '        continua',
                '    fim',
                '    se item é 4 então faça',
                '        sustar',
                '    fim',
                '    exiba(item)',
                'fim',
            ]);
            expect(erros).toHaveLength(0);
            expect(saidas).toEqual(['1', '3']);
        });
    });

    it('Negação com não', async () => {
        const erros = await executar(['exiba(não falso)', 'exiba(não verdadeiro)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['verdadeiro', 'falso']);
    });

    it('Operador tem', async () => {
        const erros = await executar(['seja v = [1, 2, 3]', 'exiba(v tem 2)', 'exiba(v tem 5)']);
        expect(erros).toHaveLength(0);
        expect(saidas).toEqual(['verdadeiro', 'falso']);
    });

    describe('Erros em tempo de execução', () => {
        it('Subtração de texto', async () => {
            const erros = await executar(['seja x = "a" - 1']);
            expect(erros[0]).toContain('Operadores precisam ser números.');
        });

        it('Índice de vetor fora do intervalo', async () => {
            const erros = await executar(['seja v = [1]', 'exiba(v[5])']);
            expect(erros[0]).toContain('Índice do vetor fora do intervalo.');
        });

        it('Indexação de número', async () => {
            const erros = await executar(['seja v = 5', 'exiba(v[0])']);
            expect(erros[0]).toContain(
                'Somente listas, dicionários, classes e objetos podem ter seus valores indexados.'
            );
        });

        it('Chamada de não chamável', async () => {
            const erros = await executar(['seja f = 5', 'f()']);
            expect(erros[0]).toContain('Só pode chamar função ou classe.');
        });

        it('Propriedade inexistente', async () => {
            const erros = await executar(['seja x = 1', 'exiba(x.algo)']);
            expect(erros[0]).toContain('Método ou propriedade para objeto não encontrado: algo.');
        });
    });
});
