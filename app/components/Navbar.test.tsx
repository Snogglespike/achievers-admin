import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navbar from "~/components/Navbar";

test("Header snapshot", async () => {
  const { baseElement } = render(
    <MemoryRouter>
      <Navbar isAdmin={true} />
    </MemoryRouter>
  );

  expect(baseElement).toMatchSnapshot();
});
