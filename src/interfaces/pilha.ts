export interface InterfacePilha {
    pilha: Array<any>;
    empilhar(item: any);
    eVazio(item: any): Boolean;
    peek(): Array<any>;
    removerUltimo(): Array<any>;
}