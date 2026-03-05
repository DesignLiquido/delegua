import { analisarDocumentario } from '../../fontes/analisador-documentario';

describe('AnalisadorDocumentario', () => {
    describe('descricao', () => {
        it('retorna descrição quando o conteúdo não tem tags', () => {
            const resultado = analisarDocumentario('Faz algo.');
            expect(resultado.descricao).toBe('Faz algo.');
            expect(resultado.parametros).toHaveLength(0);
            expect(resultado.veja).toHaveLength(0);
        });

        it('retorna string vazia quando o conteúdo é vazio', () => {
            const resultado = analisarDocumentario('');
            expect(resultado.descricao).toBe('');
        });

        it('retorna apenas as linhas antes da primeira tag como descrição', () => {
            const conteudo = 'Soma dois números.\n\n@parametro {inteiro} a O primeiro.';
            const resultado = analisarDocumentario(conteudo);
            expect(resultado.descricao).toBe('Soma dois números.');
        });
    });

    describe('@parametro / @param', () => {
        it('analisa @parametro com tipo', () => {
            const resultado = analisarDocumentario('@parametro {inteiro} n O número.');
            expect(resultado.parametros).toHaveLength(1);
            expect(resultado.parametros[0]).toEqual({
                nome: 'n',
                tipo: 'inteiro',
                descricao: 'O número.',
            });
        });

        it('analisa @parametro sem tipo', () => {
            const resultado = analisarDocumentario('@parametro n O número.');
            expect(resultado.parametros).toHaveLength(1);
            expect(resultado.parametros[0]).toEqual({
                nome: 'n',
                tipo: undefined,
                descricao: 'O número.',
            });
        });

        it('analisa @param (alias em inglês) com tipo', () => {
            const resultado = analisarDocumentario('@param {texto} s A string.');
            expect(resultado.parametros).toHaveLength(1);
            expect(resultado.parametros[0]).toEqual({
                nome: 's',
                tipo: 'texto',
                descricao: 'A string.',
            });
        });

        it('analisa múltiplos @parametro', () => {
            const conteudo = '@parametro {inteiro} a O primeiro.\n@parametro {inteiro} b O segundo.';
            const resultado = analisarDocumentario(conteudo);
            expect(resultado.parametros).toHaveLength(2);
            expect(resultado.parametros[0].nome).toBe('a');
            expect(resultado.parametros[1].nome).toBe('b');
        });

        it('analisa @parametro sem descrição', () => {
            const resultado = analisarDocumentario('@parametro {inteiro} n');
            expect(resultado.parametros[0]).toEqual({
                nome: 'n',
                tipo: 'inteiro',
                descricao: '',
            });
        });
    });

    describe('@retorna / @returns', () => {
        it('analisa @retorna com tipo', () => {
            const resultado = analisarDocumentario('@retorna {lógico} Verdadeiro se encontrado.');
            expect(resultado.retorna).toEqual({
                tipo: 'lógico',
                descricao: 'Verdadeiro se encontrado.',
            });
        });

        it('analisa @retorna sem tipo', () => {
            const resultado = analisarDocumentario('@retorna A soma.');
            expect(resultado.retorna).toEqual({
                tipo: undefined,
                descricao: 'A soma.',
            });
        });

        it('analisa @returns (alias em inglês)', () => {
            const resultado = analisarDocumentario('@returns {inteiro} O resultado.');
            expect(resultado.retorna?.tipo).toBe('inteiro');
            expect(resultado.retorna?.descricao).toBe('O resultado.');
        });

        it('retorna undefined quando não há @retorna', () => {
            const resultado = analisarDocumentario('Apenas descrição.');
            expect(resultado.retorna).toBeUndefined();
        });
    });

    describe('@exemplo / @example', () => {
        it('analisa @exemplo em uma única linha', () => {
            const resultado = analisarDocumentario('@exemplo escreva(f())');
            expect(resultado.exemplo).toBe('escreva(f())');
        });

        it('analisa @exemplo multilinhas', () => {
            const conteudo = '@exemplo\nescreva(soma(1, 2))\nescreva(soma(3, 4))';
            const resultado = analisarDocumentario(conteudo);
            expect(resultado.exemplo).toBe('escreva(soma(1, 2))\nescreva(soma(3, 4))');
        });

        it('analisa @example (alias em inglês)', () => {
            const resultado = analisarDocumentario('@example f(1)');
            expect(resultado.exemplo).toBe('f(1)');
        });

        it('retorna undefined quando não há @exemplo', () => {
            const resultado = analisarDocumentario('Apenas descrição.');
            expect(resultado.exemplo).toBeUndefined();
        });
    });

    describe('@depreciado', () => {
        it('analisa @depreciado sem motivo', () => {
            const resultado = analisarDocumentario('@depreciado');
            expect(resultado.depreciado).toBe('');
        });

        it('analisa @depreciado com motivo', () => {
            const resultado = analisarDocumentario('@depreciado Use nova_f.');
            expect(resultado.depreciado).toBe('Use nova_f.');
        });

        it('retorna undefined quando não há @depreciado', () => {
            const resultado = analisarDocumentario('Apenas descrição.');
            expect(resultado.depreciado).toBeUndefined();
        });
    });

    describe('@veja', () => {
        it('analisa @veja simples', () => {
            const resultado = analisarDocumentario('@veja outraFuncao');
            expect(resultado.veja).toEqual(['outraFuncao']);
        });

        it('analisa múltiplos @veja', () => {
            const conteudo = '@veja funcaoA\n@veja funcaoB';
            const resultado = analisarDocumentario(conteudo);
            expect(resultado.veja).toEqual(['funcaoA', 'funcaoB']);
        });

        it('retorna array vazio quando não há @veja', () => {
            const resultado = analisarDocumentario('Apenas descrição.');
            expect(resultado.veja).toHaveLength(0);
        });
    });

    describe('tags desconhecidas', () => {
        it('ignora tags desconhecidas silenciosamente', () => {
            const resultado = analisarDocumentario('@ignorar algo aqui');
            expect(resultado.descricao).toBe('');
            expect(resultado.parametros).toHaveLength(0);
            expect(resultado.retorna).toBeUndefined();
        });
    });

    describe('documentário completo', () => {
        it('analisa um documentário com todas as tags', () => {
            const conteudo = [
                'Calcula a soma de dois números.',
                '',
                '@parametro {inteiro} a O primeiro número.',
                '@parametro {inteiro} b O segundo número.',
                '@retorna {inteiro} A soma de a e b.',
                '@exemplo',
                'escreva(soma(1, 2)) // 3',
                '@depreciado Use a função nova_soma no lugar.',
                '@veja nova_soma',
            ].join('\n');

            const resultado = analisarDocumentario(conteudo);

            expect(resultado.descricao).toBe('Calcula a soma de dois números.');
            expect(resultado.parametros).toHaveLength(2);
            expect(resultado.parametros[0]).toEqual({ nome: 'a', tipo: 'inteiro', descricao: 'O primeiro número.' });
            expect(resultado.parametros[1]).toEqual({ nome: 'b', tipo: 'inteiro', descricao: 'O segundo número.' });
            expect(resultado.retorna).toEqual({ tipo: 'inteiro', descricao: 'A soma de a e b.' });
            expect(resultado.exemplo).toBe('escreva(soma(1, 2)) // 3');
            expect(resultado.depreciado).toBe('Use a função nova_soma no lugar.');
            expect(resultado.veja).toEqual(['nova_soma']);
        });
    });
});
