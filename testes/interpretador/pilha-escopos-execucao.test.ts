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
