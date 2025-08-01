import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";

const TermsOfServiceScreen = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/app/account">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Account
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Miraqua Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Miraqua's smart irrigation platform, you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">2. Service Description</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Miraqua provides an AI-powered, end-to-end smart irrigation platform that includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Plot mapping and zone management</li>
                    <li>Automated watering schedules based on AI optimization</li>
                    <li>Real-time sensor monitoring and alerts</li>
                    <li>Collaboration tools and role management</li>
                    <li>AI agronomist consultation and plant health scanning</li>
                    <li>Reporting and analytics features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities 
                    that occur under your account or password. Miraqua reserves the right to refuse service, terminate accounts, or remove content at our sole discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">4. Device and Hardware</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Users are responsible for the proper installation, maintenance, and operation of irrigation hardware and sensors. Miraqua provides 
                    software guidance but is not responsible for hardware malfunctions, water damage, or crop loss resulting from device failures.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">5. Data and Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                    By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">6. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Miraqua shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
                    crop loss, water damage, or loss of profits, arising out of your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">7. Service Availability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    While we strive to maintain continuous service availability, Miraqua does not guarantee uninterrupted access to the platform. 
                    Scheduled maintenance, technical issues, or force majeure events may temporarily affect service availability.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">8. Modifications</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Miraqua may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the 
                    current version of these terms and conditions.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">9. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at legal@miraqua.com.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServiceScreen;