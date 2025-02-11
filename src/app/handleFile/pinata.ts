import { PinataSDK } from "pinata-web3";

const pinata: PinataSDK = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_URL,
});

export const uploadJson = async (
  jsonMetadata: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const GeneratedJson = await pinata.upload.json(jsonMetadata);
  return GeneratedJson;
};
