import type { NextPage } from "next";
import Head from "next/head";
import AuthLogin from "@/features/auth/components/AuthLogin";

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Masuk — Waitplay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <AuthLogin />
    </>
  );
};

export default Login;
