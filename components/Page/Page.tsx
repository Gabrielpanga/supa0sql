import { default as NextHead } from "next/head";

import { Props } from "./Page.types";

const Page = ({ title = "", children, description, footer = true }: Props) => (
  <>
    <NextHead>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <title>{title || "Supa0SQL"}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="description"
        content={
          description ||
          "Your SQL companion & illustrator for your non-tech friend"
        }
      />
    </NextHead>
    {children}
    {footer && <footer></footer>}
  </>
);

export default Page;
