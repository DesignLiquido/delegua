import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';
import {
    Bloco,
    Continua,
    Enquanto,
    Escreva,
    FuncaoDeclaracao,
    Para,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../../fontes/declaracoes';

import { Chamada, FuncaoConstruto } from '../../fontes/construtos';
import { ErroAvaliadorSintatico } from '../../fontes/avaliador-sintatico/erro-avaliador-sintatico';

describe('Avaliador Sintático Birl', () => {
    describe('analisar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;

        beforeEach(() => {
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Hello, World! Porra!', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW',
                        '  CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");',
                        '  BORA CUMPADE 0;',
                        'BIRL',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            });

            it('Sucesso - Variavel - Numero', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  MONSTRO M1 = 1; \n',
                        '  CE QUER VER ESSA PORRA? (M1); \n',
                        '  BORA CUMPADE 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - String', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    "   FRANGO FR = 'testes';\n",
                    '   CE QUER VER ESSA PORRA? (FR); \n',
                    '   BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - Float', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  TRAPEZIO M1 = 1.03; \n',
                        '  CE QUER VER ESSA PORRA? (M1); \n',
                        '  BORA CUMPADE 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - short int', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO M1 = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - long int', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRAO M1 = 16666666; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - double', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO DESCENDENTE TD = 0.37; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Variavel - unsigned char', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    `  BICEPS FRANGO TD = 'test'; \n`,
                    '  CE QUER VER ESSA PORRA? (TD); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - declaração - if', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (3 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
            });

            it('Sucesso - declaração - if else', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? (1 > 2)\n',
                    '     CE QUER VER ESSA PORRA? ("teste1");\n',
                    '   NAO VAI DAR NAO\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Se);
            });
            it('Sucesso - declaração - for - incremento', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 0; M < 5; M++)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Para);
            });

            it('Sucesso - declaração - for - decremento', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS (MONSTRO M = 5; M > 0; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(Para);
            });

            it('Sucesso - declaração - for - incremento - atribuição', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 5; M > 0; M--)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Para);
                const declaracao1 = retornoAvaliadorSintatico.declaracoes[0][0] as Var;
                expect(declaracao1.inicializador.valor).toBe(0);
                expect(declaracao1.simbolo.lexema).toBe('M');
                expect((retornoAvaliadorSintatico.declaracoes[1] as Para).corpo.declaracoes[0]).toBeInstanceOf(Escreva);
            });
            it('Sucesso - declaração - for - incremento - atribuição', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 5; M > 0; ++M)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Para);
                const declaracao1 = retornoAvaliadorSintatico.declaracoes[0][0] as Var;
                expect(declaracao1.inicializador.valor).toBe(0);
                expect(declaracao1.simbolo.lexema).toBe('M');
                expect((retornoAvaliadorSintatico.declaracoes[1] as Para).corpo.declaracoes[0]).toBeInstanceOf(Escreva);
            });
            it('Sucesso - declaração - while', () => {
                const RetornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO X = 5;\n',
                    '   NEGATIVA BAMBAM (X > 2)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       X--;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const RetornoAvaliadorSintatico = avaliadorSintatico.analisar(RetornoLexador, -1);
                expect(RetornoAvaliadorSintatico).toBeTruthy();
                expect(RetornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(RetornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(RetornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Enquanto);
            });
            it('Sucesso - declaração - break', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       SAI FILHO DA PUTA;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Para);
            });
            it('Sucesso - declaração - continue', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 0; M < 5; M++)\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       ELE QUE A GENTE QUER? (M > 2)\n',
                    '           SAI FILHO DA PUTA;\n',
                    '       NAO VAI DAR NAO\n',
                    '           VAMO MONSTRO;\n',
                    '       BIRL\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
                expect(retornoAvaliadorSintatico.declaracoes[1].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[1]).toBeInstanceOf(Para);
            });
            it('Sucesso - declaração - declaracaoFuncao', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   OH O HOME AI PO(MONSTRO NOMEFUNCAO(MONSTRO primeiro, MONSTRO segundo))\n',
                    '       MONSTRO C = primeiro + segundo;\n',
                    '       BORA CUMPADE C;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
                expect(retornoAvaliadorSintatico.declaracoes[0].assinaturaMetodo).toBe('<principal>');
                expect(retornoAvaliadorSintatico.declaracoes[0]).toBeInstanceOf(FuncaoDeclaracao);
                const declaracoes = retornoAvaliadorSintatico.declaracoes[0] as FuncaoDeclaracao;
                expect(declaracoes.tipoRetorno?.tipo).toBe('MONSTRO');
                const funcao = declaracoes.funcao as FuncaoConstruto;
                expect(funcao.parametros[0]).toHaveLength(2);
                expect(funcao.corpo).toHaveLength(2);
                expect(funcao.corpo[1]).toBeInstanceOf(Retorna);
                expect(funcao.corpo[0]).toBeInstanceOf(Array<Var>);
            });

            it('Sucesso - declaração - chamarFuncao', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO primeiro = 5;\n',
                    '   MONSTRO segundo = 10;\n',
                    '   MONSTRO resultado = AJUDA O MALUCO TA DOENTE SOMAR(primeiro, segundo);\n',
                    'BIRL\n',
                ]);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
                const declaracao3 = retornoAvaliadorSintatico.declaracoes[2] as unknown as Array<Var>;
                expect(declaracao3[0].tipo).toBe('numero');
                expect(declaracao3[0].assinaturaMetodo).toBe('<principal>');
                expect(declaracao3[0].inicializador.valor).toBeInstanceOf(Chamada);
            });
        });
        describe('Cenários de erro', () => {
            it('Falha - Programa vazio', () => {
                expect(() => avaliadorSintatico.analisar({ erros: [], simbolos: [] }, -1)).toThrow(
                    ErroAvaliadorSintatico
                );
                expect(() => {
                    avaliadorSintatico.analisar({ erros: [], simbolos: [] }, -1);
                }).toThrow(
                    expect.objectContaining({
                        message: 'Esperado expressão `HORA DO SHOW` para iniciar o programa',
                    })
                );
            });

            it('Falha - declaração - variavel = "=" no lugar do identificador', () => {
                const retornoLexador = lexador.mapear(['HORA DO SHOW \n', '   MONSTRO =;\n', 'BIRL\n']);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'MONSTRO'.",
                    })
                );
            });

            it('Falha - declaração - variavel - sem identificador', () => {
                const retornoLexador = lexador.mapear(['HORA DO SHOW \n', '   MONSTRO \n', 'BIRL\n']);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'MONSTRO'.",
                    })
                );
            });

            it('Falha - declaração - Escreva - com falha na expressão', () => {
                const retornoLexador = lexador.mapear(
                    ['HORA DO SHOW', '  CE QUER VER ESSA ? ("Hello, World! Porra!\n");', '  BORA CUMPADE 0;', 'BIRL'],
                    -1
                );

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado expressão `PORRA` após `ESSA` para escrever mensagem.',
                    })
                );
            });

            it('Falha - declaração - Frango - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    "   FRANGO = 'testes';\n",
                    '   CE QUER VER ESSA PORRA? (FR); \n',
                    '   BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'FRANGO'.",
                    })
                );
            });

            it('Falha - declaração - Trapezio - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'TRAPEZIO'.",
                    })
                );
            });

            it('Falha - declaração - short int - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO = 1.03; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'MONSTRINHO'.",
                    })
                );
            });

            it('Falha - declaração - long int - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRAO = 16666666; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'MONSTRAO'.",
                    })
                );
            });

            it('Falha - declaração - double - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  TRAPEZIO DESCENDENTE = 0.37; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'TRAPEZIO'.",
                    })
                );
            });

            it('Falha - declaração - unsigned char - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    `  BICEPS FRANGO = 'test'; \n`,
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado identificador após palavra reservada 'FRANGO'.",
                    })
                );
            });

            it('Falha - declaração - if - sem expressão', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? ()\n',
                    '     CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(TypeError);
            });

            it('Falha - declaração - if - sem bloco e sem expressão', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   ELE QUE A GENTE QUER? ()\n',
                    '     \n',
                    '   NAO VAI DAR NAO\n',
                    '     \n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(TypeError);
            });

            it('Falha - declaração - for - sem expressão', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS ( ; ; )\n',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado expressão `;` após a condição do `PARA`.',
                    })
                );
            });

            it('Falha - declaração - for - sem bloco e sem expressão', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MAIS QUERO MAIS ()',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado expressão `;` após a inicialização do `PARA`.',
                    })
                );
            });

            it('Falha - declaração - for - sem incremento e condição', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO M;\n',
                    '   MAIS QUERO MAIS (M = 5;)',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado expressão `;` após a condição do `PARA`.',
                    })
                );
            });

            it('Falha - declaração - while - sem expressão', () => {
                const RetornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO X = 5;\n',
                    '   NEGATIVA BAMBAM ()',
                    '       CE QUER VER ESSA PORRA? ("teste");\n',
                    '       X--;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(RetornoLexador, -1)).toThrow(TypeError);
            });

            it('Falha - declaração - declaracao - sem nome de funcão', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   OH O HOME AI PO(MONSTRO (MONSTRO primeiro, MONSTRO segundo)\n',
                    '       MONSTRO C = primeiro + segundo;\n',
                    '       BORA CUMPADE C;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado nome da função apos a declaração do tipo.',
                    })
                );
            });

            it('Falha - declaração - declaracao - sem declaração', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   OH O HOME AI PO(MONSTRO(MONSTRO primeiro, MONSTRO segundo))\n',
                    '       MONSTRO C = primeiro + segundo;\n',
                    '       BORA CUMPADE C;\n',
                    '   BIRL\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: 'Esperado nome da função apos a declaração do tipo.',
                    })
                );
            });

            it('Falha - declaração - chamarFuncao - sem identificador', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '   MONSTRO primeiro = 5;\n',
                    '   MONSTRO segundo = 10;\n',
                    '   MONSTRO resultado = AJUDA O MALUCO TA DOENTE (primeiro, segundo);\n',
                    'BIRL\n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(ErroAvaliadorSintatico);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Esperado ')' após a expressão.",
                    })
                );
            });

            it('Falha - declaração - Variavel - numero recebendo string', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    '  MONSTRINHO M1 = "Teste"; \n',
                    '  CE QUER VER ESSA PORRA? (M1); \n',
                    '  BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(Error);
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        message: "Simbolo passado para inicialização de variável do tipo MONSTRINHO não é válido."
                    })
                );
            });
        });
    });
});
