import type { NextPage } from "next";
import Head from "next/head";
import Game2048Play from "@/features/game-2048/components/Game2048Play";

const Game2048: NextPage = () => {
  return (
    <>
      <Head>
        <title>2048</title>
        <meta name="description" content="Geser papan untuk menggabungkan angka hingga mencapai ubin 2048" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <Game2048Play />
    </>
  );
};

export default Game2048;
