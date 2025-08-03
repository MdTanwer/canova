import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Define access permissions enum
export enum AccessPermission {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
}

// Interface for email-based access control
export interface IEmailAccess {
  email: string;
  permissions: AccessPermission[];
  grantedBy: Schema.Types.ObjectId;
  grantedAt: Date;
}

export interface IForm extends Document {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "published" | "archived";
  PageIds?: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  projectId?: Schema.Types.ObjectId;
  backgroundColor: string;
  version: number;
  isShared?: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  // Enhanced access control fields
  isPublic: boolean;
  allowedEmails: string[]; // Deprecated - keeping for backward compatibility
  emailAccess: IEmailAccess[]; // New granular access control
  uniqueUrl: string;
  shareUrl?: string;

  // Methods for access control
  hasPermission(email: string, permission: AccessPermission): boolean;
  grantPermission(
    email: string,
    permissions: AccessPermission[],
    grantedBy: Schema.Types.ObjectId
  ): void;
  revokePermission(email: string, permission?: AccessPermission): void;
  getEmailPermissions(email: string): AccessPermission[];
}

// Schema for email access control
const EmailAccessSchema = new Schema<IEmailAccess>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  permissions: [
    {
      type: String,
      enum: Object.values(AccessPermission),
      required: true,
    },
  ],
  grantedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
});

const FormSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    PageIds: {
      type: [Schema.Types.ObjectId],
      ref: "Page",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    // Access control fields
    isPublic: {
      type: Boolean,
      default: false,
    },

    // Deprecated - keeping for backward compatibility
    allowedEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // New granular email access control
    emailAccess: [EmailAccessSchema],

    uniqueUrl: {
      type: String,
      unique: true,
      sparse: true,
    },
    shareUrl: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique URL when form is published
FormSchema.pre("save", function (next) {
  if (this.status === "published" && !this.uniqueUrl) {
    this.uniqueUrl = uuidv4();
  }
  next();
});

// Instance methods for access control
FormSchema.methods.hasPermission = function (
  email: string,
  permission: AccessPermission
): boolean {
  // Owner has all permissions
  if (this.createdBy && this.createdBy.toString() === email) {
    return true;
  }

  // Check if form is public and permission is view
  if (this.isPublic && permission === AccessPermission.VIEW) {
    return true;
  }

  // Check granular email access
  const emailAccess = this.emailAccess.find(
    (access: IEmailAccess) => access.email.toLowerCase() === email.toLowerCase()
  );

  if (emailAccess) {
    return emailAccess.permissions.includes(permission);
  }

  // Backward compatibility: check allowedEmails (grants view permission only)
  if (
    permission === AccessPermission.VIEW &&
    this.allowedEmails.some(
      (allowedEmail: string) =>
        allowedEmail.toLowerCase() === email.toLowerCase()
    )
  ) {
    return true;
  }

  return false;
};

FormSchema.methods.grantPermission = function (
  email: string,
  permissions: AccessPermission[],
  grantedBy: Schema.Types.ObjectId
): void {
  const normalizedEmail = email.toLowerCase().trim();

  // Find existing access record
  const existingIndex = this.emailAccess.findIndex(
    (access: IEmailAccess) => access.email === normalizedEmail
  );

  if (existingIndex >= 0) {
    // Update existing permissions
    const existingPermissions = this.emailAccess[existingIndex].permissions;
    const updatedPermissions = Array.from(
      new Set([...existingPermissions, ...permissions])
    );
    this.emailAccess[existingIndex].permissions = updatedPermissions;
    this.emailAccess[existingIndex].grantedAt = new Date();
  } else {
    // Create new access record
    this.emailAccess.push({
      email: normalizedEmail,
      permissions,
      grantedBy,
      grantedAt: new Date(),
    });
  }
};

FormSchema.methods.revokePermission = function (
  email: string,
  permission?: AccessPermission
): void {
  const normalizedEmail = email.toLowerCase().trim();

  if (!permission) {
    // Remove all permissions for this email
    this.emailAccess = this.emailAccess.filter(
      (access: IEmailAccess) => access.email !== normalizedEmail
    );
  } else {
    // Remove specific permission
    const accessIndex = this.emailAccess.findIndex(
      (access: IEmailAccess) => access.email === normalizedEmail
    );

    if (accessIndex >= 0) {
      this.emailAccess[accessIndex].permissions = this.emailAccess[
        accessIndex
      ].permissions.filter((perm: AccessPermission) => perm !== permission);

      // Remove the entire access record if no permissions left
      if (this.emailAccess[accessIndex].permissions.length === 0) {
        this.emailAccess.splice(accessIndex, 1);
      }
    }
  }
};

FormSchema.methods.getEmailPermissions = function (
  email: string
): AccessPermission[] {
  const normalizedEmail = email.toLowerCase().trim();

  // Owner has all permissions
  if (this.createdBy && this.createdBy.toString() === email) {
    return Object.values(AccessPermission);
  }

  const emailAccess = this.emailAccess.find(
    (access: IEmailAccess) => access.email === normalizedEmail
  );

  if (emailAccess) {
    return emailAccess.permissions;
  }

  // Check backward compatibility
  if (
    this.allowedEmails.some(
      (allowedEmail: string) => allowedEmail.toLowerCase() === normalizedEmail
    )
  ) {
    return [AccessPermission.VIEW];
  }

  // Check if public (view permission only)
  if (this.isPublic) {
    return [AccessPermission.VIEW];
  }

  return [];
};

// Static methods for querying forms by access
FormSchema.statics.findByAccess = function (
  email: string,
  permission: AccessPermission
) {
  const normalizedEmail = email.toLowerCase().trim();

  const query: any = {
    $or: [
      // Public forms (for view access)
      ...(permission === AccessPermission.VIEW ? [{ isPublic: true }] : []),

      // Forms where user is the creator
      { createdBy: email },

      // Forms with granular email access
      {
        emailAccess: {
          $elemMatch: {
            email: normalizedEmail,
            permissions: permission,
          },
        },
      },

      // Backward compatibility: allowedEmails (view only)
      ...(permission === AccessPermission.VIEW
        ? [{ allowedEmails: { $in: [normalizedEmail] } }]
        : []),
    ],
  };

  return this.find(query);
};

export const Form = model<IForm>("Form", FormSchema);
