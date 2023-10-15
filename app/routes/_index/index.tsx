import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  getAzureUserWithRolesByIdAsync,
  Roles,
  getUserByAzureADIdAsync,
  getCurrentUserADIdAsync,
} from "~/services";

export async function loader({ request }: LoaderFunctionArgs) {
  const userAzureId = await getCurrentUserADIdAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(request, userAzureId);

  const userRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId,
  );

  if (userRoles.includes(Roles.Admin)) {
    return redirect("/admin/home");
  }

  const { volunteerAgreementSignedOn } =
    await getUserByAzureADIdAsync(userAzureId);

  if (volunteerAgreementSignedOn === null) {
    return redirect("/mentor/volunteer-agreement");
  }

  if (userRoles.includes(Roles.Mentor)) {
    return redirect("/mentor/roster");
  }

  throw redirect("/401");
}
