import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import { Key } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import { getUserByIdAsync, updateAzureIdAsync } from "./services.server";
import {
  APP_ID,
  assignRoleToUserAsync,
  getCurrentHost,
  inviteUserToAzureAsync,
  Roles,
  trackTrace,
} from "~/services";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId !== null) {
    throw new Error("User already part of Azure AD.");
  }

  return json({
    userId: params.userId,
    user,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const inviteUserToAzureResponse = await inviteUserToAzureAsync(request, {
    invitedUserEmailAddress: user.email,
    inviteRedirectUrl: getCurrentHost(request),
    sendInvitationMessage: true,
  });

  trackTrace({
    message: "GIVE_ACCESS_MENTOR",
    properties: inviteUserToAzureResponse,
  });

  const azureUserId = inviteUserToAzureResponse.invitedUser.id;

  const assignRoleResponse = await assignRoleToUserAsync(request, azureUserId, {
    principalId: azureUserId,
    appRoleId: Roles.Mentor,
    resourceId: APP_ID,
  });

  trackTrace({
    message: "ASSIGN_ROLE_TO_MENTOR",
    properties: assignRoleResponse,
  });

  await updateAzureIdAsync(Number(params.userId), azureUserId);

  return redirect(`/admin/users/${params.userId}`);
}

export default function Chapter() {
  const transition = useNavigation();
  const { userId, user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to={`/admin/users/${userId}`} />

      <Title>
        Invite "{user.firstName} {user.lastName}" to the achievers' web app
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to invite "{user.firstName} {user.lastName}"
            to the achievers' web app?
          </p>

          <button
            className="btn btn-success float-right mt-6 w-64 gap-4"
            type="submit"
          >
            <Key className="h-6 w-6" />
            Give access
          </button>
        </fieldset>
      </Form>
    </>
  );
}
