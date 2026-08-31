import type { NextPage } from "next";
import Head from "next/head";
import MazeRunnerPlay from "@/features/maze-runner/components/MazeRunnerPlay";

const MazeRunner: NextPage = () => {
  return (
    <>
      <Head>
        <title>Labirin Kumbang</title>
        <meta name="description" content="Maze runner: susuri labirin dan bawa kumbang sampai ke gua sebelum waktu habis" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <MazeRunnerPlay />
    </>
  );
};

export default MazeRunner;
