import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";

import { getAzureToken } from "~/services/azure-token.server";

export const APP_ID = "35499ecd-d259-4e81-9a12-e503a69b91b1";
const MICROSOFT_GRAPH_V1_BASEURL = "https://graph.microsoft.com/v1.0";

export const WEB_APP_URL = "https://achievers-webapp.azurewebsites.net";
export const ACHIEVERS_DOMAIN = "achieversclubwa.org.au";

export enum Roles {
  Admin = "e567add0-fec3-4c87-941a-05dd2e18cdfd",
  Mentor = "a2ed7b54-4379-465d-873d-2e182e0bd8ef",
  Student = "ee1650fe-387b-40c3-bb73-e8d54fbe09a6",
}

export interface AppRoleAssignment {
  id: string;
  appRoleId: string;
  principalDisplayName: string;
  principalId: string;
  resourceDisplayName: string;
}

export interface AppRoleAssignmentWithRoleName extends AppRoleAssignment {
  roleName: string;
}

export interface AzureUser {
  id: string;
  displayName: string;
  givenName: string | null;
  surname: string | null;
  mail: string | null;
  userPrincipalName: string;
  appRoleAssignments: AppRoleAssignment[];
}

export interface AzureUserWithRole extends AzureUser {
  appRoleAssignments: AppRoleAssignmentWithRoleName[];
}

export interface AppRole {
  id: string;
  displayName: string;
  description: string | null;
}

export interface Application {
  id: string;
  appId: string;
  displayName: string;
  description: string | null;
  appRoles: AppRole[];
}

export type AzureRolesLookUp = Record<string, AppRole>;

export interface CreateAzureUserRequest {
  accountEnabled: boolean;
  displayName: string;
  mailNickname: string;
  userPrincipalName: string;
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean;
    password: string;
  };
}

export interface CreateUserResponse {
  id: string;
  displayName: string;
  givenName: string;
  mail: string;
  mobilePhone: string;
  surname: string;
  userPrincipalName: string;
}

export interface AzureInviteRequest {
  invitedUserEmailAddress: string;
  inviteRedirectUrl: string;
  sendInvitationMessage: boolean;
}

export interface AzureInviteResponse {
  id: string;
  inviteRedeemUrl: string;
  invitedUserDisplayName: string;
  invitedUserEmailAddress: string;
  resetRedemption: boolean;
  sendInvitationMessage: boolean;
  invitedUserMessageInfo: {
    messageLanguage: string | null;
    ccRecipients: [
      {
        emailAddress: {
          name: string | null;
          address: string | null;
        };
      }
    ];
    customizedMessageBody: string | null;
  };
  inviteRedirectUrl: string;
  status: string;
  invitedUser: { id: string };
}

export interface AzureAppRoleRequest {
  principalId: string;
  resourceId: string;
  appRoleId: string;
}

export interface AzureAppRoleResponse {
  id: string;
  deletedDateTime: string;
  appRoleId: string;
  createdDateTime: string;
  principalDisplayName: string;
  principalId: string;
  principalType: string;
  resourceDisplayName: string;
  resourceId: string;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAzureToken()}`,
  };
}

async function getAzureRolesLookUpAsync(): Promise<AzureRolesLookUp> {
  try {
    const appRoles = await getAzureRolesAsync();

    const azureRolesLookUp = appRoles.reduce<AzureRolesLookUp>((res, value) => {
      res[value.id] = value;

      return res;
    }, {});

    return azureRolesLookUp;
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureRolesAsync(): Promise<AppRole[]> {
  try {
    invariant(process.env.OBJECT_ID, "OBJECT_ID must be set");

    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/applications/${process.env.OBJECT_ID}?$select=appRoles`,
      {
        headers: getHeaders(),
      }
    );

    const azureApplication: Application = await response.json();

    return azureApplication.appRoles;
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUsersAsync(): Promise<AzureUser[]> {
  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/users?$expand=appRoleAssignments`,
      {
        headers: getHeaders(),
      }
    );

    const azureUsers: { value: AzureUser[] } = await response.json();

    return azureUsers.value;
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUsersWithRolesAsync(): Promise<
  AzureUserWithRole[]
> {
  try {
    const [azureUsers, roles] = await Promise.all([
      getAzureUsersAsync(),
      getAzureRolesLookUpAsync(),
    ]);

    return azureUsers.map((user) => ({
      ...user,
      appRoleAssignments: user.appRoleAssignments
        .filter(({ appRoleId }) => roles[appRoleId])
        .map((roleAssignment) => ({
          ...roleAssignment,
          roleName: roles[roleAssignment.appRoleId].displayName,
        })),
    }));
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function getAzureUserWithRolesByIdAsync(
  azureId: string
): Promise<AzureUserWithRole> {
  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/users/${azureId}?$expand=appRoleAssignments`,
      {
        headers: getHeaders(),
      }
    );

    const azureUserPromise: Promise<AzureUserWithRole> = response.json();

    const [azureUser, roles] = await Promise.all([
      azureUserPromise,
      getAzureRolesLookUpAsync(),
    ]);

    return {
      ...azureUser,
      appRoleAssignments: azureUser.appRoleAssignments
        .filter(({ appRoleId }) => roles[appRoleId])
        .map((roleAssignment) => ({
          ...roleAssignment,
          roleName: roles[roleAssignment.appRoleId].displayName,
        })),
    };
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function createAzureUserAsync(
  createAzureUserRequest: CreateAzureUserRequest
): Promise<CreateUserResponse> {
  try {
    const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(createAzureUserRequest),
    });

    return response.json();
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function inviteUserToAzureAsync(
  azureInviteRequest: AzureInviteRequest
): Promise<AzureInviteResponse> {
  try {
    const response = await fetch(`${MICROSOFT_GRAPH_V1_BASEURL}/invitations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(azureInviteRequest),
    });

    return response.json();
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function assignRoleToUserAsync(
  azureAppRoleRequest: AzureAppRoleRequest
): Promise<AzureAppRoleResponse> {
  try {
    const response = await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/servicePrincipals/${APP_ID}/appRoleAssignedTo`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(azureAppRoleRequest),
      }
    );

    return response.json();
  } catch (e) {
    throw redirect("/logout");
  }
}

export async function removeRoleFromUserAsync(
  appRoleAssignmentId: string
): Promise<void> {
  try {
    await fetch(
      `${MICROSOFT_GRAPH_V1_BASEURL}/servicePrincipals/${APP_ID}/appRoleAssignedTo/${appRoleAssignmentId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
  } catch (e) {
    throw redirect("/logout");
  }
}
