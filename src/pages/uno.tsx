import type { NextPage } from "next";
import Head from "next/head";
import UnoPlay from "@/features/uno/components/UnoPlay";

const Uno: NextPage = () => {
  return (
    <>
      <Head>
        <title>UNO</title>
        <meta name="description" content="Classic UNO with a neo brutalism look" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <UnoPlay />
    </>
  );
};

export default Uno;
