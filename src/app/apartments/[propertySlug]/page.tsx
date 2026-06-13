import ChatClient from "../../chat-client";

type ApartmentChatPageProps = {
  params: Promise<{
    propertySlug: string;
  }>;
};

export default async function ApartmentChatPage({
  params,
}: ApartmentChatPageProps) {
  const { propertySlug } = await params;

  return <ChatClient mode="apartment" propertySlug={propertySlug} />;
}
