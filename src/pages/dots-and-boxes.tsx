import type { NextPage } from "next";
import Head from "next/head";
import DotsAndBoxesPlay from "@/features/dots-and-boxes/components/DotsAndBoxesPlay";

const DotsAndBoxes: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dots &amp; Box</title>
        <meta name="description" content="Tarik garis antar titik dan kuasai kotak melawan bot" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <DotsAndBoxesPlay />
    </>
  );
};

export default DotsAndBoxes;
