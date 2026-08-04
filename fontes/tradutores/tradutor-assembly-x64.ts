import { Declaracao } from '../declaracoes';
import { alocarRegistradores } from './x64/alocador-registradores';
import { CodegenX64, FuncaoProcessada, PlataformaAlvo } from './x64/codegen';
import { destruirSSA } from './x64/dessa';
import { LoweringX64 } from './x64/lowering';
import { construirSSA } from './x64/ssa';

export type { PlataformaAlvo } from './x64/codegen';

const PALETA_LINUX = ['rbx', 'r12', 'r13', 'r14', 'r15'];
const PALETA_WINDOWS = ['rbx', 'rdi', 'rsi', 'r12', 'r13', 'r14', 'r15'];

/**
 * Traduz Delégua para NASM x64. Pipeline: lowering (AST -> IR com CFG explícito) ->
 * por função: construção de SSA (fronteira de dominância + phis) -> alocação de
 * registradores (vivacidade + coloração de grafo) -> destruição de SSA (phis -> cópias,
 * arestas críticas divididas) -> geração de código. Ver fontes/tradutores/x64/*.ts para
 * cada etapa e issue #1400 para o desenho completo.
 */
export class TradutorAssemblyX64 {
    constructor(public alvo: PlataformaAlvo = 'linux') {}

    private paleta(): string[] {
        return this.alvo === 'linux' ? PALETA_LINUX : PALETA_WINDOWS;
    }

    traduzir(declaracoes: Declaracao[]): string {
        const programa = new LoweringX64().lowerPrograma(declaracoes);
        const paleta = this.paleta();

        const funcoesProcessadas: FuncaoProcessada[] = programa.funcoes.map((funcao) => {
            construirSSA(funcao);
            const { alocacao } = alocarRegistradores(funcao, paleta);
            destruirSSA(funcao, alocacao);
            return { funcao, alocacao };
        });

        return new CodegenX64(this.alvo, paleta).gerar(programa, funcoesProcessadas);
    }
}
