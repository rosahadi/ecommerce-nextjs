"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formUrlQuery } from "@/lib/utils";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({
  page,
  totalPages,
  urlParamName,
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(page);

  const handleClick = (btnType: string) => {
    const pageValue =
      btnType === "next"
        ? currentPage + 1
        : currentPage - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 rounded-full border-2 ${
            currentPage <= 1
              ? "border-gray-200 bg-gray-100 text-gray-400"
              : "border-black bg-white text-black hover:bg-black hover:text-white transition-all"
          }`}
          disabled={currentPage <= 1}
          onClick={() => handleClick("prev")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center justify-center">
          <span className="text-lg font-bold">
            {currentPage}
          </span>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-500">
            {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 rounded-full border-2 ${
            currentPage >= totalPages
              ? "border-gray-200 bg-gray-100 text-gray-400"
              : "border-black bg-white text-black hover:bg-black hover:text-white transition-all"
          }`}
          disabled={currentPage >= totalPages}
          onClick={() => handleClick("next")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
