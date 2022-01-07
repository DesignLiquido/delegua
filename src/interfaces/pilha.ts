export interface InterfacePilha {
    pilha: Array<any>;
    empurrar(item: any);
    eVazio(item: any) : Boolean;
    peek() : Array<any>;
    removerUltimo() : Array<any>;
}