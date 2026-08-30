import type { NextPage } from "next";
import Head from "next/head";
import ColorSortPlay from "@/features/color-sort/components/ColorSortPlay";

const ColorSort: NextPage = () => {
  return (
    <>
      <Head>
        <title>Color Sort 3D</title>
        <meta name="description" content="A 3D color sort puzzle with endless levels" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <ColorSortPlay />
    </>
  );
};

export default ColorSort;
