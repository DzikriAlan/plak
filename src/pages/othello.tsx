import type { NextPage } from "next";
import Head from "next/head";
import OthelloPlay from "@/features/othello/components/OthelloPlay";

const Othello: NextPage = () => {
  return (
    <>
      <Head>
        <title>Othello</title>
        <meta name="description" content="Othello klasik delapan kali delapan melawan bot dengan aturan jepit dan balik" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <OthelloPlay />
    </>
  );
};

export default Othello;
