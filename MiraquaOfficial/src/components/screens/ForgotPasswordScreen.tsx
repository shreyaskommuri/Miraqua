
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    setIsLoading(true);
    setError("");
    setEmailError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success message
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/signin");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <ScrollArea className="h-screen">
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="flex items-center mb-8">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSignIn}
                  className="p-2 mr-3"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
              </div>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Reset Link Sent!
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Check your inbox and follow the instructions to reset your password.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={handleResend}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-12"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend Email"
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleBackToSignIn}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Back to Sign In
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Didn't receive the email?</strong><br />
                      Check your spam folder or try resending the email.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ScrollArea className="h-screen">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/signin")}
                className="p-2 mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            </div>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-center text-gray-800">
                  Forgot Your Password?
                </CardTitle>
                <p className="text-sm text-center text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        className={`pl-10 h-12 border-gray-200 focus:border-blue-500 ${emailError ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg disabled:bg-blue-400"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600">
                    Remember your password?{" "}
                    <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Security Note</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    For your security, password reset links expire after 1 hour. 
                    If you don't receive an email within a few minutes, check your spam folder.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ForgotPasswordScreen;
