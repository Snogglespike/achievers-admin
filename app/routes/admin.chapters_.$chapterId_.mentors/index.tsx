import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { PageEdit } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import { getMentorsWithStudentsAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const mentorsWithStudents = await getMentorsWithStudentsAsync(
    Number(params.chapterId),
  );

  return json({
    mentorsWithStudents,
  });
}

export default function Index() {
  const { mentorsWithStudents } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to="../../" />

      <Title>Mentors with students</Title>

      <div className="overflow-auto bg-white">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Full name
              </th>
              <th align="left" className="p-2">
                Frequency
              </th>
              <th align="left" className="p-2">
                Students
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {mentorsWithStudents.map(
              ({
                id,
                firstName,
                lastName,
                frequencyInDays,
                mentorToStudentAssignement,
              }) => (
                <tr key={id}>
                  <td className="border p-2">
                    {firstName} {lastName}
                  </td>
                  <td className="border p-2">
                    {frequencyInDays === 14 ? "Fortnightly" : "Weekly"}
                  </td>
                  <td className="border">
                    <ul className="list-disc pl-2">
                      {mentorToStudentAssignement.map(({ student }) => (
                        <li key={student.id}>
                          {student.firstName} {student.lastName}
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