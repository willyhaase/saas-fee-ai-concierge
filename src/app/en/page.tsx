import LandingPage from "../landing-page";
import { getLandingMetadata } from "../landing-copy";

export const metadata = getLandingMetadata("en");

export default function EnglishLandingPage() {
  return <LandingPage locale="en" />;
}
