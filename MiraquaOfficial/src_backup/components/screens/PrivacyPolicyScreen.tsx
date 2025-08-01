import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyScreen = () => {
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
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Miraqua Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We collect information you provide directly to us, such as when you create an account, configure your irrigation settings, or contact us for support.
                  </p>
                  <div className="ml-4 space-y-2">
                    <p className="text-muted-foreground"><strong>Personal Information:</strong> Name, email address, phone number, and billing information.</p>
                    <p className="text-muted-foreground"><strong>Agricultural Data:</strong> Plot locations, crop types, soil conditions, and irrigation schedules.</p>
                    <p className="text-muted-foreground"><strong>Sensor Data:</strong> Soil moisture, temperature, humidity, and water flow measurements.</p>
                    <p className="text-muted-foreground"><strong>Usage Data:</strong> How you interact with our platform, including features used and time spent.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use the information we collect to provide, maintain, and improve our services:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Optimize irrigation schedules using AI algorithms</li>
                    <li>Provide real-time monitoring and alerts</li>
                    <li>Generate reports and analytics</li>
                    <li>Facilitate collaboration features</li>
                    <li>Provide customer support</li>
                    <li>Send service notifications and updates</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">3. Data Sharing and Disclosure</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>With your explicit consent</li>
                    <li>To service providers who assist in operating our platform</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">4. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. 
                    This includes encryption of data in transit and at rest, regular security audits, and access controls.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, 
                    and enforce our agreements. Agricultural and sensor data may be retained for longer periods to improve our AI algorithms and provide historical insights.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Object to or restrict certain processing</li>
                    <li>Data portability for your agricultural data</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">7. Cookies and Tracking</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. 
                    You can control cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">8. Third-Party Services</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform may integrate with third-party weather services, mapping providers, and smart home systems. These integrations are subject 
                    to the privacy policies of those respective services.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">9. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
                    If you become aware that a child has provided us with personal information, please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">10. Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page 
                    and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-3">11. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at privacy@miraqua.com or through our support portal.
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

export default PrivacyPolicyScreen;