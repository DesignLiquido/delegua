import { EspacoMemoria } from '../../fontes/interpretador/espaco-memoria';
import { PilhaEscoposExecucao } from '../../fontes/interpretador/pilha-escopos-execucao';
import tipoDeDadosDelegua from '../../fontes/tipos-de-dados/delegua';

function criarPilhaComEscopo(): PilhaEscoposExecucao {
    const pilha = new PilhaEscoposExecucao();
    pilha.empilhar({
        declaracoes: [],
        declaracaoAtual: 0,
        espacoMemoria: new EspacoMemoria(),
        finalizado: false,
        tipo: 'outro',
        emLacoRepeticao: false,
    });
    return pilha;
}

describe('PilhaEscoposExecucao', () => {
    describe('definirVariavel() - subtipo de vetores', () => {
        it('vetor de números tem subtipo numero', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', [1, 2, 3]);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.NUMERO);
        });

        it('vetor de textos tem subtipo texto', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', ['a', 'b']);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.TEXTO);
        });

        it('vetor de lógicos tem subtipo logico', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', [true, false, true]);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.LOGICO);
        });

        it('vetor misto números e textos tem subtipo qualquer', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', [1, 'dois']);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.QUALQUER);
        });

        it('vetor misto números e lógicos tem subtipo qualquer', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', [1, true]);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.QUALQUER);
        });

        it('vetor de nulos tem subtipo qualquer', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirVariavel('v', [null, null]);
            const v = pilha.topoDaPilha().espacoMemoria.valores['v'];
            expect(v.subtipo).toBe(tipoDeDadosDelegua.QUALQUER);
        });
    });

    describe('definirConstante() - subtipo de vetores', () => {
        it('vetor de lógicos tem subtipo logico', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirConstante('c', [true, false]);
            const c = pilha.topoDaPilha().espacoMemoria.valores['c'];
            expect(c.subtipo).toBe(tipoDeDadosDelegua.LOGICO);
        });

        it('vetor de números tem subtipo numero', () => {
            const pilha = criarPilhaComEscopo();
            pilha.definirConstante('c', [10, 20]);
            const c = pilha.topoDaPilha().espacoMemoria.valores['c'];
            expect(c.subtipo).toBe(tipoDeDadosDelegua.NUMERO);
        });
    });
});

describe('PilhaEscoposExecucao - operações adicionais', () => {
    const empilharEscopo = (pilha: PilhaEscoposExecucao, tipo: string = 'outro') => {
        pilha.empilhar({
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: tipo as any,
            emLacoRepeticao: false,
        });
    };

    it('removerUltimo() em pilha vazia lança erro', () => {
        const pilha = new PilhaEscoposExecucao();
        expect(() => pilha.removerUltimo()).toThrow('Pilha vazia.');
    });

    it('definirVariavel() converte longo a partir de texto', () => {
        const pilha = criarPilhaComEscopo();
        pilha.definirVariavel('l', '12.7', 'longo');
        expect(pilha.topoDaPilha().espacoMemoria.valores['l'].valor).toBe(BigInt(12));
    });

    it('atribuirVariavelEm() atribui no escopo ancestral', () => {
        const pilha = criarPilhaComEscopo();
        pilha.definirVariavel('x', 1);
        empilharEscopo(pilha);
        pilha.atribuirVariavelEm(2, { lexema: 'x' }, 5);
        expect(pilha.naPosicao(0).espacoMemoria.valores['x'].valor).toBe(5);
        expect(pilha.obterVariavelEm(2, 'x').valor).toBe(5);
    });

    it('atribuirVariavelEm() rejeita constante', () => {
        const pilha = criarPilhaComEscopo();
        pilha.definirConstante('c', 1);
        expect(() => pilha.atribuirVariavelEm(1, { lexema: 'c' }, 2)).toThrow(
            "Constante 'c' não pode receber novos valores."
        );
    });

    it('atribuirVariavelEm() rejeita tipo incompatível', () => {
        const pilha = criarPilhaComEscopo();
        pilha.definirVariavel('t', 'a', 'texto', true);
        expect(() => pilha.atribuirVariavelEm(1, { lexema: 't' }, 5)).toThrow(
            "Variável 't' é do tipo 'texto'"
        );
    });

    it('atribuirVariavel() por índice em valor que não é vetor lança erro', () => {
        const pilha = criarPilhaComEscopo();
        pilha.definirVariavel('n', 5);
        expect(() => pilha.atribuirVariavel({ lexema: 'n' } as any, 1, 0)).toThrow(
            'Variável não é um vetor ou dicionário.'
        );
    });

    it('atribuirVariavel() de variável inexistente lança erro', () => {
        const pilha = criarPilhaComEscopo();
        expect(() => pilha.atribuirVariavel({ lexema: 'nada' } as any, 1)).toThrow(
            "Variável não definida 'nada'."
        );
    });

    it('obterEscopoPorTipo()', () => {
        const pilha = criarPilhaComEscopo();
        empilharEscopo(pilha, 'funcao');
        expect(pilha.obterEscopoPorTipo('funcao')).toBe(pilha.topoDaPilha());
        expect(pilha.obterEscopoPorTipo('classe')).toBeUndefined();
    });

    it('obterTodasVariaveis()', () => {
        const pilha = criarPilhaComEscopo();
        empilharEscopo(pilha);
        pilha.definirVariavel('a', 1);
        pilha.definirVariavel('b', 'x');
        const variaveis = pilha.obterTodasVariaveis();
        expect(variaveis.map((v: any) => v.nome)).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('obterReferenciaFuncao() inexistente lança erro', () => {
        const pilha = criarPilhaComEscopo();
        expect(() => pilha.obterReferenciaFuncao('id')).toThrow("Referência para função não encontrada: 'id'.");
    });
});
