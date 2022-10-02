export default {
    'inclui': (vetor: Array<any>, elemento: any) => vetor.includes(elemento),
    'juntar': (vetor: Array<any>, separador: any) => vetor.join(separador),
    'removerUltimo': (vetor: Array<any>) => vetor.pop(),
    'removerPrimeiro': (vetor: Array<any>) => vetor.shift(),
    'empilhar': (vetor: Array<any>, elemento: any) => vetor.push(elemento),
    'inverter': (vetor: Array<any>) => vetor.reverse(),
    'fatia': (vetor: Array<any>, inicio: number, fim: number) => vetor.slice(inicio, fim),
    'ordenar': (vetor: Array<any>) => vetor.sort(),
}
