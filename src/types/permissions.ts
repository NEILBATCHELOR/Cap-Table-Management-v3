export type PermissionStatus = boolean | "limited" | null;

export interface Permission {
  id?: string;
  functionName: string;
  description: string;
  roles: {
    superAdmin: PermissionStatus;
    owner: PermissionStatus;
    complianceManager: PermissionStatus;
    agent: PermissionStatus;
    complianceOfficer: PermissionStatus;
  };
}

export interface PermissionUpdate {
  permissions: Permission[];
  updatedAt: string;
  updatedBy: string;
}
