import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to default tenant
  redirect("/valdman");
}
