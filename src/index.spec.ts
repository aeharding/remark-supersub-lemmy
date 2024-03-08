import test, { ExecutionContext } from "ava";
import supersub from "./index";
import html from "rehype-stringify";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import { unified } from "unified";

const strip = ([str]: TemplateStringsArray) =>
  str.replace(/\n {6}/g, "\n").replace(/\n {4}$/, "");

const parse = (str: string) =>
  unified()
    .use(markdown)
    .use(supersub)
    .use(remark2rehype)
    .use(html)
    .process(str)
    .then((data) => data.toString());

const fixtures = [
  [
    "a basic supersub list",
    strip`
      21^st^ Century

      H~2~O
    `,
  ],
  [
    "text not as supersub",
    strip`
      It^ should^ not

      parse ~into ~text ~.
    `,
  ],
  [
    "text not as supersub with spaces",
    strip`
      This ^should not^

      parse ~as supersub~.
    `,
  ],
  [
    "as supersub with one character",
    strip`
      ^t^
    `,
  ],
  [
    "not as supersub with zero characters",
    strip`
      testing ^^ test
    `,
  ],
];

async function macro(t: ExecutionContext, input: any) {
  const result = await parse(input);
  t.snapshot(result);
}

macro.title = (name: string) => `remark-supersub should parse ${name}`;

for (const fixture of fixtures) {
  const [name, source] = fixture;
  test(name, macro, source);
}

/*
describe.each(fixtures)('remark-supersub', (name, source) => {
  it(`should parse a ${name}`, () => {
    return expect(parse(source)).resolves.toMatchSnapshot()
  })
})
*/
