export default {
    inclui: (vetor: Array<any>, elemento: any) => vetor.includes(elemento),
    juntar: (vetor: Array<any>, separador: string) => vetor.join(separador),
    removerUltimo: (vetor: Array<any>) => {
        vetor.pop();
        return vetor;
    },
    removerPrimeiro: (vetor: Array<any>) => {
        vetor.shift();
        return vetor;
    },
    empilhar: (vetor: Array<any>, elemento: any) => {
        vetor.push(elemento);
        return vetor;
    },
    adicionar: (vetor: Array<any>, elemento: any) => {
        vetor.push(elemento);
        return vetor;
    },
    inverter: (vetor: Array<any>) => vetor.reverse(),
    fatiar: (vetor: Array<any>, inicio: number, fim: number) =>
        vetor.slice(inicio, fim),
    ordenar: (vetor: Array<any>) => vetor.sort(),
    somar: (vetor: Array<number>) => vetor.reduce((a, b) => a + b),
    remover: (vetor: Array<any>, elemento: any) => {
        const index = vetor.indexOf(elemento);
        if (index !== -1) vetor.splice(index, 1);
        return vetor;
    },
};
