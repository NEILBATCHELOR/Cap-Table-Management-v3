import { supabase } from "./supabase";
import { User, UserCreateRequest } from "@/types/users";
import { logAction } from "./auditLogger";

export async function createUser(userData: UserCreateRequest): Promise<User> {
  try {
    // In-memory storage for when Supabase is not available
    const user: User = {
      id: crypto.randomUUID(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: "active",
      publicKey: userData.publicKey,
      encryptedPrivateKey: userData.encryptedPrivateKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log the user creation
    await logAction(
      "User Creation",
      "current-user@example.com",
      `Created new user account for ${userData.email} with role ${userData.role}`,
      "Success",
    );

    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUsers(): Promise<User[]> {
  // Return mock users for now
  return [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Super Admin",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Owner",
      status: "suspended",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Compliance Manager",
      status: "active",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      role: "Compliance Officer",
      status: "active",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie@example.com",
      role: "Agent",
      status: "revoked",
    },
  ];
}
