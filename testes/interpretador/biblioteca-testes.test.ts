import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { ErroDeAssertiva } from '../../fontes/excecoes/erro-de-assertiva';
import { Interpretador } from '../../fontes/interpretador';
import { Lexador } from '../../fontes/lexador';

describe('Biblioteca de testes', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: Interpretador;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        interpretador = new Interpretador(process.cwd(), false, undefined, undefined);
    });

    async function executar(linhas: string[]) {
        const retornoLexador = lexador.mapear(linhas, -1);
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        return await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    }

    describe('importar', () => {
        it('importar { afirmar } de "testes" resolve sem erros', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('importar { afirmar, teste, grupo, lancarErro } de "testes" resolve sem erros', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo, lancarErro } de "testes"',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });
    });

    describe('afirmar.igual', () => {
        it('passa quando os valores são iguais', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.igual(4, 4)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('passa quando o resultado de uma expressão é igual ao esperado', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.igual(4, 2 + 2)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva quando os valores diferem', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.igual(4, 5)',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('afirmar.diferente', () => {
        it('passa quando os valores são diferentes', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.diferente(1, 2)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva quando os valores são iguais', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.diferente(1, 1)',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('afirmar.verdadeiro', () => {
        it('passa para valor verdadeiro', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.verdadeiro(verdadeiro)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva para valor falso', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.verdadeiro(falso)',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('afirmar.falso', () => {
        it('passa para valor falso', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.falso(falso)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva para valor verdadeiro', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.falso(verdadeiro)',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('afirmar.nulo', () => {
        it('passa para nulo', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.nulo(nulo)',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva para valor não nulo', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.nulo(1)',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('afirmar.erro', () => {
        it('passa quando a função lança um erro', async () => {
            const retorno = await executar([
                'importar { afirmar, falhar } de "testes"',
                'afirmar.erro(funcao() { falhar("erro esperado") })',
            ]);
            expect(retorno.erros).toHaveLength(0);
        });

        it('lança ErroDeAssertiva quando a função não lança erro', async () => {
            const retorno = await executar([
                'importar { afirmar } de "testes"',
                'afirmar.erro(funcao() { var x = 1 })',
            ]);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
        });
    });

    describe('lancarErro', () => {
        it('lança ErroDeAssertiva com a mensagem informada', async () => {
            const retornoLexador = lexador.mapear(['importar { lancarErro } de "testes"', 'lancarErro("falha intencional")'], -1);
            const retornoAS = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAS.declaracoes);
            expect(retorno.erros).toHaveLength(1);
            expect(retorno.erros[0].erroInterno).toBeInstanceOf(ErroDeAssertiva);
            expect(retorno.erros[0].erroInterno.mensagem).toBe('falha intencional');
        });
    });

    describe('teste', () => {
        it('registra um teste que passou', async () => {
            const retorno = await executar([
                'importar { afirmar, teste } de "testes"',
                'teste("soma funciona", funcao() {',
                '    afirmar.igual(4, 2 + 2)',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(1);
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[0].nomeTeste).toBe('soma funciona');
        });

        it('registra um teste que falhou', async () => {
            const retorno = await executar([
                'importar { afirmar, teste } de "testes"',
                'teste("soma errada", funcao() {',
                '    afirmar.igual(4, 5)',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(1);
            expect(interpretador.registroTestes.resultados[0].status).toBe('falhou');
        });
    });

    describe('grupo', () => {
        it('registra testes dentro de um grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo("Matemática", funcao() {',
                '    teste("adição", funcao() {',
                '        afirmar.igual(4, 2 + 2)',
                '    })',
                '    teste("subtração", funcao() {',
                '        afirmar.igual(0, 1 - 1)',
                '    })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].nomeSuite).toBe('Matemática');
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });

        it('restaura o suite anterior após executar o grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo("Grupo A", funcao() {',
                '    teste("teste dentro de A", funcao() {',
                '        afirmar.verdadeiro(verdadeiro)',
                '    })',
                '})',
                'teste("teste fora de grupo", funcao() {',
                '    afirmar.verdadeiro(verdadeiro)',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].nomeSuite).toBe('Grupo A');
            expect(interpretador.registroTestes.resultados[1].nomeSuite).toBe('');
        });
    });

    describe('antesDeCada', () => {
        it('executa antes de cada teste no grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo, antesDeCada } de "testes"',
                'var contador = 0',
                'grupo("Suite", funcao() {',
                '    antesDeCada(funcao() { contador = contador + 1 })',
                '    teste("t1", funcao() { afirmar.igual(1, contador) })',
                '    teste("t2", funcao() { afirmar.igual(2, contador) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });
    });

    describe('antesDeTodos', () => {
        it('executa uma vez antes de todos os testes no grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo, antesDeTodos } de "testes"',
                'var executou = 0',
                'grupo("Suite", funcao() {',
                '    antesDeTodos(funcao() { executou = executou + 1 })',
                '    teste("t1", funcao() { afirmar.igual(1, executou) })',
                '    teste("t2", funcao() { afirmar.igual(1, executou) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });
    });

    describe('depoisDeCada', () => {
        it('executa após cada teste no grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo, depoisDeCada } de "testes"',
                'var contador = 0',
                'grupo("Suite", funcao() {',
                '    depoisDeCada(funcao() { contador = contador + 1 })',
                '    teste("t1", funcao() { afirmar.igual(0, contador) })',
                '    teste("t2", funcao() { afirmar.igual(1, contador) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });
    });

    describe('depoisDeTodos', () => {
        it('executa uma vez após todos os testes no grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo, depoisDeTodos } de "testes"',
                'var executou = 0',
                'grupo("Suite", funcao() {',
                '    depoisDeTodos(funcao() { executou = executou + 1 })',
                '    teste("t1", funcao() { afirmar.igual(0, executou) })',
                '    teste("t2", funcao() { afirmar.igual(0, executou) })',
                '})',
                'afirmar.igual(1, executou)',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });
    });

    describe('teste.pular', () => {
        it('registra o teste como pulado sem executá-lo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo("Suite", funcao() {',
                '    teste.pular("pulado", funcao() { afirmar.igual(1, 2) })',
                '    teste("normal", funcao() { afirmar.verdadeiro(verdadeiro) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(2);
            expect(interpretador.registroTestes.resultados[0].status).toBe('pulado');
            expect(interpretador.registroTestes.resultados[1].status).toBe('passou');
        });
    });

    describe('teste.apenas', () => {
        it('executa apenas os testes marcados com apenas dentro do grupo', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo("Suite", funcao() {',
                '    teste.apenas("focado", funcao() { afirmar.verdadeiro(verdadeiro) })',
                '    teste("ignorado", funcao() { afirmar.igual(1, 2) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(1);
            expect(interpretador.registroTestes.resultados[0].nomeTeste).toBe('focado');
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
        });
    });

    describe('grupo.pular', () => {
        it('pula o grupo inteiro sem executar seus testes', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo.pular("Ignorado", funcao() {',
                '    teste("nunca roda", funcao() { afirmar.igual(1, 2) })',
                '})',
                'grupo("Normal", funcao() {',
                '    teste("roda", funcao() { afirmar.verdadeiro(verdadeiro) })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(1);
            expect(interpretador.registroTestes.resultados[0].nomeTeste).toBe('roda');
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
        });
    });

    describe('grupo.apenas', () => {
        it('executa apenas o grupo marcado com apenas', async () => {
            const retorno = await executar([
                'importar { afirmar, teste, grupo } de "testes"',
                'grupo("Suite pai", funcao() {',
                '    grupo.apenas("Focado", funcao() {',
                '        teste("roda", funcao() { afirmar.verdadeiro(verdadeiro) })',
                '    })',
                '    grupo("Ignorado", funcao() {',
                '        teste("nunca roda", funcao() { afirmar.igual(1, 2) })',
                '    })',
                '})',
            ]);
            expect(retorno.erros).toHaveLength(0);
            expect(interpretador.registroTestes.resultados).toHaveLength(1);
            expect(interpretador.registroTestes.resultados[0].nomeTeste).toBe('roda');
            expect(interpretador.registroTestes.resultados[0].status).toBe('passou');
        });
    });
});
