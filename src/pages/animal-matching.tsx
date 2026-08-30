import type { NextPage } from "next";
import Head from "next/head";
import AnimalMatchingPlay from "@/features/animal-matching/components/AnimalMatchingPlay";

const AnimalMatching: NextPage = () => {
  return (
    <>
      <Head>
        <title>Animal Matching</title>
        <meta name="description" content="Match identical animals with a path of at most two turns" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <AnimalMatchingPlay />
    </>
  );
};

export default AnimalMatching;
