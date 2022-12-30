algoritmo "exemplo"
var x: real
    y: inteiro
    a: caractere
    l: logico
inicio
    x <- 2.5
    y <- 6
    a <- "teste"
    l <- VERDADEIRO
    escreval ("x", x:4:1, y+3:4) // Escreve: x 2.5    9
    escreval (a, "ok")           // Escreve: testeok (e depois pula linha)
    escreval (a, " ok")          // Escreve: teste ok (e depois pula linha)
    escreval (a + " ok")         // Escreve: teste ok (e depois pula linha)
    escreva (l)                  // Escreve: VERDADEIRO
fimalgoritmo