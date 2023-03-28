import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import EnvelopeIcon from "@heroicons/react/24/solid/EnvelopeIcon";

import { Title, BackHeader } from "~/components";

import { getUserByIdAsync, updateAzureIdAsync } from "./services.server";
import {
  APP_ID,
  assignRoleToUserAsync,
  getSessionUserAsync,
  inviteUserToAzureAsync,
  Roles,
} from "~/services";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId !== null) {
    throw new Error();
  }

  return json({
    user,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(process.env.WEB_APP_URL, "WEB_APP_URL not found");

  const sessionUser = await getSessionUserAsync(request);

  const user = await getUserByIdAsync(Number(params.userId));

  const {
    invitedUser: { id: azureUserId },
  } = await inviteUserToAzureAsync(sessionUser.accessToken, {
    invitedUserEmailAddress: user.email,
    inviteRedirectUrl: process.env.WEB_APP_URL,
    sendInvitationMessage: true,
  });

  await assignRoleToUserAsync(sessionUser.accessToken, azureUserId, {
    principalId: azureUserId,
    appRoleId: Roles.Mentor,
    resourceId: APP_ID,
  });

  await updateAzureIdAsync(Number(params.userId), azureUserId);

  return redirect(`/users/${params.userId}`);
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

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
            className="btn-primary btn float-right mt-6 w-64 gap-4"
            type="submit"
          >
            <EnvelopeIcon className="h-6 w-6" />
            Invite
          </button>
        </fieldset>
      </Form>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <h2 className="card-title">Error</h2>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    </div>
  );
}
