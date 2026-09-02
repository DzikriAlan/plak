import type { NextPage } from "next";
import Head from "next/head";
import RubikPlay from "@/features/rubik/components/RubikPlay";

const Rubik: NextPage = () => {
  return (
    <>
      <Head>
        <title>Rubik 3D</title>
        <meta name="description" content="Kubus rubik tiga dimensi yang bisa diputar dan dirapikan langsung di peramban" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <RubikPlay />
    </>
  );
};

export default Rubik;
