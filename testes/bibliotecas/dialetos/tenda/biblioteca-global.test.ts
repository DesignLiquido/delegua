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

        it('remova_todos(lista, item)', async () => {
            const codigo = [
                'seja v = [1, 2, 2, 3]',
                'Lista.remova_todos(v, 2)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2');
        });

        it('remova_por_índice(lista, índice)', async () => {
            const codigo = [
                'seja v = [10, 20, 30]',
                'Lista.remova_por_índice(v, 1)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('2');
        });

        it('índice_de(lista, item)', async () => {
            const codigo = [
                'seja v = [10, 20, 30]',
                'exiba(Lista.índice_de(v, 20))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('1');
        });

        it('índice_de(lista, item) - item ausente retorna -1', async () => {
            const codigo = [
                'seja v = [10, 20, 30]',
                'exiba(Lista.índice_de(v, 99))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-1');
        });

        it('limpa(lista)', async () => {
            const codigo = [
                'seja v = [1, 2, 3]',
                'Lista.limpa(v)',
                'exiba(Lista.tamanho(v))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
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
            const codigo = ['exiba(Matemática.aleatório())'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            const r = parseFloat(_saidas[0]);
            expect(isFinite(r)).toBe(true);
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThan(1);
        });

        it('aleatório(min, max) retorna valor no intervalo', async () => {
            const codigo = ['exiba(Matemática.aleatório(10, 20))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            const r = parseFloat(_saidas[0]);
            expect(isFinite(r)).toBe(true);
            expect(r).toBeGreaterThanOrEqual(10);
            expect(r).toBeLessThan(20);
        });

        it('constante pi', async () => {
            const codigo = ['seja p = Matemática.pi'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('constante e', async () => {
            const codigo = ['seja v = Matemática.e'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('constante maior_número', async () => {
            const codigo = ['seja v = Matemática.maior_número'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('constante menor_número', async () => {
            const codigo = ['seja v = Matemática.menor_número'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('seno(0)', async () => {
            const codigo = ['exiba(Matemática.seno(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('cosseno(0)', async () => {
            const codigo = ['exiba(Matemática.cosseno(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('1');
        });

        it('tangente(0)', async () => {
            const codigo = ['exiba(Matemática.tangente(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('arco_seno(0)', async () => {
            const codigo = ['exiba(Matemática.arco_seno(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('arco_cosseno(1)', async () => {
            const codigo = ['exiba(Matemática.arco_cosseno(1))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('arco_tangente(0)', async () => {
            const codigo = ['exiba(Matemática.arco_tangente(0))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('logaritmo_natural(1)', async () => {
            const codigo = ['exiba(Matemática.logaritmo_natural(1))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('logaritmo_10(1)', async () => {
            const codigo = ['exiba(Matemática.logaritmo_10(1))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('0');
        });

        it('aleatório(max) retorna valor entre 0 e max', async () => {
            const codigo = ['exiba(Matemática.aleatório(100))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            const r = parseInt(_saidas[0]);
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThan(100);
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

        it('para_lista(t, sep)', async () => {
            const codigo = [
                'seja l = Texto.para_lista("a,b,c", ",")',
                'exiba(Lista.tamanho(l))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('3');
        });

        it('de_lista(lista, sep)', async () => {
            const codigo = [
                'seja l = ["a", "b", "c"]',
                'exiba(Texto.de_lista(l, "-"))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('a-b-c');
        });

        it('índice_de(t, sub)', async () => {
            const codigo = ['exiba(Texto.índice_de("Olá Tenda", "Tenda"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('4');
        });

        it('índice_de(t, sub) - ausente retorna -1', async () => {
            const codigo = ['exiba(Texto.índice_de("Olá Tenda", "xyz"))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('-1');
        });
    });

    describe('Data', () => {
        it('agora() retorna timestamp', async () => {
            const codigo = ['exiba(Data.agora())'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            const ts = parseFloat(_saidas[0]);
            expect(typeof ts).toBe('number');
            expect(ts).toBeGreaterThan(0);
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

        it('para_timestamp(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja t = Data.para_timestamp(${ts})`, 'exiba(t)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(ts));
        });

        it('de_iso(iso)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja t = Data.de_iso("2024-06-15T12:00:00.000Z")`, 'exiba(t)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(ts));
        });

        it('de_timestamp(ts)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja t = Data.de_timestamp(${ts})`, 'exiba(t)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe(String(ts));
        });

        it('mês(data)', async () => {
            // Noon UTC Jun 15 2024 - safely June in all timezones
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`exiba(Data.mês(${ts}))`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('6');
        });

        it('dia(data)', async () => {
            // Noon UTC Jun 15 2024 - safely the 15th in all timezones
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`exiba(Data.dia(${ts}))`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('15');
        });

        it('dia_da_semana(data)', async () => {
            // Jun 15, 2024 is a Saturday (getDay() = 6), noon UTC
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`exiba(Data.dia_da_semana(${ts}))`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('6');
        });

        it('hora(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja h = Data.hora(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('minuto(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 30, 0);
            const codigo = [`seja m = Data.minuto(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('segundo(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 30, 45);
            const codigo = [`seja s = Data.segundo(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('desvio_fuso_horário(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja d = Data.desvio_fuso_horário(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('com_região(data, região)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja s = Data.com_região(${ts}, "pt-BR")`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('dia_do_ano(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja d = Data.dia_do_ano(${ts})`];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
        });

        it('semana_do_ano(data)', async () => {
            const ts = Date.UTC(2024, 5, 15, 12, 0, 0);
            const codigo = [`seja s = Data.semana_do_ano(${ts})`];
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

        it('Saída.escreva(texto)', async () => {
            const codigo = ['Saída.escreva("Olá escreva!")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('Olá escreva!');
        });

        it('Saída.exiba(nulo) exibe "nulo"', async () => {
            const codigo = ['Saída.exiba(nulo)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('nulo');
        });

        it('Saída.leia(mensagem)', async () => {
            interpretador.interfaceEntradaSaida = {
                question: (_mensagem: string, callback: Function) => {
                    callback('resposta teste');
                },
            };
            const codigo = [
                'seja r = Saída.leia("Digite algo: ")',
                'exiba(r)',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('resposta teste');
        });

        it('Saída.entrada()', async () => {
            interpretador.interfaceEntradaSaida = {
                question: (_mensagem: string, callback: Function) => {
                    callback('entrada direta');
                },
            };
            const codigo = [
                'seja r = Saída.entrada()',
                'exiba(r)',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retorno.erros).toHaveLength(0);
            expect(_saidas[0]).toBe('entrada direta');
        });
    });
});
