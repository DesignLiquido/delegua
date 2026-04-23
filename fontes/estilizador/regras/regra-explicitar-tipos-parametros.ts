import { Construto } from '../../construtos';
import { Declaracao } from '../../declaracoes';
import { RegraEstilizacaoInterface } from '../../interfaces/estilizador';
import { ParametroInterface } from '../../interfaces';

/**
 * Regra que explicita o tipo `qualquer` em parâmetros sem anotação.
 */
export class RegraExplicitarTiposParametros implements RegraEstilizacaoInterface {
    nome = 'explicitar-tipos-parametros';
    descricao = 'Explicita o tipo `qualquer` em parâmetros sem tipo declarado';

    aplicarEmDeclaracao(declaracao: Declaracao): Declaracao {
        this.visitarObjeto(declaracao, new Set<any>());
        return declaracao;
    }

    aplicarEmConstruto(construto: Construto): Construto {
        this.visitarObjeto(construto, new Set<any>());
        return construto;
    }

    private visitarObjeto(objeto: unknown, visitados: Set<any>): void {
        if (!objeto || typeof objeto !== 'object' || visitados.has(objeto)) {
            return;
        }

        visitados.add(objeto);

        if (Array.isArray(objeto)) {
            for (const item of objeto) {
                this.visitarObjeto(item, visitados);
            }
            return;
        }

        if (this.ehAssinaturaComParametros(objeto)) {
            this.explicitarParametros(objeto.parametros);
        }

        for (const valor of Object.values(objeto)) {
            this.visitarObjeto(valor, visitados);
        }
    }

    private ehAssinaturaComParametros(
        objeto: unknown
    ): objeto is { parametros: ParametroInterface[] } {
        return 'parametros' in (objeto as any) && Array.isArray((objeto as any).parametros);
    }

    private explicitarParametros(parametros: ParametroInterface[]): void {
        for (const parametro of parametros) {
            if (!parametro.tipoDado) {
                parametro.tipoDado = 'qualquer';
            }
        }
    }
}
