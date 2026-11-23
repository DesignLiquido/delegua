import { AvaliadorSintaticoCalango } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { LexadorCalango } from '../../fontes/lexador/dialetos';
import { TradutorReversoCalango } from '../../fontes/tradutores';
import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

describe('Tradutor Calango -> Delégua', () => {
    let tradutor: TradutorReversoCalango;
    let lexador: LexadorCalango;
    let avaliadorSintatico: AvaliadorSintaticoCalango;

    beforeEach(() => {
        tradutor = new TradutorReversoCalango();
        lexador = new LexadorCalango();
        avaliadorSintatico = new AvaliadorSintaticoCalango();
    });

    async function traduzirCodigoCalango(codigo: string): Promise<string> {
        const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        return tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
    }

    describe('Código', () => {
        it('escreva/escreval -> escreva', async () => {
            const codigo = `algoritmo semNome;
            principal
	            escreva("Olá mundo");
	            escreval("Outra linha");
            fimPrincipal`;

            const resultado = await traduzirCodigoCalango(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá mundo'\)/i);
            expect(resultado).toMatch(/escreva\('Outra linha'\)/i);
        });

        it('declarações tipadas, atribuições e operadores', async () => {
            const codigo = `algoritmo semNome;
            principal
            inteiro idade;
            real preco;
            logico ativo;
            texto nome;
            idade = 10;
            preco = 10 div 3;
            ativo = nao falso;
            nome = "Ana";
            fimPrincipal`;

            const resultado = await traduzirCodigoCalango(codigo);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var idade = 0/i);
            expect(resultado).toMatch(/var preco = 0/i);
            expect(resultado).toMatch(/var ativo = falso/i);
            expect(resultado).toMatch(/var nome = ''/i);
            expect(resultado).toMatch(/idade = 10/i);
            expect(resultado).toMatch(/preco = 10 \\ 3/i);
            expect(resultado).toMatch(/ativo = nao falso/i);
            expect(resultado).toMatch(/nome = 'Ana'/i);
        });

        it('condicionais e enquanto', async () => {
            const codigo = `algoritmo semNome;
            principal
            inteiro i;
            i = 0;
            enquanto (i < 3) faca
                se (i = 1) entao
                    escreval("um");
                senao
                    escreval("outro");
                fimSe
                i = i + 1;
            fimEnquanto
            fimPrincipal`;

            const resultado = await traduzirCodigoCalango(codigo);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/enquanto \(i < 3\) \{/i);
            expect(resultado).toMatch(/se \(i == 1\) \{/i);
            expect(resultado).toMatch(/senao \{/i);
            expect(resultado).toMatch(/i = i \+ 1/i);
        });

        it('vetores, atribuição por índice e para', async () => {
            const codigo = `algoritmo semNome;
            principal
            inteiro i;
            inteiro v[3];
            v[0] = 10;
            v[1] = 20;
            para i de 1 ate 2 passo 1 faca
                escreval(v[0]);
            fimPara
            fimPrincipal`;

            const resultado = await traduzirCodigoCalango(codigo);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/var v = \[0, 0, 0\]/i);
            expect(resultado).toMatch(/v\[0\] = 10/i);
            expect(resultado).toMatch(/v\[1\] = 20/i);
            expect(resultado).toMatch(/para \(i = 1; i <= 2; i = i \+ 1\) \{/i);
        });

        it('função e procedimento', async () => {
            const codigo = `algoritmo semNome;
            funcao dobrar(inteiro n): inteiro
            inteiro resultado;
            resultado = n + n;
            retorna resultado;
            fimFuncao
            procedimento saudar(texto nome)
            escreval(nome);
            fimProcedimento
            principal
            escreval(dobrar(2));
            saudar("Ana");
            fimPrincipal`;

            const resultado = await traduzirCodigoCalango(codigo);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/funcao dobrar\(n: inteiro\): inteiro \{/i);
            expect(resultado).toMatch(/retorna resultado/i);
            expect(resultado).toMatch(/funcao saudar\(nome: texto\) \{/i);
            expect(resultado).toMatch(/escreva\(dobrar\(2\)\)/i);
            expect(resultado).toMatch(/saudar\('Ana'\)/i);
        });
    });
});

describe('Tradutor Calango -> Delégua (árvore sintática de Delégua)', () => {
    const traduzir = async (codigo: string[]) => {
        const lexador = new Lexador();
        const avaliadorSintatico = new AvaliadorSintatico();
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(lexador.mapear(codigo, -1), -1);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
        return new TradutorReversoCalango().traduzir(retornoAvaliadorSintatico.declaracoes);
    };

    it.each([
        [['escreva(1 - 2 * 3 / 4 % 5 ** 6)'], 'escreva(1 - 2 * 3 / 4 % 5 ^ 6)'],
        [['escreva(1 == 2, 1 != 2, 1 > 2, 1 >= 2, 1 < 2, 1 <= 2)'], 'escreva(1 == 2, 1 != 2, 1 > 2, 1 >= 2, 1 < 2, 1 <= 2)'],
        [['escreva(verdadeiro e falso ou verdadeiro)'], 'escreva(verdadeiro e falso ou verdadeiro)'],
        [['escreva((1 + 2) * 3)'], 'escreva((1 + 2) * 3)'],
        [['var v = [1, 2]', 'v[0] = 5'], 'var v = [1, 2]\nv[0] = 5'],
        [['var f = funcao(a, b) { retorna a }'], 'var f = funcao(a, b) {\n    retorna a\n}'],
        [['var x = leia("a")'], "var x = leia('a')"],
        [['var y = nulo'], 'var y = nulo'],
        [['var x = 1', 'x++'], 'var x = 1\nx++'],
        [['escreva(!verdadeiro)'], 'escreva(nao verdadeiro)'],
        [
            ['escolha 1 { caso 1: escreva(1) caso 2: caso 3: escreva(2) padrao: escreva(3) }'],
            'escolha (1) {\n    caso 1:\n        escreva(1)\n    caso 2:\n    caso 3:\n        escreva(2)\n    padrao:\n        escreva(3)\n}',
        ],
        [['fazer { escreva(1) } enquanto falso'], 'fazer {\n    escreva(1)\n} enquanto (falso)'],
        [
            ['se 1 > 2 { escreva(1) } senao se 2 > 1 { escreva(2) } senao { escreva(3) }'],
            'se (1 > 2) {\n    escreva(1)\n} senao se (2 > 1) {\n    escreva(2)\n} senao {\n    escreva(3)\n}',
        ],
        [['var x'], 'var x'],
    ])('Traduz %j', async (codigo: string[], esperado: string) => {
        expect(await traduzir(codigo)).toBe(esperado);
    });

    it('Elemento não suportado', async () => {
        await expect(traduzir(['classe A { }'])).rejects.toThrow('Elemento não suportado pelo tradutor Calango reverso: Classe');
    });
});
