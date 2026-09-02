import type { NextPage } from "next";
import Head from "next/head";
import TetrisPlay from "@/features/tetris/components/TetrisPlay";

const Tetris: NextPage = () => {
  return (
    <>
      <Head>
        <title>Tetris</title>
        <meta name="description" content="Susun balok yang jatuh dan bersihkan baris sebanyak mungkin" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <TetrisPlay />
    </>
  );
};

export default Tetris;
