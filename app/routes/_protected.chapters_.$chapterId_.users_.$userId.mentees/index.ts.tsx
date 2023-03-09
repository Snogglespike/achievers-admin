import type { LoaderArgs } from "@remix-run/server-runtime";

import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";
import dayjs from "dayjs";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  getMenteesMentoredByAsync,
} from "~/services";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import { getUserAtChapterByIdAsync } from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [azureUser, userAtChapters, assignedMentees] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
    getUserAtChapterByIdAsync(params.chapterId, params.userId),
    getMenteesMentoredByAsync(params.userId),
  ]);

  return json({
    user: {
      ...azureUser,
      chapter: userAtChapters?.Chapter ?? null,
      assignedMentees,
    },
  });
}

export default function Mentees() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{user.email}</h3>
      <p className="py-2">
        Role:{" "}
        {user.appRoleAssignments.length > 0 ? (
          user.appRoleAssignments.map(({ roleName }) => roleName).join(", ")
        ) : (
          <i>No Roles assigned</i>
        )}
      </p>
      {user.chapter ? (
        <p>Assigned Chapter: {user.chapter.name}</p>
      ) : (
        <p>
          <i>No Chapters assigned</i>
        </p>
      )}

      <hr className="my-4" />

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Mentee
              </th>
              <th align="left" className="p-2">
                Frequency
              </th>
              <th align="left" className="p-2">
                Start Date
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.assignedMentees.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No Mentees assigned to this Mentor</i>
                </td>
              </tr>
            )}
            {user.assignedMentees.map(
              ({
                frequencyInDays,
                startDate,
                Mentee: { id, firstName, lastName },
              }) => (
                <tr key={id}>
                  <td className="border p-2">
                    {firstName} {lastName}
                  </td>
                  <td className="border p-2">Every {frequencyInDays} days</td>
                  <td className="border p-2">
                    {dayjs(startDate).format("DD/MM/YYYY")}
                  </td>
                  <td align="right" className="border p-2">
                    <Link
                      to={`mentees/${id}/delete`}
                      className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                    >
                      <XMarkIcon className="mr-2 w-5" />
                      <span>Remove</span>
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center space-x-6">
        <Link
          to="../"
          relative="path"
          className="flex w-24 items-center justify-center space-x-2 rounded border border-zinc-300 bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
        >
          <ArrowSmallLeftIcon className="w-5" />
          <span>Back</span>
        </Link>
        <Link
          to="mentees/assign"
          relative="path"
          className="my-8 flex w-64 items-center justify-center space-x-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        >
          <PlusIcon className="w-5 text-white" />
          <span>Assign new Mentee</span>
        </Link>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}