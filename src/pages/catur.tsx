import type { NextPage } from "next";
import Head from "next/head";
import CaturPlay from "@/features/catur/components/CaturPlay";

const Catur: NextPage = () => {
  return (
    <>
      <Head>
        <title>Catur</title>
        <meta name="description" content="Catur klasik melawan engine Stockfish langsung di browser" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <CaturPlay />
    </>
  );
};

export default Catur;
