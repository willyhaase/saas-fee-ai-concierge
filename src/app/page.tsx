import LandingPage from "./landing-page";
import { getLandingMetadata } from "./landing-copy";

export const metadata = getLandingMetadata("de");

export default function Home() {
  return <LandingPage locale="de" />;
}
