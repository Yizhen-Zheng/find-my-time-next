import React from "react";
import Link from "next/link";
const Header = () => {
  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-row w-full gap-x-5">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            [Username]'s Calendar
          </h1>
          <Link href={"/user"}>
            <p className="text-2xl font-bold text-slate-800 mb-2 right-0 ">
              User avadar
            </p>
          </Link>
        </div>
        <p className="text-slate-600">
          Stay organized and plan your days effectively
        </p>
      </div>
    </div>
  );
};

export default Header;
