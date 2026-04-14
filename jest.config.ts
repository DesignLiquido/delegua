import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        transform: {
            '^.+\\.tsx?$': ['ts-jest', {
                isolatedModules: false,
                tsconfig: {
                    sourceMap: true,
                    inlineSourceMap: true,
                    inlineSources: true,
                    types: ['node', 'jest']
                }
            }]
        },
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
        coveragePathIgnorePatterns: [
            "<rootDir>/fontes/avaliador-sintatico/traducao/avaliador-sintatico-javascript.ts",
            "<rootDir>/fontes/tradutores/python/*.*",
            "<rootDir>/testes/_mocks/*.*",
        ]
    };
};
