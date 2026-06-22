import ChatClient from "../../chat-client";

type HotelChatPageProps = {
  params: Promise<{
    propertySlug: string;
  }>;
};

export default async function HotelChatPage({ params }: HotelChatPageProps) {
  const { propertySlug } = await params;

  return <ChatClient mode="hotel" propertySlug={propertySlug} />;
}
