import { hash, verify } from "@node-rs/argon2";

const hashParameters = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const hashPassword = async (password: string) =>
  hash(password, hashParameters);

export const verifyPassword = async (hash: string, password: string) =>
  verify(hash, password, hashParameters);
