import Link from "next/link";
import { Megaphone } from "lucide-react";

export function OwnerCTA() {
  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Decorative elements */}
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center md:py-24">
          <h2 className="text-3xl font-bold text-slate-900 md:text-5xl lg:text-6xl max-w-3xl">
            Grow Your Institute with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">AcademyFind</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
            Join India's most trusted education directory. Reach thousands of active students, showcase your top facilities, and boost your admissions.
          </p>

          <div className="mt-10">
            <Link
              href="/user/create-institute"
              className="inline-block rounded-xl bg-gradient-to-r from-amber-400 to-amber-400 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40"
            >
              List Your Institute Free
            </Link>
          </div>
        </div>

        {/* Advertise Tab */}
        {/* <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[42%] -rotate-90 origin-center z-20">
          <Link 
            href="/contact" 
            className="flex items-center gap-2 rounded-t-xl bg-white border border-b-0 border-slate-200 px-6 py-2.5 font-semibold text-amber-500 shadow-xl transition-colors hover:bg-slate-50"
          >
            <Megaphone className="h-5 w-5" />
            Advertise
          </Link>
        </div> */}
      </div>
    </section>
  );
}
