import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Classe } from '../../fontes/declaracoes';
import { DespachadorFFIInterface, lerMetadadosClasse, lerMetadadosMetodo } from '../../fontes/ffi';
import { Decorador } from '../../fontes/construtos';
import { Interpretador } from '../../fontes/interpretador';
import { DescritorTipoClasse, FuncaoPadrao } from '../../fontes/interpretador/estruturas';
import { Lexador } from '../../fontes/lexador';

describe('FFI', () => {
    describe('lerMetadadosClasse()', () => {
        it('Retorna null quando não há decoradores', () => {
            expect(lerMetadadosClasse([])).toBeNull();
        });

        it('Retorna null quando o decorador não é @definicao', () => {
            const decorador = new Decorador(-1, 1, 'outro', { biblioteca: 'libssl' });
            expect(lerMetadadosClasse([decorador])).toBeNull();
        });

        it('Retorna null quando @definicao não tem atributo biblioteca', () => {
            const decorador = new Decorador(-1, 1, 'definicao', { prefixo: 'SSL_' });
            expect(lerMetadadosClasse([decorador])).toBeNull();
        });

        it('Extrai biblioteca e prefixo de @definicao', () => {
            const decorador = new Decorador(-1, 1, 'definicao', { biblioteca: 'ssl', prefixo: 'SSL_' });
            const resultado = lerMetadadosClasse([decorador]);
            expect(resultado).not.toBeNull();
            expect(resultado!.biblioteca).toBe('ssl');
            expect(resultado!.prefixo).toBe('SSL_');
        });

        it('Usa prefixo vazio quando não especificado', () => {
            const decorador = new Decorador(-1, 1, 'definicao', { biblioteca: 'm' });
            const resultado = lerMetadadosClasse([decorador]);
            expect(resultado).not.toBeNull();
            expect(resultado!.prefixo).toBe('');
        });
    });

    describe('lerMetadadosMetodo()', () => {
        it('Usa prefixo + nome quando não há @definicao no método', () => {
            const resultado = lerMetadadosMetodo([], 'conectar', 'SSL_');
            expect(resultado.simbolo).toBe('SSL_conectar');
        });

        it('Usa prefixo vazio + nome quando prefixo é vazio', () => {
            const resultado = lerMetadadosMetodo([], 'cos', '');
            expect(resultado.simbolo).toBe('cos');
        });

        it('Usa simbolo explícito de @definicao do método, ignorando o prefixo', () => {
            const decorador = new Decorador(-1, 1, 'definicao', { simbolo: 'SSL_CTX_new' });
            const resultado = lerMetadadosMetodo([decorador], 'novoContexto', 'SSL_');
            expect(resultado.simbolo).toBe('SSL_CTX_new');
        });

        it('Ignora @definicao de método sem atributo simbolo e cai no padrão', () => {
            const decorador = new Decorador(-1, 1, 'definicao', { outro: 'valor' });
            const resultado = lerMetadadosMetodo([decorador], 'conectar', 'SSL_');
            expect(resultado.simbolo).toBe('SSL_conectar');
        });
    });

    describe('DespachadorFFIInterface — integração com InterpretadorBase', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let interpretador: Interpretador;
        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => { _saidas.push(texto); };

        beforeEach(() => {
            _saidas = [];
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            interpretador = new Interpretador(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        it('Sem despachador, classe estrangeira ainda lança erro ao instanciar', async () => {
            const codigo = [
                '@definicao(biblioteca="m")',
                'classe estrangeira LibM {',
                '    cosseno(x: numero): numero',
                '}',
                'var r = LibM()',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Com despachador mock que retorna null, comportamento padrão é preservado', async () => {
            const despachadorMock: DespachadorFFIInterface = {
                resolverClasseEstrangeira: () => null,
                descarregarTudo: () => {},
            };
            interpretador.despachadorFFI = despachadorMock;

            const codigo = [
                '@definicao(biblioteca="m")',
                'classe estrangeira LibM {',
                '    cosseno(x: numero): numero',
                '}',
                'var r = LibM()',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Com despachador mock que retorna DescritorTipoClasse, métodos são chamados', async () => {
            // O mock simula o que DespachadorFFINodeJs faria para libm.cos
            const despachadorMock: DespachadorFFIInterface = {
                resolverClasseEstrangeira: (_declaracao: Classe): DescritorTipoClasse => {
                    const descritor = new DescritorTipoClasse(
                        { lexema: 'LibM', linha: 1, hashArquivo: -1, tipo: 'IDENTIFICADOR', literal: undefined },
                        [],
                        {},
                        []
                    );
                    descritor.classeEstatica = true;
                    // Simula libm.cos(0.0) = 1.0
                    descritor.metodosEstaticos['cosseno'] = new FuncaoPadrao(
                        1,
                        (_interp: any, x: number) => 1.0
                    );
                    return descritor;
                },
                descarregarTudo: () => {},
            };
            interpretador.despachadorFFI = despachadorMock;

            const codigo = [
                '@definicao(biblioteca="m")',
                'classe estrangeira LibM {',
                '    cosseno(x: numero): numero',
                '}',
                'escreva(LibM.cosseno(0.0))',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toBe('1');
        });

        it('Despachador mock é invocado com a declaração correta', async () => {
            let declaracaoRecebida: Classe | null = null;
            const despachadorMock: DespachadorFFIInterface = {
                resolverClasseEstrangeira: (declaracao: Classe) => {
                    declaracaoRecebida = declaracao;
                    return null;
                },
                descarregarTudo: () => {},
            };
            interpretador.despachadorFFI = despachadorMock;

            const codigo = [
                '@definicao(biblioteca="ssl", prefixo="SSL_")',
                'classe estrangeira ConexaoSSL {',
                '    conectar(socket: inteiro): inteiro',
                '}',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(declaracaoRecebida).not.toBeNull();
            expect(declaracaoRecebida!.simbolo.lexema).toBe('ConexaoSSL');
            expect(declaracaoRecebida!.estrangeira).toBe(true);

            const metaClasse = lerMetadadosClasse(declaracaoRecebida!.decoradores);
            expect(metaClasse).not.toBeNull();
            expect(metaClasse!.biblioteca).toBe('ssl');
            expect(metaClasse!.prefixo).toBe('SSL_');
        });
    });
});
