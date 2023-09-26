import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";

import { PageEdit, GraduationCap } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function TeacherList({ loaderData: { student } }: Props) {
  return (
    <>
      <SubTitle>Teachers</SubTitle>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Teacher full name
              </th>
              <th align="left" className="p-2">
                School name
              </th>
              <th align="right" className="w-3/12 p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {student.studentTeacher.map(({ id, fullName, schoolName }) => (
              <tr key={id}>
                <td className="border p-2">{fullName}</td>
                <td className="border p-2">{schoolName}</td>
                <td align="right" className="border p-2">
                  <Link
                    className="btn btn-success btn-xs w-full gap-2"
                    to={`teachers/${id}`}
                  >
                    <PageEdit className="h-4 w-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {student.guardian.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No teachers assigned to this student</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link to="teachers/new" className="btn btn-primary w-64 gap-4">
          <GraduationCap className="h-6 w-6" />
          Add a teacher
        </Link>
      </div>
    </>
  );
}