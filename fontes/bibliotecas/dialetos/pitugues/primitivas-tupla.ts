import { InterpretadorInterface, PrimitivaInterface } from '../../../interfaces';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { TuplaN } from '../../../construtos';

export default {
    paraVetor: {
        tipoRetorno: 'vetor',
        argumentos: [],
        implementacao: (interpretador: InterpretadorInterface, tupla: TuplaN): Promise<any> => {
            const objetoTupla = interpretador.resolverValor(tupla);

            if (!(objetoTupla instanceof TuplaN)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        `A função "paraVetor" só pode ser chamada em tuplas.`,
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            const valoresPuros = objetoTupla.elementos.map((elemento) =>
                interpretador.resolverValor(elemento)
            );

            return Promise.resolve(valoresPuros);
        },
        assinaturaFormato: 'tupla.paraVetor()',
        documentacao: '# `tupla.paraVetor()` \n \n' + 'Converte a tupla atual em um array.',
        exemploCodigo: 'tupla.paraVetor()',
    },
} as { [nome: string]: PrimitivaInterface };
