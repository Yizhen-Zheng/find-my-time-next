"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AlignJustify } from "lucide-react";
import { X, ListTodo } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Initial position (top-4 left-4 = 16px)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const toggleMenu = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    e.preventDefault();
    setIsDragging(true);

    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    e.preventDefault();
    setIsDragging(true);

    const rect = buttonRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  // Handle drag movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport bounds
      const maxX = window.innerWidth - 60; // 60px is approximate button width
      const maxY = window.innerHeight - 60;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      // Constrain to viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  // Save position to localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem("hamburger-position");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hamburger-position", JSON.stringify(position));
  }, [position]);

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: "/daily-view",
      label: "Daily View",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      href: "/task",
      label: "Add Tasks",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      href: "/task/all-task",
      label: "All tasks",
      icon: <ListTodo className="size-4" />,
    },
    {
      href: "/log-in",
      label: "Login",
      icon: (
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
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Draggable Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`fixed z-50 p-3 rounded-xl shadow-lg transition-all duration-300 select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${
          isOpen
            ? "bg-white text-slate-700 "
            : "bg-white text-slate-700 hover:bg-[#afc8fe] hover:text-white"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: "none", // Prevent default touch behaviors
        }}
        aria-label="Toggle navigation menu"
      >
        <div className="relative w-6 h-6">
          {/* Hamburger Icon */}
          {isOpen ? (
            <X className="" />
          ) : (
            <AlignJustify className=" text-current transition-all duration-300 " />
          )}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-100/30 z-30 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Navigation Menu */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 bg-white ${
          isOpen && "shadow-2xl"
        } z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#bbd9ff] to-[#83aaff]">
          <div className="flex items-center space-x-3 ml-14">
            <div>
              <h2 className="text-white font-semibold text-lg">User name</h2>
              <p className="text-blue-100 text-sm">Navigation Menu</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-[#afc8fe] text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-[#afc8fe]"
                  }`}
                >
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Version 1.0</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
