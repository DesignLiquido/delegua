import { AvaliadorSintaticoCalango } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { LexadorCalango } from '../../fontes/lexador/dialetos';
import { TradutorReversoCalango } from '../../fontes/tradutores';

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
