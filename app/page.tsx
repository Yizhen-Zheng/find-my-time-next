import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Main Content */}

        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-700 mb-6">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily View Card */}
              <Link href="/daily-view">
                <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-[#afc8fe] cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#afc8fe] bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-[#afc8fe]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Go to Daily View
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Get start with your tasks for today
                  </p>
                </div>
              </Link>

              {/* Help Me Plan Card */}
              <Link href={"/task"}>
                <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-[#fef3c6] cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#fef3c6] bg-opacity-60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Help Me Generate Plan
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Get AI assistance to create and organize your schedule
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* This Week Overview */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-700">
                This Week Overview
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                June 23 - 29, 2025
              </span>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs font-medium text-slate-500 mb-2">
                      {day}
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium mx-auto ${
                        index === 6
                          ? "bg-[#afc8fe] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {22 + index}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-slate-600 text-sm">
                No events scheduled for this week
              </p>
              <button className="mt-2 text-[#afc8fe] hover:text-blue-600 text-sm font-medium">
                Add your first event
              </button>
            </div>
          </div>

          {/* Coming Features */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-slate-600 text-sm">
                More features coming soon (set your own theme)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
