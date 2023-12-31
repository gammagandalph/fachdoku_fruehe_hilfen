import SessionReact from "supertokens-auth-react/recipe/session";
import AdminDashboard from "../components/adminDashboard/users";
import { useUserData } from "../utils/authUtils";
import Error from "next/error";
import { Role } from "@prisma/client";
import FooterPages from "@/components/footerPages/footerPages";

function ProtectedPage() {
  const { user } = useUserData();

  if (!user || user.role !== Role.ADMIN)
    return <Error statusCode={403} title="Forbidden" />;

  return <FooterPages />;
}

export default function FooterPagesPage() {
  return (
    <SessionReact.SessionAuth>
      <ProtectedPage />
    </SessionReact.SessionAuth>
  );
}

