import { VisitanteComumInterface } from '../../../interfaces';

export default {
    cabeça: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor[0]),
    cauda: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        let copia = [...vetor];
        copia.splice(0, 1);
        return Promise.resolve(copia);
    },
    contém: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> =>
        Promise.resolve(vetor.includes(elemento)),
    descarte: (interpretador: VisitanteComumInterface, vetor: Array<any>, elementos: number): Promise<any> => {
        let copia = [...vetor];
        copia.splice(0, elementos);
        return Promise.resolve(copia);
    },
    descarte_enquanto: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    divida_quando: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    imutável: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    injete: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    insira: (
        interpretador: VisitanteComumInterface,
        vetor: Array<any>,
        posicao: number,
        elemento: string
    ): Promise<any> => {
        let copia = [...vetor];
        copia.splice(posicao - 1, 0, elemento);
        return Promise.resolve(copia);
    },
    inverta: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => {
        let copia = [];
        for (let elemento of vetor) {
            copia.unshift(elemento);
        }
        return Promise.resolve(copia);
    },
    junte: (interpretador: VisitanteComumInterface, vetor: Array<any>, separador: string): Promise<any> =>
        Promise.resolve(vetor.join(separador)),
    mapeie: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    ordene: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> =>
        Promise.resolve(vetor.sort((a, b) => a - b)),
    pegue: (interpretador: VisitanteComumInterface, vetor: Array<any>, elementos: number): Promise<any> =>
        Promise.resolve(vetor.slice(0, elementos)),
    pegue_enquanto: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    posição: (interpretador: VisitanteComumInterface, vetor: Array<any>, elemento: any): Promise<any> =>
        Promise.resolve(vetor.indexOf(elemento) + 1),
    qual_tipo: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<string> => Promise.resolve('Lista'),
    remova: (interpretador: VisitanteComumInterface, vetor: Array<any>, posicao: number): Promise<any> => {
        let copia = [...vetor];
        copia.splice(posicao - 1, 1);
        return Promise.resolve(copia);
    },
    selecione: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(),
    tamanho: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> => Promise.resolve(vetor.length),
    último: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> =>
        Promise.resolve(vetor.length > 0 ? vetor[vetor.length - 1] : undefined),
    vazia: (interpretador: VisitanteComumInterface, vetor: Array<any>): Promise<any> =>
        Promise.resolve(vetor.length === 0),
};
