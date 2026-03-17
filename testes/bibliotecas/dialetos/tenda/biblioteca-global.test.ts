import { LexadorTenda } from '../../../../fontes/lexador/dialetos';
import { AvaliadorSintaticoTenda } from '../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-tenda';
import { InterpretadorTenda } from '../../../../fontes/interpretador/dialetos/tenda';

describe('Biblioteca Global Tenda', () => {
    let lexador: LexadorTenda;
    let avaliadorSintatico: AvaliadorSintaticoTenda;
    let interpretador: InterpretadorTenda;

    let _saidas: string[] = [];
    const funcaoSaida = (saida: string) => {
        _saidas.push(saida);
    };

    beforeEach(() => {
        _saidas = [];
        lexador = new LexadorTenda();
        avaliadorSintatico = new AvaliadorSintaticoTenda();
        interpretador = new InterpretadorTenda(process.cwd(), false, funcaoSaida, funcaoSaida);
    });

    describe('exiba()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear(['exiba("Olá Tenda!")'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toContain('Olá Tenda!');
        });
    });

    describe('Lista', () => {
        it('tamanho(lista)', async () => {
            const codigo = [
                'seja v = [1, 2, 3]',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('insira(lista, item)', async () => {
            const codigo = [
                'seja v = [1, 2]',
                'Lista.insira(v, 3)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('remova(lista, item)', async () => {
            const codigo = [
                'seja v = [1, 2, 3]',
                'Lista.remova(v, 2)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2');
        });

        it('obtenha(lista, índice)', async () => {
            const codigo = [
                'seja v = [10, 20, 30]',
                'exiba(Lista.obtenha(v, 1))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('20');
        });

        it('contém(lista, item)', async () => {
            const codigo = [
                'seja v = [1, 2, 3]',
                'exiba(Lista.contém(v, 2))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('vazio(lista) - com elementos', async () => {
            const codigo = [
                'seja v = [1]',
                'exiba(Lista.vazio(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('falso');
        });

        it('vazio(lista) - sem elementos', async () => {
            const codigo = [
                'seja v = []',
                'exiba(Lista.vazio(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('de_intervalo(início, fim)', async () => {
            const codigo = [
                'seja v = Lista.de_intervalo(1, 5)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('5');
        });

        it('de_texto(texto)', async () => {
            const codigo = [
                'seja v = Lista.de_texto("abc")',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('fatia(lista, início, fim)', async () => {
            const codigo = [
                'seja v = [1, 2, 3, 4, 5]',
                'seja f = Lista.fatia(v, 1, 3)',
                'exiba(Lista.tamanho(f))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2');
        });
    });

    describe('Matemática', () => {
        it('absoluto(n)', async () => {
            const codigo = ['exiba(Matemática.absoluto(-5))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('5');
        });

        it('arredonda(n)', async () => {
            const codigo = ['exiba(Matemática.arredonda(3.7))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('4');
        });

        it('teto(n)', async () => {
            const codigo = ['exiba(Matemática.teto(3.2))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('4');
        });

        it('piso(n)', async () => {
            const codigo = ['exiba(Matemática.piso(3.9))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('raiz_quadrada(n)', async () => {
            const codigo = ['exiba(Matemática.raiz_quadrada(9))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('potência(base, expoente)', async () => {
            const codigo = ['exiba(Matemática.potência(2, 10))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('1024');
        });

        it('máximo(a, b)', async () => {
            const codigo = ['exiba(Matemática.máximo(3, 7))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('7');
        });

        it('mínimo(a, b)', async () => {
            const codigo = ['exiba(Matemática.mínimo(3, 7))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('aleatório() retorna valor entre 0 e 1', async () => {
            const codigo = ['seja r = Matemática.aleatório()'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('constante pi', async () => {
            const codigo = ['seja p = Matemática.pi'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });
    });

    describe('Texto', () => {
        it('tamanho(t)', async () => {
            const codigo = ['exiba(Texto.tamanho("Olá"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('vazio(t) - com conteúdo', async () => {
            const codigo = ['exiba(Texto.vazio("Olá"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('falso');
        });

        it('vazio(t) - sem conteúdo', async () => {
            const codigo = ['exiba(Texto.vazio(""))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('para_maiúsculas(t)', async () => {
            const codigo = ['exiba(Texto.para_maiúsculas("olá"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('OLÁ');
        });

        it('para_minúsculas(t)', async () => {
            const codigo = ['exiba(Texto.para_minúsculas("OLÁ"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('olá');
        });

        it('contém(t, sub)', async () => {
            const codigo = ['exiba(Texto.contém("Olá Tenda", "Tenda"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('começa_com(t, prefixo)', async () => {
            const codigo = ['exiba(Texto.começa_com("Olá Tenda", "Olá"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('termina_com(t, sufixo)', async () => {
            const codigo = ['exiba(Texto.termina_com("Olá Tenda", "Tenda"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('verdadeiro');
        });

        it('subtexto(t, início, fim)', async () => {
            const codigo = ['exiba(Texto.subtexto("Olá Tenda", 0, 3))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('Olá');
        });

        it('repita(t, n)', async () => {
            const codigo = ['exiba(Texto.repita("ab", 3))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('ababab');
        });

        it('substitua(t, busca, rep)', async () => {
            const codigo = ['exiba(Texto.substitua("Olá Mundo", "Mundo", "Tenda"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('Olá Tenda');
        });
    });

    describe('Data', () => {
        it('agora() retorna timestamp', async () => {
            const codigo = ['seja ts = Data.agora()'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('ano(data)', async () => {
            // 2024-01-15T00:00:00.000Z em timestamp
            const ts = new Date('2024-01-15').getTime();
            const codigo = [`seja a = Data.ano(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('para_iso(data)', async () => {
            const ts = new Date('2024-01-15').getTime();
            const codigo = [`seja iso = Data.para_iso(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });
    });

    describe('Saída', () => {
        it('Saída.exiba(texto)', async () => {
            const codigo = ['Saída.exiba("Olá Saída!")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('Olá Saída!');
        });
    });
});
