// pages/auth/signin.js
import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center">
      <div className="p-6 bg-white shadow rounded max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Sign in to Foul Domain</h1>
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name} className="mb-2">
              <button
                onClick={() => signIn(provider.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Sign in with {provider.name}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
