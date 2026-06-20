import { describe, expect, test } from 'bun:test';
import { CarnoBetterAuth, DEFAULT_AUTH_BASE_PATH } from '../src/index.ts';

describe('package entry', () => {
    test('is reachable through the public barrel', () => {
        expect(typeof CarnoBetterAuth).toBe('function');
        expect(DEFAULT_AUTH_BASE_PATH).toBe('/auth');
    });
});
