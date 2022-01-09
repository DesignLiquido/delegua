interface InterpretadorInterface {
    Delegua: any;
    diretorioBase: any;
    global: any;
    ambiente: any;
    locais: any;

    resolver(expr: any, depth: any): void;
    visitLiteralExpr(expr: any): any;
    avaliar(expr: any): any;
}