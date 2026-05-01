import { compare, hash } from "bcrypt";

import { authConfig } from "~/config/auth_config";

export const hashPassword = (password: string): Promise<string> => {
  return hash(password, authConfig.password.saltRounds);
};

export const verifyPassword = (password: string, passwordHash: string): Promise<boolean> => {
  return compare(password, passwordHash);
};

export const hashToken = (token: string): Promise<string> => {
  return hash(token, authConfig.password.saltRounds);
};
