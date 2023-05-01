export function limpaItensNulos<T>(vetor: Array<T | null>): Array<T> {
    return vetor.filter((item) => item !== null);
}
