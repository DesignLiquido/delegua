import { Deceto } from './deceto';
import { Dupla } from './dupla';
import { Noneto } from './noneto';
import { Octeto } from './octeto';
import { Quarteto } from './quarteto';
import { Quinteto } from './quinteto';
import { Septeto } from './septeto';
import { Sexteto } from './sexteto';
import { Trio } from './trio';

export * from './deceto';
export * from './dupla';
export * from './noneto';
export * from './octeto';
export * from './quarteto';
export * from './quinteto';
export * from './septeto';
export * from './sexteto';
export * from './trio';
export * from './tupla';

export class SeletorTuplas {
    constructor(...argumentos: any[]) {
        if (argumentos.length > 10) {
            throw new Error("Tuplas com mais de 10 elementos não são suportadas.");
        }

        if (argumentos.length < 2) {
            throw new Error("Tuplas devem ter no mínimo 2 elementos.");
        }

        switch (argumentos.length) {
            case 2:
                return new Dupla(argumentos[0], argumentos[1]);
            case 3:
                return new Trio(argumentos[0], argumentos[1], argumentos[2]);
            case 4:
                return new Quarteto(argumentos[0], argumentos[1], argumentos[2], argumentos[3]);
            case 5:
                return new Quinteto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4]
                );
            case 6:
                return new Sexteto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4],
                    argumentos[5]
                );
            case 7:
                return new Septeto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4],
                    argumentos[5],
                    argumentos[6]
                );
            case 8:
                return new Octeto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4],
                    argumentos[5],
                    argumentos[6],
                    argumentos[7]
                );
            case 9:
                return new Noneto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4],
                    argumentos[5],
                    argumentos[6],
                    argumentos[7],
                    argumentos[8]
                );
            case 10:
                return new Deceto(
                    argumentos[0], 
                    argumentos[1], 
                    argumentos[2], 
                    argumentos[3],
                    argumentos[4],
                    argumentos[5],
                    argumentos[6],
                    argumentos[7],
                    argumentos[8],
                    argumentos[9]
                );
        }
    }
}