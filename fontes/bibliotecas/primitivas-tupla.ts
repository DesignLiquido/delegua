import { InterpretadorInterface, PrimitivaInterface } from '../interfaces';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { Tupla, TuplaN } from '../construtos';

const mapaPropriedadesTuplas: { [nomeClasse: string]: string[] } = {
    'Dupla': ['primeiro', 'segundo'],
    'Trio': ['primeiro', 'segundo', 'terceiro'],
    'Quarteto': ['primeiro', 'segundo', 'terceiro', 'quarto'],
    'Quinteto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto'],
    'Sexteto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto'],
    'Septeto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo'],
    'Octeto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo'],
    'Noneto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono'],
    'Deceto': ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono', 'decimo'],
};

export default {
    paraVetor: {
        tipoRetorno: 'vetor',
        argumentos: [],
        implementacao: (
            interpretador: InterpretadorInterface,
            tupla: Tupla | TuplaN
        ): Promise<any> => {
            const objetoTupla = interpretador.resolverValor(tupla);

            if (!(objetoTupla instanceof Tupla || objetoTupla instanceof TuplaN)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        null,
                        'A função "paraVetor" só pode ser chamada em tuplas.',
                        interpretador.linhaDeclaracaoAtual
                    )
                );
            }

            let elementosBrutos: any[] = [];

            if (objetoTupla instanceof TuplaN) {
                elementosBrutos = objetoTupla.elementos;
            } else {
                const nomeClasse = objetoTupla.constructor.name;
                if (mapaPropriedadesTuplas.hasOwnProperty(nomeClasse)) {
                    const props = mapaPropriedadesTuplas[nomeClasse];
                    elementosBrutos = props.map(prop => objetoTupla[prop]);
                }
            }

            const valoresResolvidos = elementosBrutos.map(elemento =>
                interpretador.resolverValor(elemento)
            );

            return Promise.resolve(valoresResolvidos);
        },
        assinaturaFormato: 'tupla.paraVetor()',
        documentacao:
            '# `tupla.paraVetor()` \n \n' +
            'Converte a tupla atual em um array.',
        exemploCodigo: 'tupla.paraVetor()',
    }
} as { [nome: string]: PrimitivaInterface };