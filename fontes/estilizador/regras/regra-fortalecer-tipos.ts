import { Declaracao } from '../../declaracoes';
import { Var, Const } from '../../declaracoes';
import { Literal } from '../../construtos';
import { inferirTipoVariavel } from '../../inferenciador';
import { RegraEstilizacaoInterface } from '../../interfaces/estilizador';
import { ConstrutoInterface } from '../../interfaces/construtos';

/**
 * Regra que fortalece tipos, convertendo `qualquer` para tipos inferidos.
 *
 * Exemplos:
 * - `var x = 5` com tipo `qualquer` → `var x: número = 5`
 * - `var nomes = []` com tipo `qualquer` → `var nomes: vetor = []`
 * - `constante PI = 3.14` com tipo `qualquer` → `constante PI: número = 3.14`
 */
export class RegraFortalecerTipos implements RegraEstilizacaoInterface {
    nome = 'fortalecer-tipos';
    descricao = 'Converte tipos `qualquer` para tipos inferidos quando possível';

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        // Fortalece tipos em declarações Var
        if (declaracao instanceof Var) {
            return this.fortalecerTipoVar(declaracao);
        }

        // Fortalece tipos em declarações Const
        if (declaracao instanceof Const) {
            return this.fortalecerTipoConst(declaracao);
        }

        return declaracao;
    }

    /**
     * Fortalece o tipo de uma declaração Var.
     */
    private fortalecerTipoVar(declaracao: Var): Var {
        // Se o tipo já foi explicitamente definido, não modifica
        if (declaracao.tipoExplicito && declaracao.tipo !== 'qualquer') {
            return declaracao;
        }

        // Se há um inicializador, tenta inferir o tipo
        if (declaracao.inicializador) {
            const tipoInferido = this.inferirTipoDeConstruto(declaracao.inicializador);

            if (tipoInferido && tipoInferido !== 'qualquer') {
                declaracao.tipo = tipoInferido;
                declaracao.tipoExplicito = true;
            }
        }

        return declaracao;
    }

    /**
     * Fortalece o tipo de uma declaração Const.
     */
    private fortalecerTipoConst(declaracao: Const): Const {
        // Se o tipo já foi explicitamente definido, não modifica
        if (declaracao.tipoExplicito && declaracao.tipo !== 'qualquer') {
            return declaracao;
        }

        // Se há um inicializador, tenta inferir o tipo
        if (declaracao.inicializador) {
            const tipoInferido = this.inferirTipoDeConstruto(declaracao.inicializador);

            if (tipoInferido && tipoInferido !== 'qualquer') {
                declaracao.tipo = tipoInferido;
                declaracao.tipoExplicito = true;
            }
        }

        return declaracao;
    }

    /**
     * Infere o tipo de um construto.
     */
    private inferirTipoDeConstruto(construto: ConstrutoInterface): string {
        // Se é um literal, usa o tipo do literal
        if (construto instanceof Literal) {
            const tipoInferido = inferirTipoVariavel(construto.valor);
            return typeof tipoInferido === 'string' ? tipoInferido : 'qualquer';
        }

        // Se o construto tem tipo definido, usa esse tipo
        if ('tipo' in construto && construto.tipo) {
            return construto.tipo as string;
        }

        return 'qualquer';
    }
}
