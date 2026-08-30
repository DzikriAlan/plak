import type { NextPage } from "next";
import Head from "next/head";
import StorePlay from "@/features/store/components/StorePlay";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Plak — Game Store</title>
        <meta
          name="description"
          content="Kumpulan game ringan yang bisa langsung dimainkan di browser, gratis dan tanpa daftar."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <StorePlay />
    </>
  );
};

export default Home;
