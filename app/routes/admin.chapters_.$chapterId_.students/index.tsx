import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { CoinsSwap, PageEdit } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import { getMentorsWithStudentsAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const mentorsWithStudents = await getMentorsWithStudentsAsync(
    Number(params.chapterId),
  );

  return json({
    chapterId: params.chapterId,
    mentorsWithStudents,
  });
}

export default function Index() {
  const { chapterId, mentorsWithStudents } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex items-center justify-between">
        <BackHeader to="/admin/chapters" />

        <Link
          to={`/admin/chapters/${chapterId}/mentors`}
          className="btn min-w-40 gap-2"
        >
          <CoinsSwap className="h-6 w-6" />
          Swap to mentors view
        </Link>
      </div>

      <Title>Students with Mentors</Title>

      <div className="overflow-auto bg-white">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Full name
              </th>
              <th align="left" className="p-2">
                Mentors
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {mentorsWithStudents.map(
              ({ id, firstName, lastName, mentorToStudentAssignement }) => (
                <tr key={id}>
                  <td className="border p-2">
                    {firstName} {lastName}
                  </td>
                  <td className="border">
                    <ul className="list-disc pl-2">
                      {mentorToStudentAssignement.map(({ user }) => (
                        <li key={user.id}>
                          {user.firstName} {user.lastName}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border p-2">
                    <Link
                      to={id.toString()}
                      className="btn btn-success btn-xs w-full gap-2"
                    >
                      <PageEdit className="h-4 w-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}