import { hashPassword, comparePassword } from '../hash.utils';

describe('hash.utils', () => {
  it('hashes a password to a different string', async () => {
    const hash = await hashPassword('Password123');
    expect(hash).not.toBe('Password123');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('Password123');
    await expect(comparePassword('Password123', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('Password123');
    await expect(comparePassword('WrongPassword', hash)).resolves.toBe(false);
  });
});
