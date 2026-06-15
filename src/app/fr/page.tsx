import LandingPage from "../landing-page";
import { getLandingMetadata } from "../landing-copy";

export const metadata = getLandingMetadata("fr");

export default function FrenchLandingPage() {
  return <LandingPage locale="fr" />;
}
