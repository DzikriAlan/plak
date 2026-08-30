import type { NextPage } from "next";
import Head from "next/head";
import ColorSortPlay from "@/features/color-sort/components/ColorSortPlay";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Color Sort 3D</title>
        <meta name="description" content="Game color sort 3D dengan level tanpa batas" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <ColorSortPlay />
    </>
  );
};

export default Home;
