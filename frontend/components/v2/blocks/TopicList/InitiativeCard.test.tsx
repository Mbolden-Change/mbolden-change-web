import type { InternalOrExternalLink } from "@/sanity/types";
import { render, screen } from "@testing-library/react";
import InitiativeCard from "./InitiativeCard";

const initiative = {
  title: "Meeting Basic Needs",
  summary: "Flexible support for families.",
};

test("keeps initiative content visible without a destination", () => {
  render(<InitiativeCard initiative={initiative} headingTag="h3" />);
  expect(
    screen.getByRole("heading", { level: 3, name: initiative.title }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("renders an accessible section link and gives anchors priority", () => {
  render(
    <InitiativeCard
      initiative={{
        ...initiative,
        link: {
          _type: "internalOrExternalLink",
          title: "Learn more",
          anchor: "meeting-basic-needs",
          isExternalLink: true,
          url: "https://example.com",
        },
      }}
      headingTag="h4"
    />,
  );
  expect(
    screen.getByRole("link", { name: "Learn more: Meeting Basic Needs" }),
  ).toHaveAttribute("href", "#meeting-basic-needs");
});

test("preserves external destinations", () => {
  render(
    <InitiativeCard
      initiative={{
        ...initiative,
        link: {
          _type: "internalOrExternalLink",
          title: "Visit partner",
          isExternalLink: true,
          url: "https://example.com",
          target: "_blank",
        },
      }}
      headingTag="h3"
    />,
  );
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "https://example.com",
  );
  expect(screen.getByRole("link")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
});

test("resolves a dereferenced internal page link", () => {
  const link = {
    _type: "internalOrExternalLink",
    title: "Explore our work",
    isExternalLink: false,
    reference: { _type: "page", slug: { current: "our-work" } },
  } as unknown as InternalOrExternalLink;
  render(
    <InitiativeCard initiative={{ ...initiative, link }} headingTag="h3" />,
  );
  expect(screen.getByRole("link")).toHaveAttribute("href", "/our-work");
});
