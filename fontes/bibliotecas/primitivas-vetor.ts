export default {
    adicionar: (vetor: Array<any>, elemento: any) => {
        vetor.push(elemento);
        return vetor;
    },
    empilhar: (vetor: Array<any>, elemento: any) => {
        vetor.push(elemento);
        return vetor;
    },
    fatiar: (vetor: Array<any>, inicio: number, fim: number) => vetor.slice(inicio, fim),
    inclui: (vetor: Array<any>, elemento: any) => vetor.includes(elemento),
    inverter: (vetor: Array<any>) => vetor.reverse(),
    juntar: (vetor: Array<any>, separador: string) => vetor.join(separador),
    ordenar: (vetor: Array<any>) => vetor.sort(),
    remover: (vetor: Array<any>, elemento: any) => {
        const index = vetor.indexOf(elemento);
        if (index !== -1) vetor.splice(index, 1);
        return vetor;
    },
    removerPrimeiro: (vetor: Array<any>) => {
        vetor.shift();
        return vetor;
    },
    removerUltimo: (vetor: Array<any>) => {
        vetor.pop();
        return vetor;
    },
    somar: (vetor: Array<number>) => vetor.reduce((a, b) => a + b),
    tamanho: (vetor: Array<any>) => vetor.length,
};
