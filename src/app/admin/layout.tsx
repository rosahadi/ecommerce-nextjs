import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import MainNav from "./main-nav";
import MenuWrapper from "@/components/header/MenuWrapper";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl md:text-2xl text-primary">
                {APP_NAME}
              </span>
            </Link>
            <MainNav className="mx-6" />
            <div className="ml-auto items-center flex space-x-4">
              <MenuWrapper />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
