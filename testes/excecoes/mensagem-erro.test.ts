import { obterMensagemErro } from '../../fontes/excecoes';
import { ErroEmTempoDeExecucao } from '../../fontes/excecoes';

describe('obterMensagemErro()', () => {
    describe('Erros com propriedade padrão Delégua (.mensagem)', () => {
        it('Deve retornar .mensagem de ErroEmTempoDeExecucao', () => {
            const erro = new ErroEmTempoDeExecucao(undefined, 'Operando precisa ser um número.');
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('Operando precisa ser um número.');
        });

        it('Deve retornar .mensagem de objeto comum com propriedade mensagem', () => {
            const erro = { mensagem: 'Erro personalizado' };
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('Erro personalizado');
        });
    });

    describe('Erros nativos do JavaScript (fallback para String())', () => {
        it('Deve usar String() como fallback para Error nativo', () => {
            const erro = new Error('Algo deu errado');
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('Error: Algo deu errado');
        });

        it('Deve usar String() como fallback para TypeError', () => {
            const erro = new TypeError('Valor inválido');
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('TypeError: Valor inválido');
        });

        it('Deve usar String() como fallback para RangeError', () => {
            const erro = new RangeError('Fora do intervalo permitido');
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('RangeError: Fora do intervalo permitido');
        });
    });

    describe('Erro com ambas propriedades (.mensagem e .message)', () => {
        it('Deve priorizar .mensagem sobre .message', () => {
            const erro = {
                mensagem: 'Mensagem em português',
                message: 'Message in english',
            };
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('Mensagem em português');
        });

        it('ErroEmTempoDeExecucao retorna .mensagem (ignorando .message herdado)', () => {
            const erro = new ErroEmTempoDeExecucao(undefined, 'Prioridade portuguesa');
            const resultado = obterMensagemErro(erro);
            expect(resultado).toBe('Prioridade portuguesa');
        });
    });

    describe('Valores nulos e indefinidos', () => {
        it('Deve retornar "null" para null', () => {
            const resultado = obterMensagemErro(null);
            expect(resultado).toBe('null');
        });

        it('Deve retornar "undefined" para undefined', () => {
            const resultado = obterMensagemErro(undefined);
            expect(resultado).toBe('undefined');
        });
    });

    describe('Tipos primitivos', () => {
        it('Deve retornar o próprio valor para string', () => {
            const resultado = obterMensagemErro('Mensagem direta');
            expect(resultado).toBe('Mensagem direta');
        });

        it('Deve converter número para string', () => {
            const resultado = obterMensagemErro(42);
            expect(resultado).toBe('42');
        });

        it('Deve converter booleano para string', () => {
            const resultado = obterMensagemErro(true);
            expect(resultado).toBe('true');
        });

        it('Deve retornar string vazia para string vazia', () => {
            const resultado = obterMensagemErro('');
            expect(resultado).toBe('');
        });
    });

    describe('Objetos sem mensagem ou message', () => {
        it('Deve retornar representação string de objeto simples', () => {
            const erro = { codigo: 500, descricao: 'Erro interno' };
            const resultado = obterMensagemErro(erro);
            expect(resultado).toContain('[object Object]');
        });

        it('Deve retornar representação string de array', () => {
            const resultado = obterMensagemErro([1, 2, 3]);
            expect(resultado).toBe('1,2,3');
        });
    });

    describe('Edge cases', () => {
        it('Deve usar String(erro) como fallback quando .mensagem é vazio', () => {
            const erro = { mensagem: '' };
            const resultado = obterMensagemErro(erro);
            // '' é falsy, então cai em String(erro)
            expect(resultado).toBe('[object Object]');
        });

        it('Deve usar String(erro) como fallback para objeto sem .mensagem', () => {
            const erro = { message: '' };
            const resultado = obterMensagemErro(erro);
            // não tem .mensagem, cai em String(erro)
            expect(resultado).toBe('[object Object]');
        });

        it('Deve usar String(erro) como fallback quando .mensagem é vazio e objeto tem .message', () => {
            const erro = { mensagem: '', message: '' };
            const resultado = obterMensagemErro(erro);
            // .mensagem é falsy, cai em String(erro)
            expect(resultado).toBe('[object Object]');
        });

        it('Deve retornar string comum quando ela é passada diretamente', () => {
            const resultado = obterMensagemErro('Mensagem direta');
            expect(resultado).toBe('Mensagem direta');
        });

        it('Deve retornar número como string', () => {
            const resultado = obterMensagemErro(0);
            expect(resultado).toBe('0');
        });
    });
});
