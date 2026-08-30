import type { NextPage } from "next";
import Head from "next/head";
import StorePlay from "@/features/store/components/StorePlay";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Waitplay — Game Store</title>
        <meta
          name="description"
          content="A collection of light games you can play straight in the browser, free and without signing up."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <StorePlay />
    </>
  );
};

export default Home;
