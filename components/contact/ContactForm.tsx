"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { submitContactForm } from "@/lib/contact"; // Path check kar lena
import { Loader2 } from "lucide-react";

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formElement = e.currentTarget;

    const formData = new FormData(e.currentTarget);
    try {
        const result = await submitContactForm(formData);
        
        if (result.success) {
            toast.success(result.message || "Message sent successfully");
            
            formElement.reset(); 
        } else {
            toast.error(result.error || "Can't send message");
        }
    } catch (error) {
        toast.error("An error occurred");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        Send a Message
      </h2>
      <p className="text-sm text-slate-500 mt-2">
        Want to list your institute or have a query? Fill the form below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        
        {/* Name attributes daalna zaroori hai backend ke liye */}
        <Input 
            name="name" 
            placeholder="Your Name *" 
            required 
            disabled={isLoading}
        />

        <Input
            name="email"
            type="email"
            placeholder="Your Email *"
            required
            disabled={isLoading}
        />

        <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-500 font-medium text-sm pointer-events-none">+91</span>
            <Input
                name="phone"
                type="tel"
                placeholder="Phone Number *"
                required
                disabled={isLoading}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                title="Please enter a valid 10-digit Indian mobile number"
                className="pl-11"
                onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                }}
            />
        </div>

        <Input 
            name="subject" 
            placeholder="Subject (e.g., Want to list my Institute)" 
            disabled={isLoading}
        />

        <Textarea
            name="message"
            placeholder="Your Message *"
            required
            className="min-h-45 resize-none"
            disabled={isLoading}
        />

        <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Sending...
              </>
          ) : (
              "Send Message"
          )}
        </Button>
      </form>
    </div>
  );
}