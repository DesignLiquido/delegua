import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
        coveragePathIgnorePatterns: [
            "<rootDir>/fontes/avaliador-sintatico/traducao/avaliador-sintatico-javascript.ts",
            "<rootDir>/fontes/tradutores/python/*.*",
        ]
    };
};
