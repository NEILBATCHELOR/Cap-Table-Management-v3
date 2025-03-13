export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "revoked" | "suspended";
  publicKey?: string;
  encryptedPrivateKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  role: string;
  publicKey: string;
  encryptedPrivateKey: string;
}
