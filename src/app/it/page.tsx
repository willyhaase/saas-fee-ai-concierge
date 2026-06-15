import LandingPage from "../landing-page";
import { getLandingMetadata } from "../landing-copy";

export const metadata = getLandingMetadata("it");

export default function ItalianLandingPage() {
  return <LandingPage locale="it" />;
}
