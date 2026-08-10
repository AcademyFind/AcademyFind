"use client";
import Link from "next/link";
import { FaWhatsapp, FaTelegramPlane, FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";

export function SocialSidebar() {
  const socials = [
    {
      name: "WhatsApp",
      href: "https://wa.me/919045699938",
      icon: <FaWhatsapp className="h-5 w-5" />,
      color: "hover:bg-[#25D366] hover:text-white",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/academyfind",
      icon: <FaInstagram className="h-5 w-5" />,
      color: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:text-white",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61561180379260",
      icon: <FaFacebook className="h-5 w-5" />,
      color: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/academyfind",
      icon: <FaLinkedin className="h-5 w-5" />,
      color: "hover:bg-[#0A66C2] hover:text-white",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/channel/UCYiRb6vo_Rr_w3PO746hsKg",
      icon: <FaYoutube className="h-5 w-5" />,
      color: "hover:bg-[#FF0000] hover:text-white",
    },
    {
      name: "Telegram",
      href: "https://t.me/academyfind",
      icon: <FaTelegramPlane className="h-5 w-5" />,
      color: "hover:bg-[#229ED9] hover:text-white",
    },
  ];

  return (
    <div className="absolute left-0 top-1/2 z-[50] hidden -translate-y-1/2 flex-col gap-2 rounded-r-xl bg-white/90 p-2 shadow-lg backdrop-blur-md border border-l-0 border-slate-200 transition-all hover:pr-4 md:flex">
      {socials.map((social) => (
        <Link
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          title={social.name}
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-all duration-300 ${social.color}`}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
}
