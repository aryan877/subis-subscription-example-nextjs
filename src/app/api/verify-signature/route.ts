import { isMessageSignatureCorrect } from "zksync-ethers/build/utils";
import { NextRequest } from "next/server";
import { Provider, Contract } from "zksync-ethers";
import { chains } from "./chain";
import AAFactoryArtifact from "../../../../artifacts-zk/contracts/AAFactory.sol/AAFactory.json";
import SubscriptionManagerArtifact from "../../../../artifacts-zk/contracts/SubscriptionManager.sol/SubscriptionManager.json";

const AA_FACTORY_ADDRESS = process.env.AA_FACTORY_ADDRESS;
const SUBSCRIPTION_MANAGER_ADDRESS = process.env.SUBSCRIPTION_MANAGER_ADDRESS;

export async function POST(request: NextRequest) {
  const { message, address, signature } = await request.json();

  if (!message || !address || !signature) {
    return new Response(
      JSON.stringify({ error: "Message, address, and signature are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const provider = new Provider(chains.inMemoryLocalNode.rpcUrl!);

  try {
    const isSignatureCorrect = await isMessageSignatureCorrect(
      provider,
      address,
      message,
      signature
    );

    if (isSignatureCorrect) {
      const aaFactory = new Contract(
        AA_FACTORY_ADDRESS!,
        AAFactoryArtifact.abi,
        provider
      );
      const subscriptionAccountAddress =
        await aaFactory.getAccountByOwnerAndManager(
          address,
          SUBSCRIPTION_MANAGER_ADDRESS
        );

      const subscriptionManager = new Contract(
        SUBSCRIPTION_MANAGER_ADDRESS!,
        SubscriptionManagerArtifact.abi,
        provider
      );
      const subscription = await subscriptionManager.subscriptions(
        subscriptionAccountAddress
      );
      const planId = subscription.planId.toString();

      const plan = await subscriptionManager.plans(planId);

      return Response.json(
        {
          success: true,
          message: "Signature verified successfully",
          plan: {
            planId: plan.planId.toString(),
            name: plan.name,
            feeUSD: plan.feeUSD.toString(),
            isActive: plan.isActive,
            isLive: plan.isLive,
          },
        },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Signature verification failed",
        },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    return new Response(
      JSON.stringify({ error: "Error verifying signature" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
