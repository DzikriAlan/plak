import type { NextPage } from "next";
import Head from "next/head";
import CongklakPlay from "@/features/congklak/components/CongklakPlay";

const Congklak: NextPage = () => {
  return (
    <>
      <Head>
        <title>Congklak</title>
        <meta name="description" content="Congklak tradisional melawan bot dengan aturan tembak dan giliran tambahan" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <CongklakPlay />
    </>
  );
};

export default Congklak;
