import { describe, expect, test, expectTypeOf } from 'bun:test';
import type { Session, User } from 'better-auth';
import { AUTH_SESSION_KEY, AUTH_USER_KEY } from '../../src/constants.ts';
import type { AuthContext, AuthLocals } from '../../src/types.ts';

describe('types', () => {
    test('AuthContext matches Better Auth session shape', () => {
        expectTypeOf<AuthContext>().toMatchObjectType<{
            session: Session;
            user: User;
        }>();
    });

    test('AuthLocals keys align with constants', () => {
        expectTypeOf<AuthLocals[typeof AUTH_USER_KEY]>().toEqualTypeOf<User>();
        expectTypeOf<AuthLocals[typeof AUTH_SESSION_KEY]>().toEqualTypeOf<Session>();
    });

    test('AuthLocals keys are distinct at runtime via constants', () => {
        expect(AUTH_USER_KEY).toBe('authUser');
        expect(AUTH_SESSION_KEY).toBe('authSession');
    });
});
