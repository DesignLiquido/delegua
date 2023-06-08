import { AcessoIndiceVariavel, Construto, Variavel } from '../../../construtos';
import { InterpretadorBirl } from './interpretador-birl';

function converteTipoOuEstouraError(valor: any, tipo: string) {
    try {
        switch (tipo) {
            case 'texto':
                return String(valor);
            case 'número':
                if ((valor as string).includes('.')) {
                    return parseFloat(valor);
                }
                var numero = Number(valor);
                if (isNaN(numero)) {
                    throw new Error(`Não foi possível converter o valor "${valor}" para o tipo ${tipo}.`);
                }
                return numero;
            default:
                return valor;
        }
    } catch (err) {
        throw new Error(`Não foi possível converter o valor "${valor}" para o tipo ${tipo}.`);
    }
}

export async function atribuirVariavel(
    interpretador: InterpretadorBirl,
    expressao: Construto,
    valor: any,
    tipo: string
): Promise<any> {
    valor = converteTipoOuEstouraError(valor, tipo);

    if (expressao instanceof Variavel) {
        interpretador.pilhaEscoposExecucao.atribuirVariavel(expressao.simbolo, valor);
        return;
    }

    if (expressao instanceof AcessoIndiceVariavel) {
        const promises = await Promise.all([
            interpretador.avaliar(expressao.entidadeChamada),
            interpretador.avaliar(expressao.indice),
        ]);

        let alvo = promises[0];
        let indice = promises[1];
        const subtipo = alvo.hasOwnProperty('subtipo') ? alvo.subtipo : undefined;

        if (alvo.hasOwnProperty('valor')) {
            alvo = alvo.valor;
        }

        if (indice.hasOwnProperty('valor')) {
            indice = indice.valor;
        }

        let valorResolvido;
        switch (subtipo) {
            case 'texto':
                valorResolvido = String(valor);
                break;
            case 'número':
                valorResolvido = Number(valor);
                break;
            case 'lógico':
                valorResolvido = Boolean(valor);
                break;
            default:
                valorResolvido = valor;
                break;
        }

        alvo[indice] = valorResolvido;
    }
}
