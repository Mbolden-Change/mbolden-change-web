import { defineField, defineType } from "sanity";


export const pillarsContainerType = defineType({
    name: "pillarContainer",
    type: "document",
    title: "Pillar Container",
    fields: [
        defineField({
            name: "eyebrow",
            type: "string",
            title: "Eyebrow",
            description: "Optional label above the section title.",
        }),
        defineField({
            name: "title",
            type: "string",
            title: "Title",
        }),
        defineField({
            name: "description",
            type: "array",
            title: "Description",
            of: [{ type: "block" }],
        }),
        defineField({
            name: "pillars",
            type: "array",
            title: "Pillars",
            of: [{ type: "reference", to: [{ type: "pillarCard" }] }],
        }),
    ],
});