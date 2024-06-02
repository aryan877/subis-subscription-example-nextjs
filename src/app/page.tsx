"use client";

import { useState } from "react";
import { useEthereum } from "../components/Context";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { NetworkSwitcher } from "../components/NetworkSwitcher";

interface Plan {
  planId: string;
  name: string;
  feeUSD: string;
  isActive: boolean;
  isLive: boolean;
}

function SignMessage() {
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrievingPlan, setRetrievingPlan] = useState(false);
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const { getSigner, account } = useEthereum();

  const handleSignMessage = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      setPlan(null);

      const signer = await getSigner();
      if (signer) {
        const message = "Hello, ZKSync!";
        const signedMessage = await signer.signMessage(message);
        setSignature(signedMessage);
        const address = await signer.getAddress();

        setLoading(false);
        setRetrievingPlan(true);

        const response = await fetch("/api/verify-signature", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            address,
            signature: signedMessage,
          }),
        });

        if (response.ok) {
          console.log("Signature verified successfully");
          setSuccess(true);
          const data = await response.json();
          setPlan(data.plan);
        } else {
          console.error("Signature verification failed");
          throw new Error("Signature verification failed");
        }
      } else {
        throw new Error("Signer not found.");
      }
    } catch (error) {
      //@ts-ignore
      setError(error.message);
    } finally {
      setLoading(false);
      setRetrievingPlan(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h1 className="text-4xl font-bold mb-8">Sign Message</h1>
      <div className="w-full max-w-md">
        <div className="bg-white border border-black rounded-lg p-8 mb-8 shadow-[6px_6px_0_0_#000] transition duration-300 ease-in-out hover:shadow-[8px_8px_0_0_#000]">
          <button
            onClick={handleSignMessage}
            disabled={loading || retrievingPlan}
            className={`btn btn-primary w-full shadow-[6px_6px_0_0_#000] transition duration-300 ease-in-out hover:shadow-[8px_8px_0_0_#000]`}
          >
            {loading
              ? "Signing..."
              : retrievingPlan
              ? "Retrieving plan details..."
              : "Sign Message"}
          </button>
        </div>

        {success && (
          <div className="alert alert-success shadow-lg mb-8">
            <div className="flex gap-4">
              <CheckCircle className="stroke-current flex-shrink-0 h-6 w-6" />
              <span>Signature verified successfully!</span>
            </div>
          </div>
        )}

        {signature && (
          <div className="bg-white border border-black rounded-lg p-6 mb-8 shadow-[6px_6px_0_0_#000] transition duration-300 ease-in-out hover:shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-semibold mb-4">Signature</h2>
            <p className="break-words">{signature}</p>
          </div>
        )}

        {plan && (
          <div className="bg-white border border-black rounded-lg p-6 mb-8 shadow-[6px_6px_0_0_#000] transition duration-300 ease-in-out hover:shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-semibold mb-4">Plan Details</h2>
            <p>Plan ID: {plan.planId}</p>
            <p>Name: {plan.name}</p>
            <p>Fee (USD): ${parseFloat(plan.feeUSD) / 10 ** 8}</p>
            <p>Is Active: {plan.isActive ? "Yes" : "No"}</p>
            <p>Is Live: {plan.isLive ? "Yes" : "No"}</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg">
            <div>
              <AlertTriangle className="stroke-current flex-shrink-0 h-6 w-6" />
              <span>{error}</span>
            </div>
          </div>
        )}
        <NetworkSwitcher />
      </div>
    </div>
  );
}

export default SignMessage;
