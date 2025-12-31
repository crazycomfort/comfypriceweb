// Versioning system - Step 6
// Immutable versions with v1 and v+1 behavior

export interface VersionStatus {
  version: string;
  status: "draft" | "active" | "archived" | "revoked";
  createdAt: string;
  updatedAt: string;
}

export interface StatusTransition {
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
  actorId?: string;
}

export interface VersionedEntity {
  id: string;
  currentVersion: string;
  versions: Record<string, any>;
  statusLog: StatusTransition[];
}

// Generate next version (v+1)
export function getNextVersion(currentVersion: string): string {
  if (currentVersion === "v1") {
    return "v2";
  }
  const match = currentVersion.match(/^v(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return `v${num + 1}`;
  }
  return "v2";
}

// Create new versioned entity
export function createVersionedEntity<T>(id: string, initialData: T, version: string = "v1"): VersionedEntity & { versions: Record<string, T> } {
  return {
    id,
    currentVersion: version,
    versions: {
      [version]: initialData,
    },
    statusLog: [
      {
        from: "none",
        to: "draft",
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// Add new version (immutable)
export function addVersion<T>(
  entity: VersionedEntity & { versions: Record<string, T> },
  newData: T,
  reason?: string,
  actorId?: string
): VersionedEntity & { versions: Record<string, T> } {
  const nextVersion = getNextVersion(entity.currentVersion);
  
  return {
    ...entity,
    currentVersion: nextVersion,
    versions: {
      ...entity.versions,
      [nextVersion]: newData,
    },
    statusLog: [
      ...entity.statusLog,
      {
        from: entity.currentVersion,
        to: nextVersion,
        timestamp: new Date().toISOString(),
        reason,
        actorId,
      },
    ],
  };
}

// Transition status
export function transitionStatus(
  entity: VersionedEntity,
  newStatus: VersionStatus["status"],
  reason?: string,
  actorId?: string
): VersionedEntity {
  return {
    ...entity,
    statusLog: [
      ...entity.statusLog,
      {
        from: entity.statusLog[entity.statusLog.length - 1]?.to || "draft",
        to: newStatus,
        timestamp: new Date().toISOString(),
        reason,
        actorId,
      },
    ],
  };
}

// Get version data
export function getVersionData<T>(
  entity: VersionedEntity & { versions: Record<string, T> },
  version?: string
): T | null {
  const targetVersion = version || entity.currentVersion;
  return entity.versions[targetVersion] || null;
}


