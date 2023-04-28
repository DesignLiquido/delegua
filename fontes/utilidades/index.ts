export function limpaItensNull<T>(arr: Array<T | null>): Array<T> {
    return arr.filter((item) => item !== null);
}
