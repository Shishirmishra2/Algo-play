"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/sign-in`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.user && data.session) {
      router.push("/dashboard");
    } else if (data.user && !data.session) {
      toast.success("Account created! Please check your email to confirm.");
    }
  };

  return (
    <section className="min-h-screen text-white flex items-center">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          size="icon"
          className="mb-8 text-white hover:bg-white/10"
          asChild
        >
          <Link href={"/"}>
            <ArrowLeftIcon size={24} />
          </Link>
        </Button>

        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Sign Up</h1>
            <p className="text-gray-300">
              It only takes a minute to create your account
            </p>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="flex gap-4">
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-transparent border-2 border-white/20 rounded-2xl px-6 py-6 h-16 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-0"
                required
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-transparent border-2 border-white/20 rounded-2xl px-6 py-6 h-16 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-0"
                required
              />
            </div>

            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent border-2 border-white/20 rounded-2xl px-6 py-6 h-16 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-0"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent border-2 border-white/20 rounded-2xl px-6 py-6 pr-12 h-16 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeSlashIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-5 cursor-pointer"
              >
                I agree the AlgoPlay{" "}
                <span className="text-purple-400">Terms of Services</span> and{" "}
                <span className="text-purple-400">Privacy Policy</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!agreeToTerms || loading}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>

            <div className="text-center">
              <p className="text-gray-400">
                Already registered?{" "}
                <a
                  href="/sign-in"
                  className="text-white hover:text-purple-300"
                >
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

