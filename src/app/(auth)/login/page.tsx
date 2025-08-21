import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { login, signup } from "./actions"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/utils/supabase/server"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Login({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return redirect("/")
  }

  const resolvedParams = await searchParams
  const message = resolvedParams.message as string | undefined

  return (
    <div className="min-h-screen bg-radial-100 relative">
      {/* geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Login Section */}
      <section className="min-h-screen flex justify-center items-center px-6 relative">
        <div className="w-full max-w-md">
          <Card className="border border-white/20 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-blue-100">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <form id="login-form" className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-100 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 border-gray-20 focus:border-pink-100 focus:ring-pink-100/20 rounded-lg bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-100 font-medium">
                      Password
                    </Label>
                    <a href="#" className="text-sm text-pink-100 hover:text-pink-200 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    minLength={6}
                    name="password"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-12 border-gray-20 focus:border-pink-100 focus:ring-pink-100/20 rounded-lg bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
                {message && (
                  <div className="text-sm font-medium text-orange-100 bg-pink-10 p-3 rounded-lg border border-gray-20 backdrop-blur-sm">
                    {message}
                  </div>
                )}
                <Button
                  formAction={login}
                  className="w-full h-12 bg-pink-100 hover:brightness-90 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  Sign In
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/95 px-2 text-gray-100">Or</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-gray-100">Don&apos;t have an account? </span>
                <button
                  formAction={signup}
                  form="login-form"
                  className="text-pink-100 hover:text-pink-200 font-semibold transition-colors duration-200 hover:underline"
                >
                  Create account
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-100">
              By signing in, you agree to our{" "}
              <a href="#" className="text-pink-100 hover:text-pink-200 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-pink-100 hover:text-pink-200 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}