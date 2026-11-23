import { Interpretador } from '../../fontes/interpretador';
import { AcessoMetodo, AcessoPropriedade, Literal, TuplaN } from '../../fontes/construtos';
import { DeleguaModulo, FuncaoPadrao, MetodoPrimitiva } from '../../fontes/interpretador/estruturas';

/**
 * `AcessoMetodo` e `AcessoPropriedade` são construtos já resolvidos pelo avaliador sintático
 * quando o tipo do objeto é conhecido. Estes testes exercitam diretamente as visitas
 * do interpretador para cada tipo de objeto suportado.
 */
describe('Interpretador - AcessoMetodo e AcessoPropriedade', () => {
    let interpretador: Interpretador;

    beforeEach(() => {
        interpretador = new Interpretador(process.cwd());
    });

    const literal = (valor: any) => new Literal(-1, 1, valor);

    const modulo = () => {
        const moduloTeste = new DeleguaModulo('teste');
        (moduloTeste.componentes as any)['componente'] = 42;
        return moduloTeste;
    };

    const tupla = () => new TuplaN(-1, 1, [literal(1), literal(2)]);

    describe.each([
        ['AcessoMetodo', (objeto: any, nome: string) => new AcessoMetodo(-1, objeto, nome), 'visitarExpressaoAcessoMetodo'],
        [
            'AcessoPropriedade',
            (objeto: any, nome: string) => new AcessoPropriedade(-1, objeto, nome),
            'visitarExpressaoAcessoPropriedade',
        ],
    ])('%s', (_nome: string, criar: (objeto: any, nome: string) => any, metodoVisita: string) => {
        const visitar = (objeto: any, nome: string) => (interpretador as any)[metodoVisita](criar(literal(objeto), nome));

        it('Valor nulo', async () => {
            await expect(visitar(null, 'x')).rejects.toThrow("de um valor nulo");
        });

        it('Primitiva de dicionário', async () => {
            expect(await visitar({ a: 1 }, 'chaves')).toBeInstanceOf(MetodoPrimitiva);
        });

        it('Chave de dicionário', async () => {
            expect(await visitar({ a: 1 }, 'a')).toBe(1);
            expect(await visitar({ a: 1 }, 'b')).toBeNull();
        });

        it('Função de objeto JavaScript', async () => {
            const funcao = () => 1;
            expect(await visitar(new (class { f = funcao })(), 'f')).toBe(funcao);
        });

        it('Objeto aninhado de objeto JavaScript', async () => {
            const aninhado = { x: 1 };
            expect(await visitar(new (class { o = aninhado })(), 'o')).toBe(aninhado);
        });

        it('Componente de módulo', async () => {
            expect(await visitar(modulo(), 'componente')).toBe(42);
            expect(await visitar(modulo(), 'inexistente')).toBeNull();
        });

        it('Membro inexistente', async () => {
            await expect(visitar(new (class { x = 1 })(), 'naoExiste')).rejects.toBeTruthy();
        });
    });

    it('AcessoMetodo em constante de tipo de função padrão', async () => {
        const funcao = new FuncaoPadrao(0, () => null);
        (funcao as any).MAXIMO = 10;
        expect(await interpretador.visitarExpressaoAcessoMetodo(new AcessoMetodo(-1, literal(funcao), 'MAXIMO'))).toBe(10);
    });

    it('AcessoMetodo em primitiva de tupla', async () => {
        const resultado = await interpretador.visitarExpressaoAcessoMetodo(new AcessoMetodo(-1, literal(tupla()), 'paraVetor'));
        expect(resultado).toBeInstanceOf(MetodoPrimitiva);
    });
});
